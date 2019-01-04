import React, { Component } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  Button,
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
import { graphql, compose } from 'react-apollo';

//GrahpQL
import doctors from '../../querys/list_doctor';
import DeleteDoctor from '../../mutation/deleteDoctor';

import Widget from '../../components/Widget';
import { Redirect } from 'react-router';
import Utils from "../../library/utils";

import s from './Doctor.scss';

class DoctorList extends Component {

  componentDidMount(){
    let myDoctors = this.props.doctors_list;
    this.setState({ doctors: myDoctors});
  }

  constructor(props) {
    super(props);

    this.state = {
      doctors: [],
      activeItem: null,
      showModal: false,
      userRol: Utils.getRol()
    };
  }

  /**
   * Close confirmation modal
   */
  closeModal(){
    this.setState({ activeItem: null, showModal: false });
  }

  /**
   * Go to doctor creation page
   */
  goToCreateDoctor(){
    this.props.history.push('/app/doctor/create');
  }

  /**
   * Go to doctor edition page
   * @param {Object} row
   */
  goToEditDoctor(row){
    localStorage.setItem('doctor_data', JSON.stringify(row));
    this.props.history.push('/app/doctor/update');
  }

  /**
   * Delete doctor from list
   * @param {Object} row
   */
  openDeleteDoctorModal(row) {
    this.setState({ activeItem: row, showModal: true });
  }

  /**
   * Delete doctor from list
   * @param {Object} row
   */
  async deleteDoctor(){
    await this.props.deleteDoctor({ doctor_id: this.state.activeItem.doctor_id });
    let data = [];
    this.state.doctors.map((item, key) => data.push(item));
    data.splice(data.indexOf(this.state.activeItem), 1);
    this.setState({ activeItem: null, doctors: data });
    this.closeModal();
  }

  buttonFormatter(cell, row) {
    return (
      <div>
        <Button onClick={() => {this.goToEditDoctor(row)} } color="warning" className="width-300 mb-xs mr-xs">Edit</Button>
        <Button onClick={() => {this.openDeleteDoctorModal(row)} } color="danger" className="width-300 mb-xs mr-xs">Delete</Button>
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

    if (this.state.userRol != 'Admin') {
      return <Redirect to="/app/main" />
    }

    return (
      <div>
        <Breadcrumb>
          <BreadcrumbItem>YOU ARE HERE</BreadcrumbItem>
          <BreadcrumbItem active>Doctor List</BreadcrumbItem>
        </Breadcrumb>
        <Button onClick={() => {this.goToCreateDoctor()} } color="success" className={`width-300 mb-xs mr-xs ${s.posAbsolute}`}>Create Doctor</Button>
        <Widget>
          <BootstrapTable data={this.state.doctors} version="4" pagination options={options} search tableContainerClass={`table-striped table-hover ${s.bootstrapTable}`}>
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
            <TableHeaderColumn className="width-150" columnClassName="width-150" dataFormat={this.buttonFormatter.bind(this)}>
              <span className="fs-sm">Actions</span>
            </TableHeaderColumn>
          </BootstrapTable>
        </Widget>

        {/* Confirmation Modal */}
        <Modal isOpen={this.state.showModal}>
          <ModalHeader toggle={() => this.closeModal()}>Confirmation action</ModalHeader>
          <ModalBody className="bg-white">
            ¿Are you sure you want to delete this doctor?
          </ModalBody>

          <ModalFooter>
            <Button color="success" onClick={() => this.closeModal()}>Close</Button>
            <Button color="danger" onClick={() => {this.deleteDoctor()} }>Delete</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

const DoctorData = compose(
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
  graphql(DeleteDoctor, {
    options: {
      errorPolicy: 'ignore',
      refetchQueries: [{ query: doctors }]

    },
    props: props => ({
      deleteDoctor: doctor => props.mutate({
        variables: doctor,
        optimisticResponse: {
          __typename: 'Mutation',
          deleteDoctor: { ...doctor,  __typename: 'Delete_Doctor' }
        }
      })
    })
  }),
)(DoctorList)

export default withStyles(s)(DoctorData);
