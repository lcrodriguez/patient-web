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
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import uuidV4 from 'uuid/v4';
import { graphql, compose } from 'react-apollo';
import TextareaAutosize from 'react-autosize-textarea';
import MedicineIcons from '../icons';
import ColorPicker from 'rc-color-picker';
//GrahpQL Query
import medicines from '../../../querys/list_medicine';
import clinics from '../../../querys/list_clinic';

//GrahpQL Mutations
import AddMedicine from '../../../mutation/addMedicine';
import UpdateMedicine from '../../../mutation/updateMedicine';

import Widget from '../../../components/Widget';
import { Redirect } from 'react-router';
import Utils from "../../../library/utils";

import s from '../Medicine.scss';
import * as images from '../../../images';

class FormMedicine extends Component {

  componentDidMount(){
    const currentLocation = location.pathname;
    if (currentLocation === '/app/medicine/update' && !localStorage.getItem('medicine_data')) this.props.history.push('/app/medicine/list');
    let myClinics = this.props.clinics_list;
    if (currentLocation === '/app/medicine/update' && localStorage.getItem('medicine_data')){
      const medicineData = JSON.parse(localStorage.getItem('medicine_data'));
      localStorage.removeItem('medicine_data');
      this.setState({
        clinics: myClinics,
        isEdition: true,
        inputs: {
          name: medicineData.name || '',
          description: medicineData.description || '',
          icon: medicineData.icon || '',
          unity: medicineData.unity || '',
          color: medicineData.color || '',
          dosage: medicineData.dosage || ''
        },
        medicine_id: medicineData.medicine_id
      });
    } else {
      this.setState({ clinics: myClinics });
    }
  }

  constructor(props) {
    super(props);

    this.selectIcon = this.selectIcon.bind(this);
    this.changeColorValue = this.changeColorValue.bind(this);
    this.changeColorInput = this.changeColorInput.bind(this);

    this.state = {
      clinics: [],
      inputs: {
        name: '',
        description: '',
        icon: '',
        unity: 'Select a unity',
        color: 'Select a color',
        dosage:''
      },
      unities: [
        { name: 'mg'},
        { name: 'drops'},
        { name: 'tablets'},
        { name: 'mcg'},
        { name: 'capsule'},
        { name: 'sprays'},
        { name: 'ui'},
        { name: 'cap'},
        { name: 'ml'},
        { name: 'tsp'}
      ],
      medicine_id:'',
      isAlertOpened: false,
      colorAlert: 'danger',
      isEdition: false,
      showModal: false,
      response: null,
      colorpickerValue: '#ff0000',
      colorpickerInputValue: '#ff0000',
      userRol: Utils.getRol()
    };

  }

  /**
   * Close alert
   */
  closeAlert(){
    setTimeout(() => { this.setState({ isAlertOpened: false, response: null }); }, 4000);
  }

  /**
   * Close icons modal
   */
  closeModal(){
    this.setState({ showModal: false });
  }

  /**
   * Open icons modal
   */
  openIconModal(){
    this.setState({ showModal: true });
  }

  /**
   * Select icon from modal
   */
  selectIcon(type){
    const inputs = this.state.inputs;
    this.setState({ inputs: { ...inputs, icon: type } });
    this.closeModal();
  }


  /**
   * Change Color Value
   */
  changeColorValue(colors) {
    this.setState({
      colorpickerValue: colors.color,
      colorpickerInputValue: colors.color,
    });
  }

  /**
   * Change Color Input
   */
  changeColorInput(e) {
    if (e.target.value.length > 3 && e.target.value.length < 8) {
      this.setState({
        colorpickerInputValue: e.target.value,
        colorpickerValue: e.target.value,
      });
    }
    if (e.target.value.length <= 3) {
      this.setState({
        colorpickerInputValue: e.target.value,
      });
    }
  }

  /**
   * Go to medicine list page
   */
  goToListMedicine(){
    this.props.history.push('/app/medicine/list');
  }

