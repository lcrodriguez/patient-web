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
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from 'reactstrap';

import MaskedInput from 'react-maskedinput';
import ReactMde, { ReactMdeCommands } from 'react-mde';
import uuidV4 from 'uuid/v4';
import { graphql, compose } from 'react-apollo';
import config from '../../../config';
import { Auth } from 'aws-amplify';
import AWS from 'aws-sdk';
import generator from 'generate-password';

//GrahpQL Query
import patients from '../../../querys/list_patient';
import doctors from '../../../querys/list_doctor';
import protocols from '../../../querys/list_protocol';

//GrahpQL Mutations
import AddPatient from '../../../mutation/addPatient';
import UpdatePatient from '../../../mutation/updatePatient';

import AddProtocol from '../../../mutation/addProtocol';

import Widget from '../../../components/Widget';

import s from '../Patient.scss';

class FormPatient extends Component {

  componentDidMount(){
    const currentLocation = location.pathname;
    if (currentLocation === '/app/patient/update' && !localStorage.getItem('patient_data')) this.props.history.push('/app/patient/list');
    let myDoctors = this.props.doctors_list;
    let myProtocols= this.props.protocols_list;
    const keys = config.aws_keys;
    if (currentLocation === '/app/patient/update' && localStorage.getItem('patient_data')){
      const patientData = JSON.parse(localStorage.getItem('patient_data'));
      localStorage.removeItem('patient_data');
      this.setState({
        doctors: myDoctors,
        protocols: myProtocols,
        isEdition: true,
        inputs: {
          doctor: {
            id: patientData.protocols[0].doctor.doctor_id,
            firstName: `${patientData.protocols[0].first_name} ${patientData.protocols[0].last_name}`
          },
          protocol: {
            id: patientData.protocols[0].protocol_id,
            protocol_code: patientData.protocols[0].protocol_code,
            description : patientData.protocols[0].description,

          },
          firstName: patientData.first_name || '',
          lastName: patientData.last_name || '',
          phone: patientData.phone || '',
          email: patientData.email || '',
          ssn: patientData.ssn || ''
        },
        protocol_code: patientData.protocols[0].protocol_code,
        patient_id: patientData.patient_id
      });
    } else {
      this.setState({ doctors: myDoctors });
      this.setState({ protocols: myProtocols });
    }
    AWS.config.update({ ...keys, region: Auth._config.region });
  }


