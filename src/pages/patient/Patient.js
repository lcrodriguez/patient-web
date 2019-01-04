import React, { Component } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  Button,
  Progress,
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Breadcrumb,
  BreadcrumbItem,
} from 'reactstrap';
import {
  BootstrapTable,
  TableHeaderColumn,
} from 'react-bootstrap-table';
import { graphql, compose, withApollo } from 'react-apollo';
import { connect } from 'react-redux';
//  GrahpQL Query
import patients from '../../querys/list_patient';
import getDoctor from '../../querys/getDoctor';

// Mutation
import DeletePatient from '../../mutation/deletePatient';

import Widget from '../../components/Widget';
import Utils from "../../library/utils";
import s from './Patient.scss';

class PatientList extends Component {

  async componentDidMount(){
    const rol = Utils.getRol();
    let queryResp = null;
    let patients = null;
    if (rol === 'Doctor'){
      queryResp = await this.props.client.query({
        query: getDoctor,
        variables: { 
          email: this.props.auth.email
        },
      });
      patients = queryResp.data.getDoctor.items[0].patients;
    } else {
      patients = this.props.patients_list;
    }

    this.setState({ patients: patients});
  }

  constructor(props) {
    super(props);

    this.state = {
      patients: [],
      showModal: false,
      showWarningModal: false,
      activeItem: null
    };
  }

  /**
   * Close confirmation modal
   */
  closeModal(){
    this.setState({ activeItem: null, showModal: false, showWarningModal: false });
  }

  /**
   * Go to patient creation page
   */
  goToCreatePatient(){
    this.props.history.push('/app/patient/create');
  }

  /**
   * Go to patient edition page
   * @param {Object} row
   */
  goToEditPatient(row){
    if (!row.protocols.length){
      this.setState({ showWarningModal: true });
      return;
    }
    localStorage.setItem('patient_data', JSON.stringify(row));
    this.props.history.push('/app/patient/update');
  }

  /**
   * Delete patient from list
   * @param {Object} row
   */
  openDeletePatientModal(row) {
    this.setState({ activeItem: row, showModal: true });
  }

  /**
   * Delete patient from list
   * @param {Object} row
   */
  async deletePatient() {
    await this.props.deletePatient({ patient_id: this.state.activeItem.patient_id });
    let data = [];
    this.state.patients.map((item, key) => data.push(item));
    data.splice(data.indexOf(this.state.activeItem), 1);
    this.setState({ activeItem: null, patients: data });
    this.closeModal();
  }

  buttonFormatter(cell, row) {
    return (
      <div>
        <Button onClick={() => {this.goToEditPatient(row)} } color="warning" className="width-300 mb-xs mr-xs">Edit</Button>
        <Button onClick={() => {this.openDeletePatientModal(row)} } color="danger" className="width-300 mb-xs mr-xs">Delete</Button>
      </div>
    );
  }

  renderSizePerPageDropDown = (props) => {
    const limits = [];
    props.sizePerPageList.forEach((limit) => {
      limits.push(<DropdownItem key={limit} onClick={() => props.changeSizePerPage(limit)}>{ limit }</DropdownItem>);
    });

    return (
      <Dropdown isOpen={props.open} toggle={props.toggleDropDown}>
        <DropdownToggle color="default" caret>
          { props.currSizePerPage }
        </DropdownToggle>
        <DropdownMenu>
          { limits }
        </DropdownMenu>
      </Dropdown>
    );
  };

  render() {
    const options = {
      sizePerPage: 10,
      paginationSize: 3,
      sizePerPageDropDown: this.renderSizePerPageDropDown,
    };

    return (
      <div>

        <Breadcrumb>
          <BreadcrumbItem>YOU ARE HERE</BreadcrumbItem>
          <BreadcrumbItem active>Patient List</BreadcrumbItem>
        </Breadcrumb>
        <Button onClick={() => {this.goToCreatePatient()} } color="success" className={`width-300 mb-xs mr-xs ${s.posAbsolute}`}>Create Patient</Button>
        <Widget>
          <BootstrapTable data={this.state.patients} version="4" pagination options={options} search tableContainerClass={`table-striped table-hover ${s.bootstrapTable}`}>
            <TableHeaderColumn dataField="first_name" dataSort>
              <span className="fs-sm">First Name</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="last_name">
              <span className="fs-sm">Last Name</span>
            </TableHeaderColumn>
            <TableHeaderColumn className="width-200" columnClassName="width-200" dataField="email" isKey>
              <span className="fs-sm">Email</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="phone">
              <span className="fs-sm">Phone</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="ssn">
              <span className="fs-sm">ssn</span>
            </TableHeaderColumn>
            <TableHeaderColumn className="width-150" columnClassName="width-150" dataFormat={this.buttonFormatter.bind(this)}>
              <span className="fs-sm">Actions</span>
            </TableHeaderColumn>
          </BootstrapTable>
        </Widget>

          <Modal isOpen={this.state.showModal}>
            <ModalHeader toggle={() => this.closeModal()}>Confirmation action</ModalHeader>
            <ModalBody className="bg-white">
              ¿Are you sure you want to delete this patient?
            </ModalBody>

            <ModalFooter>
              <Button color="success" onClick={() => this.closeModal()}>Close</Button>
              <Button color="danger" onClick={() => {this.deletePatient()} }>Delete</Button>
            </ModalFooter>
          </Modal>

          <Modal isOpen={this.state.showWarningModal}>
            <ModalHeader toggle={() => this.closeModal()}>Warning action</ModalHeader>
            <ModalBody className="bg-white">
              This patient has not a protocol assigned. Please assign him one to proceed in editing him.
            </ModalBody>

            <ModalFooter>
              <Button color="danger" onClick={() => this.closeModal()}>Close</Button>
            </ModalFooter>
          </Modal>
      </div>
    );
  }
}

const PatientData = compose(
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
  graphql(DeletePatient, {
      options: {
        errorPolicy: 'ignore',
        refetchQueries: [{ query: patients }]
      },
      props: props => ({
        deletePatient: patient => props.mutate({
          variables: patient,
          optimisticResponse: {
            __typename: 'Mutation',
            deletePatient: { ...patient,  __typename: 'Delete_Patient' }
          }
        })
      })
    }),
)(PatientList)

const mapStateToProps = state => ({
	auth: state.auth
});

export default connect(mapStateToProps, null)(withApollo(withStyles(s)(PatientData)));