  /**
   * Change select value
   * @param {String} name
   * @param {String} type
   */
  changeSelectValue(value, type) {
    let inputsValue = this.state.inputs;
    this.setState({
      inputs: {
        ...inputsValue,
        [type]: value
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
   * Save medicine
   */
  async save (){
    const inputs = this.state.inputs;
    const myForm = {
      medicine_id: uuidV4(),
      name: inputs.name,
      description: inputs.description,
      icon: inputs.icon,
      unity: inputs.unity,
      dosage: inputs.dosage
    }

    if (myForm.name &&  myForm.description && myForm.icon && myForm.unity != 'Select a Unity'){
        await this.props.addMedicine(myForm);
        this.setState({
          isAlertOpened: true,
          colorAlert: 'success',
          response: 'A new medicine was created successfully',
          inputs: {
            name: '',
            description: '',
            icon: '',
            unity: '',
            color:'',
            dosage:''
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
   * Edit current doctor
   */
  async edit(){
    const username = JSON.parse(localStorage.getItem('active_user')).username;
    const inputs = this.state.inputs;
    const myForm = {
      medicine_id: this.state.medicine_id,
      name: inputs.name,
      description: inputs.description,
      icon: inputs.icon,
      unity: inputs.unity,
      dosage: inputs.dosage
    }
    if (myForm.name &&  myForm.description && myForm.icon && myForm.unity != 'Select a Unity'){
      try {
        await this.props.updateMedicine(myForm);
        this.setState({
          isAlertOpened: true,
          colorAlert: 'success',
          response: "The medicine was updated successfully."
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
            <li className="active breadcrumb-item">Create Medicine</li>
            :
            <li className="active breadcrumb-item">Edit Medicine</li>
          }
        </ol>
        <h1 className="page-title">Medicine -
          {!this.state.isEdition ?
            <span className="fw-semi-bold">Create</span>
            :
            <span className="fw-semi-bold">Edition</span>
          }
        </h1>

        <Button onClick={() => {this.goToListMedicine()} } color="inverse" className={`width-300 mb-xs mr-xs ${s.posAbsoluteList}`}>Back to List</Button>
        <Row>
          {/* Horizontal form */}
          <Col lg={12} md={12}>
            <Widget>
              <Alert key={'al-4'} isOpen={this.state.isAlertOpened}  color={this.state.colorAlert} >
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
                        placeholder="Introduce the Medicine Name"
                        onChange={(e) => this.changeInputValue(e, 'name')}
                        value={this.state.inputs.name}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      Unity
                    </Label>
                      <Col md="8">
                        <UncontrolledButtonDropdown>
                          <DropdownToggle
                            caret color="default"
                            className="dropdown-toggle-split mr-xs" >
                            {this.state.inputs.unity}
                          </DropdownToggle>
                          <DropdownMenu>
                            {this.state.unities.map((item, key) =>
                              <DropdownItem
                                key={key}
                                onClick={(e) => this.changeSelectValue(item.name, 'unity')}>
                                {item.name}
                              </DropdownItem>
                            )}
                          </DropdownMenu>
                        </UncontrolledButtonDropdown>
                      </Col>
                    </FormGroup>

                    <FormGroup row>
                          <Label for="normal-field" md={4} className="text-md-right">
                            Dosage
                          </Label>
                          <Col md={7}>
                            <Input
                              type="text"
                              id="normal-field"
                              placeholder="Introduce the Medicine Dosage"
                              onChange={(e) => this.changeInputValue(e, 'dosage')}
                              value={this.state.inputs.dosage}
                            />
                          </Col>
                    </FormGroup>

                    <FormGroup row>
                      <Label for="normal-field" md={4} className="text-md-right">
                        Icon
                      </Label>
                      <Col md={7}>
                        <Button onClick={(e) => this.openIconModal()} color="default" className="width-100 mb-xs mr-xs">
                          {!this.state.inputs.icon ?   <span>Choose</span>
                            :
                              <img style={{ width: 25 }} src={images[this.state.inputs.icon]} alt="..." />
                          }
                        </Button>
                      </Col>
                    </FormGroup>

                    {/*
                    <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                      Icon Color
                    </Label>
                    <Col md={7}>
                        <InputGroup id="colorpicker">
                          <Input
                            type="text" onChange={this.changeColorInput} id="colorpickeri"
                            value={this.state.colorpickerInputValue}
                          />
                          <InputGroupAddon>
                            <ColorPicker
                              animation="slide-up"
                              color={this.state.colorpickerValue}
                              onChange={this.changeColorValue}
                            />
                          </InputGroupAddon>
                        </InputGroup>
                      </Col>
                    </FormGroup>
                    */}
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

                 <FormGroup row className="form-action">
                    <Label md={4} />
                    <Col md={7}>
                      {!this.state.isEdition ?
                          <Button onClick={(e) => this.save()} color="success" className="width-300 mb-xs mr-xs">Save Medicine</Button>
                        :
                          <Button onClick={(e) => this.edit()} color="success" className="width-300 mb-xs mr-xs">Update Medicine</Button>
                      }
                    </Col>
                  </FormGroup>
                </Form>
              </FormGroup>
            </Widget>
          </Col>
        </Row>

        {/* Confirmation Modal */}
        <Modal size="lg" isOpen={this.state.showModal}>
          <ModalHeader toggle={() => this.closeModal()}>Select an icon</ModalHeader>
          <ModalBody className="bg-white">
            <MedicineIcons selectIcon={this.selectIcon} />
          </ModalBody>

          <ModalFooter>
            <Button color="success" onClick={() => this.closeModal()}>Close</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

const MedicineData = compose(
  graphql(medicines, {
      options: {
          fetchPolicy: 'network-only'
      },
      props: ({data}) => {
          return {
              loading: data.loading,
              medicines_list: data.list_medicine
          }
      }
  }),
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
  graphql(AddMedicine, {
      options: {
          errorPolicy: 'ignore',
          refetchQueries: [{ query: medicines }]
      },
      props: props => ({
          addMedicine: medicine => props.mutate({
              variables: medicine,
              optimisticResponse: {
                  __typename: 'Mutation',
                  addMedicine: { ...medicine,  __typename: 'Medicine' }
              }
          })
      })
  }),
  graphql(UpdateMedicine, {
    options: {
        errorPolicy: 'ignore',
        refetchQueries: [{ query: medicines }]
    },
    props: props => ({
        updateMedicine: medicine => props.mutate({
            variables: medicine,
            optimisticResponse: {
                __typename: 'Mutation',
                updateMedicine: { ...medicine,  __typename: 'Medicine' }
            }
        })
    })
}),
)(FormMedicine)

export default withStyles(s)(MedicineData);
