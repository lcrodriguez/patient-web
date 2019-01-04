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
import { graphql, compose } from 'react-apollo';

//GrahpQL Query
import clinics from '../../querys/list_clinic';
import DeleteClinic from '../../mutation/deleteClinic';

import Widget from '../../components/Widget';

import s from './Clinic.scss';

class ClinicList extends Component {

  componentDidMount(){
    let myClinics = this.props.clinics_list;
    this.setState({ clinics: myClinics });
  }

  constructor(props) {
    super(props);

    this.state = {
      clinics: []
    };
  }

  /**
   * Close confirmation modal
   */
  closeModal(){
    this.setState({ activeItem: null, showModal: false });
  }

  /**
   * Go to clinic creation page
   */
  goToCreateClinic(){
    this.props.history.push('/app/clinic/create');
  }

  /**
   * Go to clinic edition page
   * @param {Object} row
   */
  goToEditClinic(row){
    localStorage.setItem('clinic_data', JSON.stringify(row));
    this.props.history.push('/app/clinic/update');
  }

  /**
   * Delete clinic from list
   * @param {Object} row
   */
  openDeleteClinicModal(row){
    this.setState({ activeItem: row, showModal: true });
  }

  /**
   * Delete clinic from list
   * @param {Object} row
   */
  async deleteClinic(){
    await this.props.deleteClinic({ clinic_id: this.state.activeItem.clinic_id });
    let data = [];
    this.state.clinics.map((item, key) => data.push(item));
    data.splice(data.indexOf(this.state.activeItem), 1);
    this.setState({ activeItem: null, clinics: data });
    this.closeModal();
  }

  buttonFormatter(cell, row) {
    return (
      <div>
        <Button onClick={() => {this.goToEditClinic(row)} } color="warning" className="width-300 mb-xs mr-xs">Edit</Button>
        <Button onClick={() => {this.openDeleteClinicModal(row)} } color="danger" className="width-300 mb-xs mr-xs">Delete</Button>
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
          <BreadcrumbItem active>Clinic List</BreadcrumbItem>
        </Breadcrumb>
        <Button onClick={() => {this.goToCreateClinic()} } color="success" className={`width-300 mb-xs mr-xs ${s.posAbsolute}`}>Create Clinic</Button>
        <Widget>
          <BootstrapTable data={this.state.clinics} version="4" pagination options={options} search tableContainerClass={`table-striped table-hover ${s.bootstrapTable}`}>
            <TableHeaderColumn dataField="name" dataSort>
              <span className="fs-sm">Clinic</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="address">
              <span className="fs-sm">Addres</span>
            </TableHeaderColumn>
            <TableHeaderColumn className="width-200" columnClassName="width-200" dataField="city" isKey>
              <span className="fs-sm">City</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="state">
              <span className="fs-sm">State</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="phone">
              <span className="fs-sm">Phone</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="zip">
              <span className="fs-sm">Zip</span>
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
            ¿Are you sure you want to delete this clinic?
          </ModalBody>

          <ModalFooter>
            <Button color="success" onClick={() => this.closeModal()}>Close</Button>
            <Button color="danger" onClick={() => {this.deleteClinic()} }>Delete</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

const ClinicData = compose(
  graphql(clinics, {
      options: {
          fetchPolicy: 'network-only'
      },
      props: ({data}) => {
        console.log(data);
          return {
              loading: data.loading,
              clinics_list: data.list_clinic
          }
      }
  }) ,
   graphql(DeleteClinic, {
      options: {
        errorPolicy: 'ignore',
        refetchQueries: [{ query: clinics }]
      },
      props: props => ({
        deleteClinic: clinic => props.mutate({
          variables: clinic,
          optimisticResponse: {
            __typename: 'Mutation',
            deleteClinic: { ...clinic,  __typename: 'Clinic' }
          }
        })
      })
    }),
)(ClinicList)

export default withStyles(s)(ClinicData);
