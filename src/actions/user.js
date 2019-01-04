import { Auth } from 'aws-amplify';
import { graphql } from 'react-apollo';
import getDoctor from '../querys/getDoctor';
import jwtDecode from 'jwt-decode';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';


function requestLogin(creds) {
  return {
    type: LOGIN_REQUEST,
    isFetching: true,
    isAuthenticated: false,
    creds,
  };
}

export function receiveLogin(user) {
  return {
    type: LOGIN_SUCCESS,
    isFetching: false,
    isAuthenticated: true,
    id_token: user.id_token,
    username: user.username,
    email: user.email
  };
}

function loginError(message) {
  return {
    type: LOGIN_FAILURE,
    isFetching: false,
    isAuthenticated: false,
    message,
  };
}

function requestLogout() {
  return {
    type: LOGOUT_REQUEST,
    isFetching: true,
    isAuthenticated: true,
  };
}

export function receiveLogout() {
  return {
    type: LOGOUT_SUCCESS,
    isFetching: false,
    isAuthenticated: false,
  };
}

// Logs the user out
export function logoutUser() {
  return (dispatch) => {
    dispatch(requestLogout());
    localStorage.removeItem('active_user');
    dispatch(receiveLogout());
  };
}

export function loginUser(creds, client) {
  return (dispatch) => {
    Auth.signIn(creds.login, creds.password)
    .then(async user => {
      const active_user = {
        id_token: user.signInUserSession.idToken.jwtToken,
        username: user.username,
        email: null
      }

      const decodedToken = jwtDecode(active_user.id_token);
      const rol = decodedToken['cognito:groups'][0];
      if (rol === 'Doctor') {
       const query = await client.query({
          query: getDoctor,
          variables: { 
            email: decodedToken.email
          },
        });
        active_user.username = query.data.getDoctor.items[0].doctor_id;
      }

      active_user.email = decodedToken.email;
      localStorage.setItem('active_user', JSON.stringify(active_user));
      dispatch(receiveLogin(active_user));
    })
    .catch(err => {
      console.log(err);
      dispatch(loginError(err.message));
    })
  };
}


// Template method
export function loginUser2(creds) {
  const config = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    credentials: 'include',
    body: `login=${creds.login}&password=${creds.password}`,
  };

  return (dispatch) => {
    // We dispatch requestLogin to kickoff the call to the API
    dispatch(requestLogin(creds));

    return fetch('/login', config)
      .then(response =>
        response.json().then(user => ({ user, response })),
      ).then(({ user, response }) => { // eslint-disable-line
        if (!response.ok) {
          // If there was a problem, we want to
          // dispatch the error condition
          dispatch(loginError(user.message));
          return Promise.reject(user);
        }
        // in posts create new action and check http status, if malign logout
        // If login was successful, set the token in local storage
        localStorage.setItem('id_token', user.id_token);
          // Dispatch the success action
        dispatch(receiveLogin(user));
      }).catch(err => console.log('Error: ', err)); // eslint-disable-line
  };
}
