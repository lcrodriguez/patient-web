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
import uuidV4 from 'uuid/v4';
import { graphql, compose } from 'react-apollo';
import TextareaAutosize from 'react-autosize-textarea';
import config from '../../../config';
import { Auth } from 'aws-amplify';
//GrahpQL Query
import doctors from '../../../querys/list_doctor';
import patients from '../../../querys/list_patient';
import protocols from '../../../querys/list_protocol';
import buckets from '../../../querys/list_take_bucket';
import medicines from '../../../querys/list_medicine';
import takes from '../../../querys/list_take';

//GrahpQL Mutations
import AddTake from '../../../mutation/addTake';
import AddProtocol from '../../../mutation/addProtocol';
import UpdatePatient from '../../../mutation/updatePatient';

import Widget from '../../../components/Widget';
import Utils from "../../../library/utils";

import s from '../Take.scss';

class FormTake extends Component {

  componentDidMount(){
    let myDoctors = this.props.doctors_list || [];
    let myPatients = this.props.patients_list || [];
    let myBuckets = this.props.buckets_list || [];
    let myProtocols = this.props.protocols_list || [];
    let myMedicines = this.props.medicines_list || [];
    const keys = config.aws_keys;

    this.setState({
      doctors: myDoctors,
      patients: myPatients,
      buckets: myBuckets,
      protocols: myProtocols,
      medicines: myMedicines,
      userRol: Utils.getRol()
    });
    AWS.config.update({ ...keys, region: Auth._config.region });

  }

  constructor(props) {
    super(props);

    this.state = {
      doctors: [],
      patients: [],
      protocols: [],
      buckets: [],
      medicines: [],
      inputs: {
        doctor: {
          id: null,
          name: 'Select a doctor'
        },
        protocol: {
          protocol_id: null,
          doctor_id: null,
          patient_id: null,
          description: null,
          protocol_code: null,
          name: 'Select a protocol'
        },
        patient: {
          id: null,
          name: 'Select a patient'
        },
        bucket: {
          id: null,
          name: 'Select a bucket'
        },
        medicine: {
          id: null,
          name: 'Select a medicine'
        },
        description: '',
        quantity: '',
        quantity_explained: '',
        notes: ''
      },
      isAlertOpened: false,
      colorAlert: 'danger',
      response: null
    };
  }

