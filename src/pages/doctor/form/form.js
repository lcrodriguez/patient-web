import React, { Component } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
} from 'reactstrap';
import MaskedInput from 'react-maskedinput';
import uuidV4 from 'uuid/v4';
import { graphql, compose } from 'react-apollo';
import config from '../../../config';
import AWS from 'aws-sdk';
import { Auth } from 'aws-amplify';
//import Email from '../../../components/SES/createTemplate'
import generator from 'generate-password';
import { Redirect } from 'react-router';
import Utils from "../../../library/utils";

//GrahpQL Query
import doctors from '../../../querys/list_doctor';
import clinics from '../../../querys/list_clinic';

//GrahpQL Mutations
import AddDoctor from '../../../mutation/addDoctor';
import UpdateDoctor from '../../../mutation/updateDoctor';

import Widget from '../../../components/Widget';

import s from '../Doctor.scss';

class FormDoctor extends Component {

  componentDidMount(){
    const currentLocation = location.pathname;
    if (currentLocation === '/app/doctor/update' && !localStorage.getItem('doctor_data')) this.props.history.push('/app/doctor/list');
    let myClinics = this.props.clinics_list;
    const keys = config.aws_keys;
    if (currentLocation === '/app/doctor/update' && localStorage.getItem('doctor_data')){
      const doctorData = JSON.parse(localStorage.getItem('doctor_data'));
      localStorage.removeItem('doctor_data');
      this.setState({
        clinics: myClinics,
        isEdition: true,
        inputs: {
          firstName: doctorData.first_name || '',
          lastName: doctorData.last_name || '',
          phone: doctorData.phone || '',
          email: doctorData.email || ''
        },
        doctor_id: doctorData.doctor_id
      });
    } else {
      this.setState({ clinics: myClinics });
    }
    //config credential aws-sdk
    AWS.config.update({ ...keys, region: Auth._config.region });
  }

  constructor(props) {
    super(props);

    this.state = {
      clinics: [],
      inputs: {
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
      },
      userRol: Utils.getRol(),
      doctor_id: null,
      isEdition: false,
      isAlertOpened: false,
      colorAlert: 'danger',
      response: null
    };
  }

  /**
   * Close alert
   */
  closeAlert(){
    setTimeout(() => { this.setState({ isAlertOpened: false, response: null }); }, 4000);
  }

  /**
   * Go to doctor list page
   */
  goToListDoctor(){
    this.props.history.push('/app/doctor/list');
  }

  /**
   * Change select value
   * @param {String} id
   * @param {String} name
   * @param {String} type
   */
  changeSelectValue(id, name, type) {
    let inputsValue = this.state.inputs;
    this.setState({
      inputs: {
        ...inputsValue,
        [type]: {
          id: id,
          name: name
        }
      }
    });
  }

  /**
   * Change input value
   * @param {Object} e
   * @param {String} type
   */
  changeInputValue(e, type) {
    let inputsValue = this.state.inputs;
    this.setState({
      inputs: {
        ...inputsValue,
        [type]: e.target.value
      }
    });
  }

