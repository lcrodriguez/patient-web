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

//GrahpQL Query
import takes from '../../querys/list_take';
import DeleteTake from '../../mutation/deleteTake';

import Widget from '../../components/Widget';

import s from './Take.scss';

class TakeList extends Component {

  componentDidMount(){
    let myTakes = this.props.takes_list;
    this.setState({ takes: myTakes});
  }

  constructor(props) {
    super(props);

    this.state = {
      takes: []
    };
  }

  /**
   * Close confirmation modal
   */
  closeModal(){
    this.setState({ activeItem: null, showModal: false });
  }

  /**
   * Go to take creation page
   */
  goToCreateTake(){
    this.props.history.push('/app/take/create');
  }


  /**
   * Go to take edition page
   * @param {Object} row
   */
  goToEditTake(row){
    localStorage.setItem('take_data', JSON.stringify(row));
    this.props.history.push('/app/take/update');
  }
  /**
   * Delete take from list
   * @param {Object} row
   */
  openDeleteTakeModal(row) {
    this.setState({ activeItem: row, showModal: true });
  }

  /**
   * Delete take from list
   * @param {Object} row
   */
  async deleteTake(){
    await this.props.deleteTake({ take_id: this.state.activeItem.take_id });
    let data = [];
    this.state.takes.map((item, key) => data.push(item));
    data.splice(data.indexOf(this.state.activeItem), 1);
    this.setState({ activeItem: null, takes: data });
    this.closeModal();
  }


  buttonFormatter(cell, row) {
    return (
      <div>
        <Button onClick={() => {this.goToEditTake(row)} } color="warning" className="width-300 mb-xs mr-xs">Edit</Button>
        <Button onClick={() => {this.openDeleteTakeModal(row)} } color="danger" className="width-300 mb-xs mr-xs">Delete</Button>
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
          <BreadcrumbItem active>Take List</BreadcrumbItem>
        </Breadcrumb>
        <Button onClick={() => {this.goToCreateTake()} } color="success" className={`width-300 mb-xs mr-xs ${s.posAbsolute}`}>Create Take</Button>
        <Widget>
          <BootstrapTable data={this.state.takes} version="4" pagination options={options} search tableContainerClass={`table-striped table-hover ${s.bootstrapTable}`}>

            <TableHeaderColumn className="width-200" columnClassName="width-200" dataField="description" isKey>
              <span className="fs-sm">description</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="doctor" dataFormat={doctorFormat}>
              <span className="fs-sm">Doctor Name</span>
            </TableHeaderColumn>

            {/* <TableHeaderColumn dataField="repeat">
              <span className="fs-sm">repeat</span>
            </TableHeaderColumn>
            */}

            <TableHeaderColumn dataField="quantity">
              <span className="fs-sm">quantity</span>
            </TableHeaderColumn>

            <TableHeaderColumn dataField="notes">
              <span className="fs-sm">notes</span>
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
              ¿Are you sure you want to delete this take?
            </ModalBody>

            <ModalFooter>
              <Button color="success" onClick={() => this.closeModal()}>Close</Button>
              <Button color="danger" onClick={() => {this.deleteTake()} }>Delete</Button>
            </ModalFooter>
          </Modal>
      </div>
    );
  }
}

const TakeData = compose(
  graphql(takes, {
      options: {
          fetchPolicy: 'network-only'
      },
      props: ({data}) => {
        console.log(data);
          return {
              loading: data.loading,
              takes_list: data.list_takes
          }
      }
  }),
  graphql(DeleteTake, {
      options: {
        errorPolicy: 'ignore',
        refetchQueries: [{ query: takes }]
      },
      props: props => ({
        deleteTake: take => props.mutate({
          variables: take,
          optimisticResponse: {
            __typename: 'Mutation',
            deleteTake: { ...take,  __typename: 'Delete_Take' }
          }
        })
      })
    }),
)(TakeList)

export default withStyles(s)(TakeData);
