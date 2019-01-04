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
import { graphql, compose, withApollo } from 'react-apollo';

//GrahpQL Query
import protocols from '../../querys/list_protocol';
import getProtocolById from '../../querys/getProtocolById';
import DeleteProtocol from '../../mutation/deleteProtocol';

import Widget from '../../components/Widget';

import s from './Protocol.scss';

class ProtocolList extends Component {

  componentDidMount(){
    let myProtocols = this.props.protocols_list;
    this.setState({ protocols: myProtocols});
  }

  constructor(props) {
    super(props);

    this.state = {
      protocols: [],
      showModal: false,
      showWarningModal: false,
      warningMessage: 'This protocol is assigned to a patient. Please unassign it before to delete.'
    };
  }

  /**
   * Close confirmation modal
   */
  closeModal(){
    this.setState({ activeItem: null, showModal: false, showWarningModal: false });
  }

  /**
   * Go to protocol creation page
   */
  goToCreateProtocol(){
    this.props.history.push('/app/protocol/create');
  }


  /**
   * Go to protocol edition page
   * @param {Object} row
   */
  goToEditProtocol(row){
    localStorage.setItem('protocol_data', JSON.stringify(row));
    this.props.history.push('/app/protocol/update');
  }
  /**
   * Delete protocol from list
   * @param {Object} row
   */
  async openDeleteProtocolModal(row) {
    this.setState({ activeItem: row, showModal: true });
  }

  async checkProtocolAssignation(){
    if (!this.state.activeItem.takes.length){
      this.deleteProtocol();
      return;
    }

    try {
      const queryResp = await this.props.client.query({
        query: getProtocolById,
        variables: {
          protocol_id: this.state.activeItem.protocol_id
        },
      });

      const protocols = queryResp.data.getProtocolById.items;
      let cond = false;
      protocols.map(item =>{
        if (item.patient){
          cond = true;
        }
      });
      if (cond) {
        this.setState({ showWarningModal: true, warningMessage: 'This protocol is assigned to a patient. Please unassign it before to delete.' });
        return;
      }
      this.deleteProtocol();
    } catch (error) {
      this.setState({ warningMessage: 'An error has ocurred during deletion. Please try again.' });
    }
  }

  /**
   * Delete protocol from list
   * @param {Object} row
   */
  async deleteProtocol(){
    await this.props.deleteProtocol({ protocol_id: this.state.activeItem.protocol_id });
    let data = [];
    this.state.protocols.map((item, key) => data.push(item));
    data.splice(data.indexOf(this.state.activeItem), 1);
    this.setState({ activeItem: null, protocols: data });
    this.closeModal();
  }


  buttonFormatter(cell, row) {
    return (
      <div>
        <Button onClick={() => {this.goToEditProtocol(row)} } color="warning" className="width-300 mb-xs mr-xs">Edit</Button>
        <Button onClick={() => {this.openDeleteProtocolModal(row)} } color="danger" className="width-300 mb-xs mr-xs">Delete</Button>
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

    function patientFormat(row){
      if (row){
        return <span>{row.first_name} {row.last_name}</span>
      }else {
        return <span>No patient assigned</span>
      }
    }

    function doctorFormat(row){
      if (row){
        return <span>{row.first_name} {row.last_name}</span>
      }else {
        return <span>No doctor assigned</span>
      }
    }

    function protocolFormat(row){
      if (row){
        return <span>{row.description}</span>
      }else {
        return <span>No Protocol assigned</span>
      }
    }


    return (
      <div>
        <Breadcrumb>
          <BreadcrumbItem>YOU ARE HERE</BreadcrumbItem>
          <BreadcrumbItem active>Protocol List</BreadcrumbItem>
        </Breadcrumb>
        <Button onClick={() => {this.goToCreateProtocol()} } color="success" className={`width-300 mb-xs mr-xs ${s.posAbsolute}`}>Create Protocol</Button>
        <Widget>
          <BootstrapTable data={this.state.protocols} version="4" pagination options={options} search tableContainerClass={`table-striped table-hover ${s.bootstrapTable}`}>

            <TableHeaderColumn dataField="doctor" dataFormat={doctorFormat}>
              <span className="fs-sm">Doctor Name</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="patient" dataFormat={patientFormat}>
              <span className="fs-sm">Patient Name</span>
            </TableHeaderColumn>

            <TableHeaderColumn className="width-200" columnClassName="width-200" dataField="description" isKey>
              <span className="fs-sm">description</span>
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
              ¿Are you sure you want to delete this protocol?
            </ModalBody>

            <ModalFooter>
              <Button color="success" onClick={() => this.closeModal()}>Close</Button>
              <Button color="danger" onClick={() => {this.checkProtocolAssignation()} }>Delete</Button>
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

const ProtocolData = compose(
  graphql(protocols, {
      options: {
          fetchPolicy: 'network-only'
      },
      props: ({data}) => {
        console.log('protocolo :' + data);
          return {
              loading: data.loading,
              protocols_list: data.list_protocol
          }
      }
  }),
  graphql(DeleteProtocol, {
      options: {
        errorPolicy: 'ignore',
        refetchQueries: [{ query: protocols }]
      },
      props: props => ({
        deleteProtocol: protocol => props.mutate({
          variables: protocol,
          optimisticResponse: {
            __typename: 'Mutation',
            deleteProtocol: { ...protocol,  __typename: 'Delete_Protocol' }
          }
        })
      })
    }),
)(ProtocolList)

export default withApollo(withStyles(s)(ProtocolData));
