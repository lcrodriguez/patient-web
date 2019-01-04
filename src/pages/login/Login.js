import React from 'react';
import {
  Container,
  Alert,
  FormGroup,
  Input,
  Label,
  Modal,
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import Widget from '../../components/Widget';
import s from './Login.scss';
import { loginUser } from '../../actions/user';
import ReactCodeInput from 'react-code-input';
import { Auth } from 'aws-amplify';
import { withApollo } from 'react-apollo';

class Login extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      inputCodeStyling: {
        inputStyle: {
          fontFamily: 'monospace',
          margin: '4px',
          MozAppearance: 'textfield',
          width: '70px',
          borderRadius: '3px',
          fontSize: '18px',
          height: '45px',
          paddingLeft: '7px',
          color: 'dark',
          border: '1px solid lightskyblue',
          textAlign: 'center'
        }
      },
      disabledBtn: false,
      login: '',
      password: '',
      inviteCode: '',
      isCodeAlertOpened: false,
      errorCodeMessage: null
    };

    this.doLogin = this.doLogin.bind(this);
    this.changeLogin = this.changeLogin.bind(this);
    this.changePassword = this.changePassword.bind(this);
  }

  /**
   * Close confirmation modal
   */
  closeModal(){
    this.setState({ showModal: false });
  }

  /**
   * Open code modal
   */
  openCodeModal(row){
    this.setState({ showModal: true });
  }

  /**
   * Close code alert
   */
  closeCodeAlert(){
    setTimeout(() => { this.setState({ isCodeAlertOpened: false, errorCodeMessage: null }); }, 4000);
  }

  changeLogin(event) {
    this.setState({ login: event.target.value });
  }

  changePassword(event) {
    this.setState({ password: event.target.value });
  }

  doLogin(e) {
    this.setState({ disabledBtn: true });
    this.props.dispatch(loginUser({ login: this.state.login, password: this.state.password }, this.props.client));
    setTimeout(() => {
      this.setState({ disabledBtn: false });
    }, 5000);
    e.preventDefault();
  }

  /**
   * Send code to server
   */
  /* sendCode() {
    console.log(1);
    const inviteCode = this.state.inviteCode;
    if (!inviteCode || (inviteCode && inviteCode.length < 5)){
      this.setState({ isCodeAlertOpened: true, errorCodeMessage: 'Please fill up all fields.' });
      this.closeCodeAlert();
    }

    Auth.confirmSignUp(this.state.login, this.state.inviteCode)
        .then((response) => {
            this.sendWelcomeMail();
            this.props.navigation.dispatch(resetAction)

        })
        .catch(err => this.setState({errorMessage: err.message}))

  }
  */

  updatePassword() {
    Auth.changePassword(
      'danii.avila@live.com',
      'Lyme308',
      'Lyme309!'
      )
      .then(data => this.props.navigation.dispatch(resetAction))
      .catch(err => this.setState({errorMessage: err.message}))
  }


completeNewPassword() {
  Auth.forgotPasswordSubmit(
    this.state.login,
    this.state.password,
    )
    .then(data => this.props.navigation.dispatch(resetAction))
    .catch(err => this.setState({errorMessage: err.message}))
}

  // forgotPasswordSubmit() {
  //     Auth.forgotPasswordSubmit(
  //         this.state.login,
  //         this.state.inviteCode,
  //         this.state.password
  //         )
  //         .then(data => this.props.navigation.dispatch(resetAction))
  //         .catch(err => this.setState({errorMessage: err.message}))
  //}

  /**
   * Code change event
   * @param {String} code
   */
  codeChange(code){
    this.setState({ inviteCode: code });
  }

  render() {
    const { from } = this.props.location.state || { from: { pathname: '/app' } }; // eslint-disable-line

    // cant access login page while logged in
    if (this.props.isAuthenticated) { // eslint-disable-line
      return (
        <Redirect to={from} />
      );
    }

    return (
      <div className={s.root}>
        <Container>
          <h5 className={`${s.logo}`}>
            <i className="fa fa-circle text-gray" />
            Lyme Patient
            <i className="fa fa-circle text-warning" />
          </h5>
          <Widget className={`${s.widget} mx-auto`} title={<h3 className="mt-0">Login</h3>}>
            {/* eslint-disable
            <p className={s.widgetLoginInfo}>
              Introduce your <a href="#" onClick={() => this.openCodeModal()} className={s.linkInvite}>Invite code</a>
            </p>
            {/* eslint-disable */}
            <form className="mt" onSubmit={this.doLogin}>
              {
                this.props.errorMessage && ( // eslint-disable-line
                  <Alert key={'al-3'} className="alert-sm" color={'warning'}>
                    {this.props.errorMessage}
                  </Alert>
                )
              }
              <div className="form-group">
                <input className="form-control no-border" value={this.state.login} onChange={this.changeLogin} type="text" required name="login" placeholder="Email" />
              </div>
              <div className="form-group">
                <input className="form-control no-border" value={this.state.password} onChange={this.changePassword} type="password" required name="password" placeholder="Password" />
              </div>
              <div className="clearfix">
                <div className="btn-toolbar float-right">
                  <button type="submit" href="/app" className="btn btn-inverse btn-sm" disabled={this.state.disabledBtn}>{this.props.isFetching ? 'Loading...' : 'Enter'}</button>
                </div>
              </div>

              <div className="row no-gutters mt-3">
                <div className="col =">
                  <FormGroup className="abc-checkbox float-right" check>
                    <Input id="checkbox1" type="checkbox" />{' '}
                    <Label className="fw-normal" for="checkbox1" check>
                      Keep me signed in
                    </Label>
                  </FormGroup>
                </div>
              </div>
            </form>
          </Widget>

          {/* Code Modal */}
          <Modal isOpen={this.state.showModal}>
            <ModalHeader toggle={() => this.closeModal()}>Please insert your invite code below</ModalHeader>
            <ModalBody className="bg-white">
              <Alert key={'al-4'} isOpen={this.state.isCodeAlertOpened} color={'danger'} className="alert-sm">
                {this.state.errorCodeMessage}
              </Alert>
              <div className="form-group">
                <input className="form-control no-border" value={this.state.login} onChange={this.changeLogin} type="text" required name="login" placeholder="Email" />
              </div>

              <ReactCodeInput type='number' fields={6} onChange={(e) => this.codeChange(e) } {...this.state.inputCodeStyling}/>

              <div className="form-group">
                <input className="form-control no-border" value={this.state.password} onChange={this.changePassword} type="password" required name="password" placeholder="Password" />
              </div>
            </ModalBody>

            <ModalFooter>
              <Button color="success" onClick={() => this.sendCode()}>Confirm</Button>
              <Button color="danger" onClick={() => this.updatePassword()}>Update Pass</Button>
              <Button color="danger" onClick={() => this.closeModal()}>Close</Button>
            </ModalFooter>
          </Modal>
        </Container>
        <footer className={s.footer}>
          2018 &copy; Nybble Group.
        </footer>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isFetching: state.auth.isFetching,
    isAuthenticated: state.auth.isAuthenticated,
    errorMessage: state.auth.errorMessage,
  };
}

export default withApollo(withRouter(connect(mapStateToProps)(withStyles(s)(Login))));
