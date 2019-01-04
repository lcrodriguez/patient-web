import jwtDecode from 'jwt-decode';

const Utils = {
  /**
   * Return user role
   */
  getRol() {
    const token = this.decodeUserToken();
    return token['cognito:groups'][0];
  },

  /**
   * Decode user token
   */
  decodeUserToken() {
    return jwtDecode(JSON.parse(localStorage.getItem('active_user')).id_token);
  },

  /**
   * Return username
   */
  getUsername() {
    return JSON.parse(localStorage.getItem('active_user')).username;
  }
}

export default Utils;
