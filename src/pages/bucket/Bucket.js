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
import moment from 'moment/moment';

//GrahpQL Query
import buckets from '../../querys/list_take_bucket';
import DeleteBucket from '../../mutation/deleteTakeBucket';
import getBucketById from '../../querys/getBucketById';



import Widget from '../../components/Widget';

import s from './Bucket.scss';

class BucketList extends Component {

  componentDidMount(){
    let myBuckets = this.props.buckets_list;
    this.setState({ buckets: myBuckets});
  }

  constructor(props) {
    super(props);

    this.state = {
      buckets: [],
      showModal: false,
      showWarningModal: false,
      warningMessage: 'This bucket is assigned to a patient. Please unassign it before to delete.'
    };
  }


  /**
   * Close confirmation modal
   */
   closeModal(){
     this.setState({ activeItem: null, showModal: false, showWarningModal: false });
   }
   
  /**
   * Go to bucket creation page
   */
  goToCreateBucket(){
    this.props.history.push('/app/bucket/create');
  }

  /**
   * Go to bucket edition page
   * @param {Object} row
   */
  goToEditBucket(row){
    localStorage.setItem('bucket_data', JSON.stringify(row));
    this.props.history.push('/app/bucket/update');
  }

  /**
   * Delete bucket from list
   * @param {Object} row
   */
  openDeleteBucketModal(row){
    this.setState({ activeItem: row, showModal: true });
  }

  /**
   * Check medicine assignation
   */
  async checkBucketAssignation(){
    try {
        console.log('ENTRO'  );

      const queryResp = await this.props.client.query({
        query: getBucketById,
        variables: {
          take_bucket_id: this.state.activeItem.take_bucket_id
        },
      });
      console.log('asdasdasdasdasdasda' +queryResp );

      const buckets = queryResp.data.getBucketById.items;
      let cond = false;
      buckets.map(item =>{
        if (item.take_bucket_id){
          cond = true;
        }
      });
      if (cond) {
        this.setState({ showWarningModal: true, warningMessage: 'This bucket is assigned to a patient. Please unassign it before to delete.' });
        return;
      }
      this.deleteBucket();
    } catch (error) {
      this.setState({ warningMessage: 'An error has ocurred during deletion. Please try again.' });
    }
  }

  /**
   * Delete bucket from list
   * @param {Object} row
   */
  async deleteBucket(){
    await this.props.deleteBucket({ take_bucket_id: this.state.activeItem.take_bucket_id });
    let data = [];
    this.state.buckets.map((item, key) => data.push(item));
    data.splice(data.indexOf(this.state.activeItem), 1);
    this.setState({ activeItem: null, buckets: data });
    this.closeModal();
  }

  buttonFormatter(cell, row) {
    return (
      <div>
        <Button onClick={() => {this.goToEditBucket(row)} } color="warning" className="width-300 mb-xs mr-xs">Edit</Button>
        <Button onClick={() => {this.openDeleteBucketModal(row)} } color="danger" className="width-300 mb-xs mr-xs">Delete</Button>
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

    function dateFunc(date) {
      return moment(date.split('.2Z')[0], 'HH:mm:ss').format('HH:mm')
    }

    return (
      <div>
        <Breadcrumb>
          <BreadcrumbItem>YOU ARE HERE</BreadcrumbItem>
          <BreadcrumbItem active>Bucket List</BreadcrumbItem>
        </Breadcrumb>
        <Button onClick={() => {this.goToCreateBucket()} } color="success" className={`width-300 mb-xs mr-xs ${s.posAbsolute}`}>Create Bucket</Button>
        <Widget>
          <BootstrapTable data={this.state.buckets} version="4" pagination options={options} search tableContainerClass={`table-striped table-hover ${s.bootstrapTable}`}>
            <TableHeaderColumn className="width-400" columnClassName="width-400" dataField="description" isKey>
              <span className="fs-sm">Description</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="time_from" dataSort dataFormat={dateFunc}>
              <span className="fs-sm">Time From</span>
            </TableHeaderColumn>
            <TableHeaderColumn dataField="time_to" dataFormat={dateFunc}>
              <span className="fs-sm">Time To</span>
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
          ¿Are you sure you want to delete this bucket?

          </ModalBody>

          <ModalFooter>
            <Button color="success" onClick={() => this.closeModal()}>Close</Button>
            <Button color="danger" onClick={() => {this.checkBucketAssignation()} }>Delete</Button>
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

const BucketData = compose(
  graphql(buckets, {
      options: {
          fetchPolicy: 'network-only'
      },
      props: ({data}) => {
        console.log(data);
          return {
              loading: data.loading,
              buckets_list: data.list_take_bucket
          }
      }
  }),
  graphql(DeleteBucket, {
    options: {
      errorPolicy: 'ignore',
      refetchQueries: [{ query: buckets }]
    },
    props: props => ({
      deleteBucket: bucket => props.mutate({
        variables: bucket,
        optimisticResponse: {
          __typename: 'Mutation',
          deleteBucket: { ...bucket,  __typename: 'Bucket' }
        }
      })
    })
  }),
)(BucketList)
export default withApollo(withStyles(s)(BucketData));
