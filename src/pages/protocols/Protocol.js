import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  Row,
  Col,
  Label,
  FormGroup,
  Input,
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import {
  BootstrapTable,
  TableHeaderColumn,
} from 'react-bootstrap-table';
import { graphql, compose } from 'react-apollo';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

//GrahpQL Query
import medicines from '../../querys/list_medicine';
import buckets from '../../querys/list_take_bucket';
import patients from '../../querys/list_patient';

import DeleteBucket from '../../mutation/deleteTakeBucket';


import DeleteMedicine from '../../mutation/deleteMedicine';

import Widget from '../../components/Widget';

import s from './Protocol.scss';


// fake data generator
const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
      id: `item-${k + offset}`,
      content: `item ${k + offset}`
  }));

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const destIndex = droppableDestination.index;

  const [removed] = sourceClone.splice(droppableSource.index, 1);
  if (destClone[destIndex] && destClone[destIndex]["medicines"].indexOf(removed) === -1) {
    destClone[droppableDestination.index]["medicines"].push(removed);
  }

  const result = {};
  result[droppableSource.droppableId] = source;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 1,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? '#EFF1F1' : '#FBFBFB',

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? '#efb404' : '#ffd044',
  padding: grid,
  width: '100%'
});

class Protocols extends Component {

  componentDidMount(){
    let myMedicines = this.props.medicines_list;
    let myPatients = this.props.patient_list;

    let myBuckets = [];
    this.props.buckets_list.map((item, key) => {
      const bucket = {
        id: item.take_bucket_id,
        time_from: item.time_from,
        time_to: item.time_to,
        description: item.description,
        medicines: []
      }
      myBuckets.push(bucket);
    });
    this.setState({ buckets: myBuckets, medicines: myMedicines, patients: myPatients });
  }

  constructor(props) {
    super(props);
    this.state = {
      items: getItems(10),
      selected: getItems(5, 10),
      medicines: [],
      buckets: [],
      patients: [],
      activeMedicine: { quantity: '', repeat: '' },
      activeIndexBucket: null,
      activeIndexMedicine: null,
      activePatient: { first_name: 'Select a patient' },
      showModal: false,
      isAlertOpened: false
    }
  }

    /**
     * A semi-generic way to handle multiple lists. Matches
     * the IDs of the droppable container to the names of the
     * source arrays stored in the state.
     */
    idList = {
      droppable: 'medicines',
      droppable2: 'buckets'
  };

  getList = id => this.state[this.idList[id]];

