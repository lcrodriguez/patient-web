import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect, withRouter } from 'react-router';
import { connect, Provider as ReduxProvider } from 'react-redux';

import Bundle from '../core/Bundle';

/* eslint-disable */
import loadErrorPage from 'bundle-loader?lazy!../pages/error';
/* eslint-enable */

import LayoutComponent from '../components/Layout';
import LoginComponent from '../pages/login';
import {
  LOGIN_SUCCESS,
} from '../actions/user';
import { Auth } from 'aws-amplify';
import ErrorPage from '../pages/error/ErrorPage';

const ErrorPageBundle = Bundle.generateBundle(loadErrorPage);


const ContextType = {
  // Enables critical path CSS rendering
  // https://github.com/kriasoft/isomorphic-style-loader
  insertCss: PropTypes.func.isRequired,
  // Universal HTTP client
  fetch: PropTypes.func.isRequired,
  // Integrate Redux
  // http://redux.js.org/docs/basics/UsageWithReact.html
  ...ReduxProvider.childContextTypes,
};

// let isAuthenticated = function() {
//   let t = jwt.verify(cookie.load('id_token'), auth.jwt.secret);
//
//   console.log(t);
//
//   return true;
// };


const PrivateRoute = ({ component, isAuthenticated, ...rest }) => ( // eslint-disable-line
  <Route
    {...rest} render={props => (
    isAuthenticated ? (
      React.createElement(component, props)
    ) : (
      <Redirect
        to={{
          pathname: '/login',
          state: { from: props.location }, // eslint-disable-line
        }}
      />
    )
  )}
  />
);

class App extends React.PureComponent {

  componentDidMount() {
    const myUser = localStorage.getItem('active_user') ? 
      JSON.parse(localStorage.getItem('active_user')) : null;

    if (myUser) {
      Auth.currentAuthenticatedUser()
      .then(user => {
        this.props.dispatch({
          type: LOGIN_SUCCESS,
          isFetching: false,
          isAuthenticated: true,
          id_token: myUser.id_token,
          username: myUser.username,
          email: myUser.email
        });
        this.setState({ isReady: true });
      })
      .catch(err => {
        this.setState({ isReady: true });
        console.log(err)
      });
    } else {
      this.setState({ isReady: true });
    }
  }

  static propTypes = {
    context: PropTypes.shape(ContextType),
    store: PropTypes.any, // eslint-disable-line
    isAuthenticated: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    context: null,
  };


  static contextTypes = {
    router: PropTypes.any,
    store: PropTypes.any,
  };

  static childContextTypes = ContextType;

  constructor(){
    super()

    this.state = {
      isReady: false
    }
  }

  getChildContext() {
    // fixme. find better solution?
    return this.props.context || this.context.router.staticContext;
  }

  render() {
    if (!this.state.isReady) return null;

    return (
      <Switch>
        <Route path="/" exact render={() => <Redirect to="/app/main" />} />
        <Route path="/app" exact render={() => <Redirect to="/app/main" />} />
        <PrivateRoute isAuthenticated={this.props.isAuthenticated} path="/app" component={LayoutComponent} />
        <Route path="/login" exact component={LoginComponent} />
        <Route component={ErrorPage} />
      </Switch>
    );
  }
}

function mapStateToProps(store) {
  return {
    isAuthenticated: store.auth.isAuthenticated,
  };
}

export default withRouter(connect(mapStateToProps)(App));