  constructor(props) {
    super(props);

    this.state = {
      doctors: [],
      protocols: [],
      inputs: {
        doctor: {
          id: null,
          firstName: 'Select a doctor'
        },
        protocol: {
            id: null,
            protocol_code: null,
            description: 'Select a Protocol'
          },
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        ssn: ''
      },
      protocol_code: null,
      patient_id: null,
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
   * Go to patient list page
   */
  goToListPatient(){
    this.props.history.push('/app/patient/list');
  }

  /**
   * Change select value
   * @param {String} id
   * @param {String} name
   * @param {String} type
   */
  changeSelectValue(id, firstName, type) {
    let inputsValue = this.state.inputs;
    this.setState({
      inputs: {
        ...inputsValue,
        [type]: {
          id: id,
          firstName: firstName
        }
      }
    });
  }

  /**
   * Change select value
   * @param {String} id
   * @param {String} name
   * @param {String} type
   */
  changeSelectValue2(protocol_id, description,protocol_code , type) {
    let inputsValue = this.state.inputs;
    this.setState({
      inputs: {
        ...inputsValue,
        [type]: {
          protocol_id: protocol_id,
          protocol_code: protocol_code,
          description: description
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
   * Send Protocole Code
   */
  sendProtocolCodeMail(mailTo, protocolCode) {
    console.log('send mail');
    var params = {
      Destination: {
        CcAddresses: [ 'daniel.avila@nybblegroup.com',/* this.state.login*/ ],
        ToAddresses: [ 'daniel.avila@nybblegroup.com', /* this.state.login,*/ ]
      },
      Source: 'daniel.avila@nybblegroup.com', /* Mail origin */
      Template: 'Lyme_Protocol_Template' ,
      TemplateData: '{ \"protocol\":\"'  +   protocolCode  + '\" }',
      ReplyToAddresses: ['daniel.avila@nybblegroup.com' /* this.state.login,*/],
    };
    var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();
      sendPromise.then(function(data) {
      console.log(data);
    }).catch(
      function(err) {
      console.error(err, err.stack);
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
      const paramsToGroup = { GroupName: 'Patient', UserPoolId: Auth.userPool.userPoolId, Username: resp.userSub };

      //add to user pool in doctor group
      cognitoIdentityService.adminAddUserToGroup(paramsToGroup, (e, r) => {
        console.log(r);
      });
    } catch (err) {
      throw new error(err.message);
    }
  }

  /**
   * Save patient
   */
  async save (){
    const username = JSON.parse(localStorage.getItem('active_user')).username;
    const protocolCode =  Math.floor(100000 + Math.random() * 900000);
    const inputs = this.state.inputs;
    const patientID= uuidV4();


    username.getIdentityPoolRoles( 'us-east-1:16471eed-7226-4d16-84d0-b44beaf5ed51', function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

    const myForm = {
      patient_id: patientID,
      doctor_id: username,
      user_id : username,
      first_name : inputs.firstName,
      last_name : inputs.lastName,
      email : inputs.email,
      phone : inputs.phone,
      ssn : inputs.ssn
    }

    const myProtocolsForm = {
      protocol_id: inputs.protocol.protocol_id,
      doctor_id: inputs.doctor.id,
      patient_id: patientID,
      description: inputs.protocol.description + 'copy',
      protocol_code: protocolCode
    }

    if (myForm.first_name && myForm.last_name && myForm.email && myForm.doctor_id && myForm.phone && myForm.ssn){
        myForm.phone = inputs.phone.replace(/\s/g, '');

        await this.props.addPatient(myForm);
        await this.sendProtocolCodeMail(inputs.email,protocolCode);

      //  this.AddUserToCognitoGroup(response);

        this.setState({
          isAlertOpened: true,
          colorAlert: 'success',
          response: 'A new patient was created successfully',
          inputs: {
            doctor: {
              id: null,
              firstName: 'Select a doctor'
            },
            protocol: {
                id: null,
                protocol_code: null,
                description: 'Select a Protocol'
              },
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            ssn: ''
          }
        });

        setTimeout(() => {
          this.setState({ isAlertOpened: false, response: null });
        }, 3000);

    } else{
      this.setState({
        isAlertOpened: true,
        colorAlert: 'danger',
        response: 'Please fill up all fields'
      });

      setTimeout(() => {
        this.setState({ isAlertOpened: false, response: null });
      }, 3000);
    }
  }

  /**
   * Edit current patient
   */
  async edit(){
    const username = JSON.parse(localStorage.getItem('active_user')).username;
    const inputs = this.state.inputs;
    const myForm = {
      patient_id: this.state.patient_id,
      doctor_id: inputs.doctor.id,
      user_id : username,
      protocol_code: this.state.protocol_code,
      first_name : inputs.firstName,
      last_name : inputs.lastName,
      email : inputs.email,
      phone : inputs.phone,
      ssn : inputs.ssn
    }

    if (myForm.first_name && myForm.last_name && myForm.email && myForm.doctor_id && myForm.phone && myForm.ssn){
      try {
        myForm.phone = inputs.phone.replace(/\s/g, '');
        await this.props.updatePatient(myForm);
        this.setState({
          isAlertOpened: true,
          colorAlert: 'success',
          response: "The patient was updated successfully."
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
    return (
      <div className={s.root}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item">YOU ARE HERE</li>
          <li className="active breadcrumb-item">Create Patient</li>
        </ol>
        <h1 className="page-title">Patient - <span className="fw-semi-bold">Create</span>
        </h1>

        <Button onClick={() => {this.goToListPatient()} } color="inverse" className={`width-300 mb-xs mr-xs ${s.posAbsoluteList}`}>Back to List</Button>
        <Row>
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
            {/*    <FormGroup row>
                  <Label for="normal-field" md={4} className="text-md-right">Select a Doctor</Label>
                  <Col md="8">
                    <UncontrolledButtonDropdown id="simple-big-select">
                      <DropdownToggle
                        caret color="default" size="md"
                        className="dropdown-toggle-split mr-xs " >
                        <span className="mr-5"> {this.state.inputs.doctor.firstName}</span>
                      </DropdownToggle>
                      <DropdownMenu>
                        {this.state.doctors.map((item, key) =>
                          <DropdownItem
                            key={key}
                            onClick={(e) => this.changeSelectValue(item.doctor_id, `${item.first_name} ${item.last_name}`, 'doctor')}>
                            {item.first_name} {item.last_name}
                          </DropdownItem>
                        )}
                      </DropdownMenu>
                    </UncontrolledButtonDropdown>
                  </Col>
                </FormGroup>  */}

                {/*    <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">Select a Protocol</Label>
                    <Col md="8">
                      <UncontrolledButtonDropdown id="simple-big-select">
                        <DropdownToggle
                          caret color="default" size="md"
                          className="dropdown-toggle-split mr-xs " >
                          <span className="mr-5"> {this.state.inputs.protocol.description}</span>
                        </DropdownToggle>
                        <DropdownMenu>
                          {this.state.protocols.map((item, key) =>
                            <DropdownItem
                              key={key}
                              onClick={(e) => this.changeSelectValue2(item.protocol_id, item.description,item.protocol_code, 'protocol')}>
                              {item.description}
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </UncontrolledButtonDropdown>
                    </Col>
                  </FormGroup> */}

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
                      Phone
                      <span className="help-block">+375 123 456 789</span>
                    </Label>
                    <Col md="6" xs="12">
                      <MaskedInput
                        onChange={(e) => this.changeInputValue(e, 'phone')}
                        className="form-control" id="mask-int-phone"
                        mask="+111 111 111 111"
                        value={this.state.inputs.phone}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      SSN
                    </Label>
                    <Col md={7}>
                      <Input
                        type="text"
                        id="normal-field"
                        placeholder="Introduce a ssn"
                        onChange={(e) => this.changeInputValue(e, 'ssn')}
                        value={this.state.inputs.ssn}
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

                  <FormGroup row className="form-action">
                    <Label md={4} />
                    <Col md={7}>
                    {!this.state.isEdition ?
                      <Button onClick={(e) => this.save()} color="success" className="width-300 mb-xs mr-xs">Save Patient</Button>
                      :
                      <Button onClick={(e) => this.edit()} color="success" className="width-300 mb-xs mr-xs">Update Patient</Button>
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

const PatientData = compose(
  graphql(doctors, {
    options: {
        fetchPolicy: 'network-only'
    },
    props: ({data}) => {
      return {
        loading: data.loading,
        doctors_list: data.list_doctor
      }
    }
  }),
  graphql(protocols, {
    options: {
        fetchPolicy: 'network-only'
    },
    props: ({data}) => {
      return {
        loading: data.loading,
        protocols_list: data.list_protocol
      }
    }
  }),
  graphql(AddProtocol, {
      options: {
          errorPolicy: 'ignore'
      },
      props: props => ({
        addProtocol: protocol => props.mutate({
          variables: protocol,
          optimisticResponse: {
            __typename: 'Mutation',
            addProtocol: { ...protocol,  __typename: 'Protocol' }
          }
        })
      })
  }),
  graphql(AddPatient, {
      options: {
          errorPolicy: 'ignore',
          refetchQueries: [{ query: patients }]
      },
      props: props => ({
          addPatient: patient => props.mutate({
              variables: patient,
              optimisticResponse: {
                  __typename: 'Mutation',
                  addPatient: { ...patient,  __typename: 'Patient' }
              }
          })
      })
  }),
  graphql(UpdatePatient, {
    options: {
        errorPolicy: 'ignore',
        refetchQueries: [{ query: patients }]
    },
    props: props => ({
        updatePatient: patient => props.mutate({
            variables: patient,
            optimisticResponse: {
                __typename: 'Mutation',
                updatePatient: { ...patient,  __typename: 'Patient' }
            }
        })
    })
}),
)(FormPatient)

export default withStyles(s)(PatientData);
