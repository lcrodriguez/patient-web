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

//GrahpQL Query
import clinics from '../../../querys/list_clinic';

//GrahpQL Mutations
import AddClinic from '../../../mutation/addClinic';
import UpdateClinic from '../../../mutation/updateClinic';

import Widget from '../../../components/Widget';

import s from '../Clinic.scss';

class FormClinic extends Component {

  componentDidMount(){
    const currentLocation = location.pathname;
    if (currentLocation === '/app/clinic/update' && !localStorage.getItem('clinic_data')) this.props.history.push('/app/clinic/list');
    if (currentLocation === '/app/clinic/update' && localStorage.getItem('clinic_data')){
      const clinicData = JSON.parse(localStorage.getItem('clinic_data'));
      localStorage.removeItem('clinic_data');
      this.setState({
        isEdition: true,
        inputs: {
          name: clinicData.name || '',
          address: clinicData.address || '',
          city: clinicData.city || '',
          state: clinicData.state || '',
          zip: clinicData.zip || '',
          phone: clinicData.phone || '',
          fax: clinicData.fax || '',
        },
        clinic_id: clinicData.clinic_id
      });
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      inputs: {
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        fax: '',
      },
      clinic_id: null,
      isEdition: false,
      activeItem: null,
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
   * Go to clinic list page
   */
  goToListClinic(){
    this.props.history.push('/app/clinic/list');
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
   * Save clinic
   */
  async save (){
    const inputs = this.state.inputs;
    const myForm = {
      clinic_id: uuidV4(),
      name: inputs.name,
      address: inputs.address,
      city: inputs.city,
      state: inputs.state,
      zip: inputs.zip,
      phone: inputs.phone,
      fax: inputs.fax,
    }

    if (myForm.name && myForm.address && myForm.city && myForm.state
      && myForm.zip && myForm.phone){
        myForm.phone = myForm.phone.replace(/\s/g, '');
        await this.props.addClinic(myForm);
        this.setState({
          isAlertOpened: true,
          colorAlert: 'success',
          response: 'A new clinic was created successfully',
          inputs: {
            name: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            phone: '',
          }
        });

        setTimeout(() => {
          this.setState({ isAlertOpened: false, response: null, activeItem: myForm });
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
   * Edit active clinic
   */
  async edit(){
    const inputs = this.state.inputs;
    const myForm = {
      clinic_id: this.state.clinic_id,
      name: inputs.name,
      address: inputs.address,
      city: inputs.city,
      state: inputs.state,
      zip: inputs.zip,
      phone: inputs.phone,
      fax: inputs.fax,
    }

    if (myForm.name && myForm.address && myForm.city && myForm.state
      && myForm.zip && myForm.phone){
      myForm.phone = myForm.phone.replace(/\s/g, '');
      try {
        await this.props.updateClinic(myForm);
        this.setState({
          isAlertOpened: true,
          colorAlert: 'success',
          response: "The Clinic was updated successfully."
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
          {!this.state.isEdition ?
            <li className="active breadcrumb-item">Create Clinic</li>
            :
            <li className="active breadcrumb-item">Edit Clinic</li>
          }
        </ol>
        <h1 className="page-title">Clinic -
          {!this.state.isEdition ?
            <span className="fw-semi-bold"> Create</span>
            :
            <span className="fw-semi-bold"> Edition</span>
          }
        </h1>

        <Button onClick={() => {this.goToListClinic()} } color="inverse" className={`width-300 mb-xs mr-xs ${s.posAbsoluteList}`}>Back to List</Button>
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
                <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      Name
                    </Label>
                    <Col md={7}>
                      <Input
                        type="text"
                        id="normal-field"
                        placeholder="Introduce the Clinic name"
                        onChange={(e) => this.changeInputValue(e, 'name')}
                        value={this.state.inputs.name}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      Address
                    </Label>
                    <Col md={7}>
                      <Input
                        type="text"
                        id="normal-field"
                        placeholder="Introduce the Clinic address"
                        onChange={(e) => this.changeInputValue(e, 'address')}
                        value={this.state.inputs.address}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      City
                    </Label>
                    <Col md={7}>
                      <Input
                        type="text"
                        id="normal-field"
                        placeholder="Introduce the Clinic city"
                        onChange={(e) => this.changeInputValue(e, 'city')}
                        value={this.state.inputs.city}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      State
                    </Label>
                    <Col md={7}>
                      <Input
                        type="text"
                        id="normal-field"
                        placeholder="Introduce the State"
                        onChange={(e) => this.changeInputValue(e, 'state')}
                        value={this.state.inputs.state}
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
                      Zip
                    </Label>
                    <Col md={7}>
                      <Input
                        type="text"
                        id="normal-field"
                        placeholder="Introduce a zip"
                        onChange={(e) => this.changeInputValue(e, 'zip')}
                        value={this.state.inputs.zip}
                      />
                    </Col>
                  </FormGroup>


                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      Fax
                      <span className="help-block">(123) 456-7890</span>
                    </Label>
                    <Col md="6" xs="12">
                      <MaskedInput
                        onChange={(e) => this.changeInputValue(e, 'fax')}
                        value={this.state.inputs.fax}
                        className="form-control" id="mask-phone" mask="(111) 111-1111"
                        size="10"
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup row className="form-action">
                    <Label md={4} />
                    <Col md={7}>
                      {!this.state.isEdition ?
                        <Button onClick={(e) => this.save()} color="success" className="width-300 mb-xs mr-xs">Save Clinic</Button>
                        :
                        <Button onClick={(e) => this.edit()} color="success" className="width-300 mb-xs mr-xs">Update Clinic</Button>
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

const ClinicData = compose(
  graphql(AddClinic, {
      options: {
          errorPolicy: 'ignore',
          refetchQueries: [{ query: clinics }]
      },
      props: props => ({
          addClinic: clinic => props.mutate({
              variables: clinic,
              optimisticResponse: {
                  __typename: 'Mutation',
                  addClinic: { ...clinic,  __typename: 'Clinic' }
              }
          })
      })
  }),
  graphql(UpdateClinic, {
    options: {
        errorPolicy: 'ignore',
        refetchQueries: [{ query: clinics }]
    },
    props: props => ({
        updateClinic: clinic => props.mutate({
            variables: clinic,
            optimisticResponse: {
                __typename: 'Mutation',
                updateClinic: { ...clinic,  __typename: 'Update_Clinic' }
            }
        })
    })
})
)(FormClinic)

export default withStyles(s)(ClinicData);