  /**
   * Save doctor
   */
  async save(){
    const username = JSON.parse(localStorage.getItem('active_user')).username;
    const inputs = this.state.inputs;
    const password = generator.generate({ length: 10, numbers: true, symbols :true, uppercase : true, lowercase : true, strict: true });
    const myForm = {
      doctor_id: uuidV4(),
      user_id : username,
      first_name : inputs.firstName,
      last_name : inputs.lastName,
      email : inputs.email,
      phone : inputs.phone,
    }

    if (myForm.first_name && myForm.last_name && myForm.phone && myForm.email){
      try {
        const aws_info = {
          username: inputs.email,
          password: password,
          autoConfirmUser: true,
          attributes: {
            email: inputs.email,
            phone_number: inputs.phone.replace(/\s/g, '')
          }
        }

      Auth.signUp(aws_info).then(async response => {

          await this.props.addDoctor(myForm);

          this.ConfirmSingUp(inputs.email);

          this.AddUserToCognitoGroup(response);

          this.sendWelcomeMail(inputs.email,password);

          this.setState({
            isAlertOpened: true,
            colorAlert: 'success',
            response: "A new doctor was created successfully. We have sent a code to your doctor's inbox.",
            inputs: { firstName: '', lastName: '', phone: '', email: '' }
          });
          this.closeAlert();

        }).catch(err =>{
          this.setState({ colorAlert: 'danger', isAlertOpened: true, response: err.message });
          this.closeAlert();
        });

      } catch (err) {
        this.setState({ colorAlert: 'danger', isAlertOpened: true, response: err.message });
        this.closeAlert();
      }

    } else{
      this.setState({ isAlertOpened: true, colorAlert: 'danger', response: 'Please fill up all fields' });
      this.closeAlert();
    }
  }

  /**
   * Confirm user to congnito
   * @param {Object} resp
   */
  async ConfirmSingUp(user){

    const cognitoIdentityService = new AWS.CognitoIdentityServiceProvider();
    const params = { UserPoolId: 'us-east-1_xPTaXJykl', Username: user};


    cognitoIdentityService.adminConfirmSignUp(params , (e, r) => {
          console.log(r);
    });

  }

  /**
   * Add user to congnito doctor group
   * @param {Object} resp
   */
  async AddUserToCognitoGroup(resp){
    console.log(resp);
    try {
      //instance of new provider to cognito
      const cognitoIdentityService = new AWS.CognitoIdentityServiceProvider();
      const params = { UserPoolId: Auth.userPool.userPoolId, Username: resp.user.username };
      const paramsToGroup = { GroupName: 'Doctor', UserPoolId: Auth.userPool.userPoolId, Username: resp.userSub };

      //add to user pool in doctor group
      cognitoIdentityService.adminAddUserToGroup(paramsToGroup, (e, r) => {
        console.log(r);
      });
    } catch (err) {
      throw new error(err.message);
    }
  }

  /**
   * Welcome Mail with pass auto-generate
   */
  sendWelcomeMail(mailTo, password) {
    var params = {
        Destination: {
          CcAddresses: ['daniel.avila@nybblegroup.com',/* this.state.login*/ ],
          ToAddresses: ['daniel.avila@nybblegroup.com', /* this.state.login,*/ ]
        },
        Source: 'daniel.avila@nybblegroup.com', /* Mail origin */
        Template: 'Lyme_Welcome_Template',
        TemplateData: '{ \"password\":\"'+ password +'\" }',
        ReplyToAddresses: ['daniel.avila@nybblegroup.com' /* this.state.login,*/],
      };
      var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();
        sendPromise.then((data) => {
          console.log(data);
        }).catch((err) => {
          console.error(err, err.stack);
        });
      }

  /**
   * Edit current doctor
   */
  async edit(){
    const username = JSON.parse(localStorage.getItem('active_user')).username;
    const inputs = this.state.inputs;
    const myForm = {
      doctor_id: this.state.doctor_id,
      user_id : username,
      first_name : inputs.firstName,
      last_name : inputs.lastName,
      email : inputs.email,
      phone : inputs.phone,
    }
    if (myForm.first_name && myForm.last_name && myForm.phone && myForm.email){
      try {
        await this.props.updateDoctor(myForm);
        this.setState({
          isAlertOpened: true,
          colorAlert: 'success',
          response: "The doctor was updated successfully."
        });

        this.closeAlert();

      } catch (error) {
        this.setState({ colorAlert: 'danger', response: error.message });
        this.closeAlert();
      }

    } else{
      this.setState({ isAlertOpened: true, colorAlert: 'danger', response: 'Please fill up all fields' });
      this.closeAlert();
    }
  }

