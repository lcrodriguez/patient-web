import React, { Component } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  Button,
  Progress,
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
  Breadcrumb,
  BreadcrumbItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import {
  BootstrapTable,
  TableHeaderColumn,
} from 'react-bootstrap-table';
import { graphql, compose, withApollo } from 'react-apollo';

//GrahpQL Query
import medicines from '../../querys/list_medicine';
import DeleteMedicine from '../../mutation/deleteMedicine';
import getMedicineById from '../../querys/getMedicineById';

import Widget from '../../components/Widget';
import { Redirect } from 'react-router';
import Utils from "../../library/utils";

import s from './Medicine.scss';
import * as images from '../../images';

class MedicineList extends Component {

  componentDidMount(){
    let myMedicines = this.props.medicines_list;
    this.setState({ medicines: myMedicines});
  }

  constructor(props) {
    super(props);

    this.state = {
      medicines: [],
      userRol: Utils.getRol(),
      showModal: false,
      showWarningModal: false,
      warningMessage: 'This medicine is assigned to a patient. Please unassign it before to delete.'
    };
  }

  /**
   * Close confirmation modal
   */
   closeModal(){
     this.setState({ activeItem: null, showModal: false, showWarningModal: false });
   }

  /**
   * Go to medicine creation page
   */
  goToCreateMedicine(){
    this.props.history.push('/app/medicine/create');
  }

  /**
   * Go to medicine edition page
   * @param {Object} row
   */
  goToEditMedicine(row){
    localStorage.setItem('medicine_data', JSON.stringify(row));
    this.props.history.push('/app/medicine/update');
  }

  /**
   * Delete medicine from list
   * @param {Object} row
   */
  openDeleteMedicineModal(row){
    this.setState({ activeItem: row, showModal: true });
  }


  /**
   * Check medicine assignation
   */
  async checkMedicineAssignation(){
    try {
      const queryResp = await this.props.client.query({
        query: getMedicineById,
        variables: {
          medicine_id: this.state.activeItem.medicine_id
        },
      });

      const medicines = queryResp.data.getMedicineById.items;
      let cond = false;
      medicines.map(item =>{
        if (item.medicine_id){
          cond = true;
        }
      });
      if (cond) {
        this.setState({ showWarningModal: true, warningMessage: 'This medicine is assigned to a patient. Please unassign it before to delete.' });
        return;
      }
      this.deleteMedicine();
    } catch (error) {
      this.setState({ warningMessage: 'An error has ocurred during deletion. Please try again.' });
    }
  }


  /**
   * Delete medicine from list
   * @param {Object} row
   */
  async deleteMedicine(){
    await this.props.deleteMedicine({ medicine_id: this.state.activeItem.medicine_id });
    let data = [];
    this.state.medicines.map((item, key) => data.push(item));
    data.splice(data.indexOf(this.state.activeItem), 1);
    this.setState({ activeItem: null, medicines: data });
    this.closeModal();
  }


  buttonFormatter(cell, row) {
    return (
      <div>
        <Button onClick={() => {this.goToEditMedicine(row)} } color="warning" className="width-300 mb-xs mr-xs">Edit</Button>
        <Button onClick={() => {this.openDeleteMedicineModal(row)} } color="danger" className="width-300 mb-xs mr-xs">Delete</Button>
      </div>

    );
  }

  iconFormatter(cell, row) {
    return (
      <div>
        <img style={{ width: 28 }} src={`${images[cell]}`} alt="..." />
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
          <BreadcrumbItem active>Medicine List</BreadcrumbItem>
        </Breadcrumb>
        <Button onClick={() => {this.goToCreateMedicine()} } color="success" className={`width-300 mb-xs mr-xs ${s.posAbsolute}`}>Create Medicine</Button>
        <Widget>
          <BootstrapTable data={this.state.medicines} version="4" pagination options={options} search tableContainerClass={`table-striped table-hover ${s.bootstrapTable}`}>

            <TableHeaderColumn className="width-200" dataFormat={this.iconFormatter} columnClassName="width-200" dataField="icon" isKey>
            <span className="fs-sm">Icon</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="name" dataSort>
              <span className="fs-sm">Medicine</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="dosage" >
              <span className="fs-sm">Dosage</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="unity" >
              <span className="fs-sm">Unity</span>
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
            ¿Are you sure you want to delete this medicine?
          </ModalBody>

          <ModalFooter>
            <Button color="success" onClick={() => this.closeModal()}>Close</Button>
            <Button color="danger" onClick={() => {this.checkMedicineAssignation()} }>Delete</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.showWarningModal}>
          <ModalHeader toggle={() => this.closeModal()}>Warning action</ModalHeader>
          <ModalBody className="bg-white">
            {this.state.warningMessage}
          </ModalBody>

          <ModalFooter>
            <Button color="danger" onClick={() => this.closeModal()}>Close</Button>
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
  graphql(DeleteMedicine, {
    options: {
      errorPolicy: 'ignore',
      refetchQueries: [{ query: medicines }]
    },
    props: props => ({
      deleteMedicine: medicine => props.mutate({
        variables: medicine,
        optimisticResponse: {
          __typename: 'Mutation',
          deleteMedicine: { ...medicine,  __typename: 'Medicine' }
        }
      })
    })
  }),
)(MedicineList)

export default withApollo(withStyles(s)(MedicineData));