  /**
   * Go to take list page
   */
  goToListTake(){
    this.props.history.push('/app/take/list');
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
    const re = /^[0-9\b]+$/;
    let inputsValue = this.state.inputs;
    if (type === 'quantity'){
      if (e.target.value === '' || re.test(e.target.value)){
        this.setState({
          inputs: {
            ...inputsValue,
            [type]: e.target.value
          }
        });
      }
      return;
    }

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
        CcAddresses: [ 'carlos.rodriguez@nybblegroup.com',/* this.state.login*/ ],
        ToAddresses: [ 'carlos.rodriguez@nybblegroup.com', /* this.state.login,*/ ]
      },
      Source: 'carlos.rodriguez@nybblegroup.com', /* Mail origin */
      Template: 'Patient_Code_2' ,
      TemplateData: '{ \"protocol_code\":\"'  +   protocolCode  + '\" }',
      ReplyToAddresses: ['carlos.rodriguez@nybblegroup.com' /* this.state.login,*/],
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
   * Save take
   */
  async save (){
    const username = Utils.getUsername();
    const inputs = this.state.inputs;
    //const protocolCode =  Math.floor(100000 + Math.random() * 900000);

    const myForm = {
      take_id: uuidV4(),
      protocol_id : '1e6ccdda-3e23-4eb7-9c06-89100cb92389',
      doctor_id : (this.state.getRol === 'Admin') ? inputs.doctor.id : username,
      patient_id : inputs.patient.id,
      take_bucket_id : inputs.bucket.id,
      medicine_id : inputs.medicine.id,
      repeat: inputs.repeat,
      description: inputs.description,
      quantity: parseInt(inputs.quantity),
      quantity_explained: inputs.quantity + ' ' + inputs.medicine.unity,
      notes: inputs.notes
    }

    if (myForm.protocol_id && myForm.doctor_id && myForm.patient_id && myForm.medicine_id && myForm.repeat &&
      myForm.take_bucket_id && myForm.quantity ){

        await this.props.addTake(myForm);

        // this.sendProtocolCodeMail(inputs.patient.email,protocolCode);
        // await this.props.updatePatient(myPatientForm);
        this.refreshState();
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
   * Refresh state
   */
  refreshState(){
    this.setState({
      isAlertOpened: true,
      colorAlert: 'success',
      response: 'A new take was created successfully',
      inputs: {
        doctor: {
          id: null,
          name: 'Select a doctor'
        },
        protocol: {
          protocol_id: null,
          doctor_id: null,
          patient_id: null,
          description: null,
          protocol_code: null,
          name: 'Select a protocol'
        },
        patient: {
          id: null,
          name: 'Select a patient'
        },
        bucket: {
          id: null,
          name: 'Select a bucket'
        },
        medicine: {
          id: null,
          name: 'Select a medicine'
        },
        repeat: '',
        description: '',
        quantity: '',
        quantity_explained: '',
        notes: ''
      }
    });
  }

  render() {
    return (
      <div className={s.root}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item">YOU ARE HERE</li>
          <li className="active breadcrumb-item">Create Take</li>
        </ol>
        <h1 className="page-title">Take - <span className="fw-semi-bold">Create</span>
        </h1>

        <Button onClick={() => {this.goToListTake()} } color="inverse" className={`width-300 mb-xs mr-xs ${s.posAbsoluteList}`}>Back to List</Button>
        <Row>
          {/* Horizontal form */}
          <Col lg={12} md={12}>
            <Widget>
              <Alert
                key={'al-4'} isOpen={this.state.isAlertOpened}
                color={this.state.colorAlert}
                            >
                {this.state.response}
              </Alert>
              <FormGroup>
                <Form>
                  <legend>Fill up the form </legend>
                {/*
                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">Select a protocol</Label>
                    <Col md="8">
                      <UncontrolledButtonDropdown id="simple-big-select">
                        <DropdownToggle
                          caret color="default" size="md"
                          className="dropdown-toggle-split mr-xs ">
                          <span className="mr-5"> {this.state.inputs.protocol.description}</span>
                        </DropdownToggle>
                        <DropdownMenu>
                          {this.state.protocols.map((item, key) =>
                            <DropdownItem
                              key={key}
                              onClick={(e) => this.changeSelectValue(item.protocol_id, item.description, 'protocol')}   >
                              {item.description}
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </UncontrolledButtonDropdown>
                    </Col>
                  </FormGroup>*/}
                  {this.state.userRol === 'Admin' ?
                      <FormGroup row>
                        <Label for="normal-field" md={4} className="text-md-right">Select a doctor</Label>
                        <Col md="8">
                          <UncontrolledButtonDropdown id="simple-big-select">
                            <DropdownToggle
                              caret color="default" size="md"
                              className="dropdown-toggle-split mr-xs ">
                              <span className="mr-5"> {this.state.inputs.doctor.name}</span>
                            </DropdownToggle>
                            <DropdownMenu>
                              {this.state.doctors.map((item, key) =>
                                <DropdownItem
                                  key={key}
                                  onClick={(e) => this.changeSelectValue(item.doctor_id, `${item.first_name} ${item.last_name}`, 'doctor')}   >
                                  {item.first_name} {item.last_name}
                                </DropdownItem>
                              )}
                            </DropdownMenu>
                          </UncontrolledButtonDropdown>
                        </Col>
                      </FormGroup>
                    :
                    null
                  }

                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">Select a patient</Label>
                    <Col md="8">
                      <UncontrolledButtonDropdown id="simple-big-select">
                        <DropdownToggle
                          caret color="default" size="md"
                          className="dropdown-toggle-split mr-xs ">
                          <span className="mr-5"> {this.state.inputs.patient.name}</span>
                        </DropdownToggle>
                        <DropdownMenu>
                          {this.state.patients.map((item, key) =>
                            <DropdownItem
                              key={key}
                              onClick={(e) => this.changeSelectValue(item.patient_id, `${item.first_name} ${item.last_name}`, 'patient')}   >
                              {item.first_name} {item.last_name}
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </UncontrolledButtonDropdown>
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">Select a bucket</Label>
                    <Col md="8">
                      <UncontrolledButtonDropdown id="simple-big-select">
                        <DropdownToggle
                          caret color="default" size="md"
                          className="dropdown-toggle-split mr-xs ">
                          <span className="mr-5"> {this.state.inputs.bucket.name}</span>
                        </DropdownToggle>
                        <DropdownMenu>
                          {this.state.buckets.map((item, key) =>
                            <DropdownItem
                              key={key}
                              onClick={(e) => this.changeSelectValue(item.take_bucket_id, item.description, 'bucket')}   >
                              {item.description}
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </UncontrolledButtonDropdown>
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">Select a medicine</Label>
                    <Col md="8">
                      <UncontrolledButtonDropdown id="simple-big-select">
                        <DropdownToggle
                          caret color="default" size="md"
                          className="dropdown-toggle-split mr-xs ">
                          <span className="mr-5"> {this.state.inputs.medicine.name}</span>
                        </DropdownToggle>
                        <DropdownMenu>
                          {this.state.medicines.map((item, key) =>
                            <DropdownItem
                              key={key}
                              onClick={(e) => this.changeSelectValue(item.medicine_id, item.description, 'medicine')}   >
                              {item.description}
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </UncontrolledButtonDropdown>
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      Repeat
                    </Label>
                    <Col md={7}>
                      <Input
                        type="text"
                        id="normal-field"
                        placeholder="Introduce a repeat"
                        onChange={(e) => this.changeInputValue(e, 'repeat')}
                        value={this.state.inputs.repeat}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      Description
                    </Label>
                    <Col md={7}>
                      <TextareaAutosize
                        rows={3}
                        id="elastic-textarea"
                        onChange={(e) => this.changeInputValue(e, 'description')}
                        value={this.state.inputs.description}
                        placeholder="Introduce a Description"
                        className={`form-control ${s.autogrow} transition-height`}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      Quantity
                    </Label>
                    <Col md={7}>
                      <Input
                        type="text"
                        id="normal-field"
                        placeholder="Introduce a quantity"
                        onChange={(e) => this.changeInputValue(e, 'quantity')}
                        value={this.state.inputs.quantity}
                      />
                    </Col>
                  </FormGroup>
{/*
                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      Quantity Explained
                    </Label>
                    <Col md={7}>
                     <TextareaAutosize
                        rows={3}
                        id="elastic-textarea"
                        onChange={(e) => this.changeInputValue(e, 'quantity_explained')}
                        value={this.state.inputs.quantity_explained}
                        placeholder="Introduce a quantity explained"
                        className={`form-control ${s.autogrow} transition-height`}
                      />
                    </Col>
                  </FormGroup>
*/}
                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      Notes
                    </Label>
                    <Col md={7}>
                      <TextareaAutosize
                        rows={3}
                        id="elastic-textarea"
                        onChange={(e) => this.changeInputValue(e, 'notes')}
                        value={this.state.inputs.notes}
                        placeholder="Introduce a note"
                        className={`form-control ${s.autogrow} transition-height`}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup row className="form-action">
                    <Label md={4} />
                    <Col md={7}>
                      <Button onClick={(e) => this.save()} color="success" className="width-300 mb-xs mr-xs">Save Take</Button>
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

const TakeData = compose(
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
  graphql(patients, {
    options: {
      fetchPolicy: 'network-only'
    },
    props: ({data}) => {
      return {
        loading: data.loading,
        patients_list: data.list_patient
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
  graphql(buckets, {
    options: {
      fetchPolicy: 'network-only'
    },
    props: ({data}) => {
      return {
        loading: data.loading,
        buckets_list: data.list_take_bucket
      }
    }
  }),
  graphql(medicines, {
    options: {
      fetchPolicy: 'network-only'
    },
    props: ({data}) => {
      console.log(data);
      return {
        loading: data.loading,
        medicines_list: data.list_medicine
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
  graphql(UpdatePatient, {
    options: {
        errorPolicy: 'ignore',
        refetchQueries: [{ query: takes }]
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
  graphql(AddTake, {
      options: {
          errorPolicy: 'ignore',
          refetchQueries: [{ query: takes }]
      },
      props: props => ({
        addTake: take => props.mutate({
          variables: take,
          optimisticResponse: {
            __typename: 'Mutation',
            addTake: { ...take,  __typename: 'Take' }
          }
        })
      })
  })
)(FormTake)

export default withStyles(s)(TakeData);