  /**
   * Execute when a item is dropped
   * @param {Object} result
   */
  onDragEnd = result => {
    const { source, destination } = result;
    if (!destination) return; // dropped outside the list
    const sourceArrayName = this.idList[source.droppableId];
    const destArrayName = this.idList[destination.droppableId];

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        this.getList(source.droppableId),
        source.index,
        destination.index
      );
      this.setState({ [sourceArrayName]: items });

    } else if (source.droppableId == 'droppable') { //This is to make sure that we only send from medicines to takes
      const result = move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination
      );

      this.setState({
        [sourceArrayName]: result[source.droppableId],
        [destArrayName]: result[destination.droppableId]
      });
    }
  };

  /**
   * Close medicine modal
   */
  closeModal(){
    this.setState({
      activeIndexBucket: null,
      activeIndexMedicine: null,
      activeMedicine: { quantity: '', repear: '' },
      showModal: false });
  }

  /**
   * Open Medicine Modal
   * @param {Object} row
   * @param {Numeric} BucketIndex
   * @param {Numeric} medicineKey
   */
  openModal(BucketIndex, medicineKey, row){
    this.setState({
      activeIndexBucket: BucketIndex,
      activeIndexMedicine: medicineKey,
      activeMedicine: { quantity: row.quantity || '', repeat: row.repeat || '' },
      showModal: true
    });
  }

  /**
   * Save medicine options in the selected bucket
   */
  saveMedicine(){
    const activeMedicine = this.state.activeMedicine;
    const bucketIndex = this.state.activeIndexBucket;
    const medicineIndex = this.state.activeIndexMedicine;
    let buckets = this.state.buckets;

    buckets[bucketIndex].medicines[medicineIndex] = {
      ...buckets[bucketIndex].medicines[medicineIndex],
      ...activeMedicine
    }

    console.log(buckets);
    this.setState({
      buckets: buckets,
      isAlertOpened: true
    });

    setTimeout(() =>{ this.setState({ isAlertOpened: false }) }, 3000);
  }

  /**
   * Change medicine value options in the modal
   * @param {String} e
   * @param {String} type
   */
  editMedicine(e, type){
    let activeRow = this.state.activeMedicine;
    this.setState({
      activeMedicine: {
        ...activeRow,
        [type]: e.target.value
      }
    });
  }

  /**
  * Delete medicine from a bucket
  * @param {Numeric} bucketIndex
  * @param {Numeric} index
  */
  deleteMedicine(bucketIndex, index){
    let buckets = this.state.buckets;
    buckets[bucketIndex].medicines.splice(index, 1);
    this.setState({ buckets: buckets });
  }

  /**
  * Change patient
  * @param {Object} row
  */
  changeSelectValue(row){
    this.setState({ activePatient: row })
  }

  render() {
    return (
      <div>
        <Breadcrumb>
          <BreadcrumbItem>YOU ARE HERE</BreadcrumbItem>
          <BreadcrumbItem active>Protocols Panel</BreadcrumbItem>
        </Breadcrumb>
        <Widget>
        <UncontrolledButtonDropdown>
          <DropdownToggle
            caret color="default"
            className="dropdown-toggle-split mr-xs ${s.posAbsolute}" >
            {this.state.activePatient.first_name}
          </DropdownToggle>
          <DropdownMenu>
            {this.state.patients.map((item, key) =>
              <DropdownItem
                key={key}
                onClick={(e) => this.changeSelectValue(item)}>
                {item.first_name} {item.last_name}
              </DropdownItem>
            )}
          </DropdownMenu>
          </UncontrolledButtonDropdown>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Row className={s.row}>

              <Col xs={5} md={5} lg={5} className="text-center">
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}>
                          {this.state.medicines.map((item, index) => (
                            <Draggable
                              key={item.medicine_id}
                              draggableId={item.name}
                              index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                  )}>
                                  Medicine : {item.name}
                                  <DropdownItem divider />
                                  Description : {item.description}
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Col>

                <Col xs={5} md={5} lg={5} className="text-center">
                  <Droppable droppableId="droppable2">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}>
                          {this.state.buckets.map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={item.description}
                              index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                  )}>
                                   HS : {item.time_to}
                                  <DropdownItem divider />
                                    {item.description}
                                    {item.medicines.length ? (
                                      <div>
                                        <DropdownItem divider />
                                        <b>Medicines</b>
                                        {item.medicines.map((i, k) => (
                                          <p key={k}>
                                            {i.name}
                                            <span style={{ marginLeft: 5, marginRight: 5 }} className={'text-warning'} onClick={() => { this.openModal(index, k, i) }}>Edit</span>
                                            <span className={'text-danger'} onClick={() => { this.deleteMedicine(index, k) }}>delete</span>
                                          </p>
                                        ))}
                                      </div>
                                      ) : (
                                        null
                                      )
                                    }
                                </div>
                              )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Col>



            </Row>
          </DragDropContext>
        </Widget>

        {/* Confirmation Modal */}
        <Modal isOpen={this.state.showModal}>
          <ModalHeader toggle={() => this.closeModal()}>Edit Medicine</ModalHeader>
          <ModalBody className="bg-white">
            <Alert
              key={'al-1'} isOpen={this.state.isAlertOpened}
              color={'success'}
            >
              Medicine options saved in the bucket
            </Alert>
            <FormGroup row>
              <Label for="normal-field" md={4} className="text-md-right">
                Quantity
              </Label>
              <Col md={7}>
                <Input
                  type="text"
                  id="normal-field"
                  placeholder="Introduce a quantity"
                  onChange={(e) => this.editMedicine(e, 'quantity')}
                  value={this.state.activeMedicine.quantity}
                />
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
                  placeholder="Introduce a repeat cycle"
                  onChange={(e) => this.editMedicine(e, 'repeat')}
                  value={this.state.activeMedicine.repeat}
                />
              </Col>
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button color="success" onClick={() => this.saveMedicine()}>Save</Button>
            <Button color="danger" onClick={() => {this.closeModal()} }>Close</Button>
          </ModalFooter>
        </Modal>

      </div>
    );
  }
}

const ProtocolsData = compose(
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
  graphql(patients, {
      options: {
          fetchPolicy: 'network-only'
      },
      props: ({data}) => {
          return {
              loading: data.loading,
              patient_list: data.list_patient
          }
      }
  }),
  graphql(DeleteMedicine, {
    options: {
      errorPolicy: 'ignore'
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
  graphql(DeleteBucket, {
    options: {
      errorPolicy: 'ignore'
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
)(Protocols)

export default withStyles(s)(ProtocolsData);