  render() {
    if (this.state.userRol != 'Admin') {
      return <Redirect to="/app/main" />
    }

    return (
      <div className={s.root}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item">YOU ARE HERE</li>
          {!this.state.isEdition ?
            <li className="active breadcrumb-item">Create Doctor</li>
            :
            <li className="active breadcrumb-item">Edit Doctor</li>
          }
        </ol>
        <h1 className="page-title">Doctor -
          {!this.state.isEdition ?
            <span className="fw-semi-bold">Create</span>
            :
            <span className="fw-semi-bold">Edition</span>
          }
        </h1>

        <Button onClick={() => {this.goToListDoctor()} } color="inverse" className={`width-300 mb-xs mr-xs ${s.posAbsoluteList}`}>Back to List</Button>
        <Row>
          {/* Horizontal form */}
          <Col lg={12} md={12}>
            <Widget>
              <Alert
                key={'al-4'} isOpen={this.state.isAlertOpened}
                color={this.state.colorAlert}>
                {this.state.response}
              </Alert>
              <FormGroup>
                <Form>
                  <legend>Fill up the form </legend>
                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      First Name
                    </Label>
                    <Col md={7}>
                      <Input
                        type="text"
                        id="normal-field"
                        placeholder="Introduce the first name"
                        onChange={(e) => this.changeInputValue(e, 'firstName')}
                        value={this.state.inputs.firstName}
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      Last Name
                    </Label>
                    <Col md={7}>
                      <Input
                        type="text"
                        id="normal-field"
                        placeholder="Introduce the last name"
                        onChange={(e) => this.changeInputValue(e, 'lastName')}
                        value={this.state.inputs.lastName}
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      Email
                    </Label>
                    <Col md={7}>
                      <Input
                        type="text"
                        id="normal-field"
                        placeholder="Introduce an email"
                        onChange={(e) => this.changeInputValue(e, 'email')}
                        value={this.state.inputs.email}
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      Phone
                      <span className="help-block">+375 123 456 789</span>
                    </Label>
                    <Col md={7}>
                      <MaskedInput
                        onChange={(e) => this.changeInputValue(e, 'phone')}
                        className="form-control" id="mask-int-phone"
                        mask="+111 111 111 111"
                        value={this.state.inputs.phone}
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row className="form-action">
                    <Label md={4} />
                    <Col md={7}>
                      {!this.state.isEdition ?
                        <Button onClick={(e) => this.save()} color="success" className="width-300 mb-xs mr-xs">Save Doctor</Button>
                        :
                        <Button onClick={(e) => this.edit()} color="success" className="width-300 mb-xs mr-xs">Update Doctor</Button>
                      }
                    </Col>
                  </FormGroup>
                </Form>
              </FormGroup>
            </Widget>
          </Col>
        </Row>

      </div>
    );
  }
}

const DoctorData = compose(
  graphql(clinics, {
    options: {
        fetchPolicy: 'network-only'
    },
    props: ({data}) => {
        return {
            loading: data.loading,
            clinics_list: data.list_clinic
        }
    }
  }),
  graphql(AddDoctor, {
      options: {
          errorPolicy: 'ignore',
          refetchQueries: [{ query: doctors }]
      },
      props: props => ({
          addDoctor: doctor => props.mutate({
              variables: doctor,
              optimisticResponse: {
                  __typename: 'Mutation',
                  addDoctor: { ...doctor,  __typename: 'Doctor' }
              }
          })
      })
  }),
  graphql(UpdateDoctor, {
    options: {
        errorPolicy: 'ignore',
        refetchQueries: [{ query: doctors }]
    },
    props: props => ({
        updateDoctor: doctor => props.mutate({
            variables: doctor,
            optimisticResponse: {
                __typename: 'Mutation',
                updateDoctor: { ...doctor,  __typename: 'Doctor' }
            }
        })
    })
}),
)(FormDoctor)

export default withStyles(s)(DoctorData);
