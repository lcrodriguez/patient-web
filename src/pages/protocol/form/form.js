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
  ModalFooter,
  Jumbotron
} from 'reactstrap';
import {
  BootstrapTable,
  TableHeaderColumn,
} from 'react-bootstrap-table';
import { graphql, compose } from 'react-apollo';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TextareaAutosize from 'react-autosize-textarea';
import medicine from '../../../images/medicine/pil2.jpg';
import medicine1 from '../../../images/medicine/medicine1.png';
//GrahpQL Query

import medicines from '../../../querys/list_medicine';
import buckets from '../../../querys/list_take_bucket';
import patients from '../../../querys/list_patient';
import takes from '../../../querys/list_take';

import protocols from '../../../querys/list_protocol';

//import SearchBar from 'material-ui-search-bar'

//GrahpQL Mutation

// import DeleteBucket from '../../../mutation/deleteTakeBucket';
// import DeleteMedicine from '../../../mutation/deleteMedicine';

import DeleteTake from '../../../mutation/deleteTake';
import AddTake from '../../../mutation/addTake';
import UpdateTake from '../../../mutation/updateTake';


import DeleteProtocol from '../../../mutation/deleteProtocol';
import AddProtocol from '../../../mutation/addProtocol';
import UpdateProtocol from '../../../mutation/updateProtocol';

import Widget from '../../../components/Widget';

import s from './../Protocol.scss';


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

const grid = 5;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 1,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? '#fff7e6' : '#FBFBFB',

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({

  background: isDraggingOver ? '#DCDCDC' : '#808080',
  padding: grid,
  width: '100%',
margin:'2px'
});

class Protocols extends Component {

  componentDidMount(){
    let myMedicines = this.props.medicines_list;
    let myPatients = this.props.patient_list;
    let myTakes = this.props.take_list;


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

    this.setState({ buckets: myBuckets, medicines: myMedicines, patients: myPatients , takes : myTakes });
  }

  constructor(props) {
    super(props);
    this.state = {
      items: getItems(10),
      selected: getItems(5, 10),
      medicines: [],
      buckets: [],
      patients: [],
      takes: [],
      activeTake: { quantity: '', description: '' },
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

    } else if (source.droppableId == 'droppable') {
      //This is to make sure that we only send from medicines to takes
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
      activeTake: { quantity: '', description: '' },
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
      activeTake: { quantity: row.quantity || '', repeat: row.description || '' },

      showModal: true
    });
  }

  /**
   * Save protocol
   */
   saveProtocol(){

     const myForm = {
       take_id: uuidV4(),
       protocol_id : inputs.protocol.id,
       doctor_id : inputs.doctor.id,
       description : inputs.description
     }

     //   await this.props.addProtocol(myForm);

     this.setState({
        buckets: buckets,
        isAlertOpened: true
      });
    }

    /**
     * Edit protocol
     */
     editProtocol(){

       const myForm = {
         take_id: uuidV4(),
         protocol_id : inputs.protocol.id,
         doctor_id : inputs.doctor.id,
         description : inputs.description
       }

       //     await this.props.updateProtocol(myForm);

       this.setState({
          buckets: buckets,
          isAlertOpened: true
        });
      }

    /**
     * Save take
     */
    async save (){

      const activeTake = this.state.activeTake;
      const bucketIndex = this.state.activeIndexBucket;
      const medicineIndex = this.state.activeIndexMedicine;
      let buckets = this.state.buckets;

      buckets[bucketIndex].medicines[medicineIndex] = {
          ...buckets[bucketIndex].medicines[medicineIndex],
          ...activeTake
      }

      const myForm = {
        take_id: uuidV4(),
        protocol_id : inputs.protocol.id,
        doctor_id : inputs.doctor.id,
        patient_id : inputs.patient.id,
        take_bucket_id : inputs.bucket.id,
        medicine_id : inputs.medicine.id,
        repeat: inputs.repeat,
        description: inputs.description,
        quantity: parseInt(inputs.quantity),
        quantity_explained: inputs.quantity,
        notes: inputs.notes
      }

      if (myForm.protocol_id && myForm.doctor_id && myForm.patient_id && myForm.medicine_id && myForm.repeat &&
        myForm.take_bucket_id && myForm.description && myForm.quantity && myForm.quantity_explained){

          await this.props.addTake(myForm);

          console.log('pasooo');
          this.setState({
            isAlertOpened: true,
            colorAlert: 'success',
            response: 'A new take was created successfully',
            inputs: {
              doctor: {
                id: null,
                name: 'Select a doctor'
              },
              protocol: {
                protocol_id: null,
                doctor_id: null,
                patient_id: null,
                description: null,
                protocol_code: null,
                name: 'Select a protocol'
              },
              patient: {
                id: null,
                name: 'Select a patient'
              },
              bucket: {
                id: null,
                name: 'Select a bucket'
              },
              medicine: {
                id: null,
                name: 'Select a medicine'
              },
              repeat: '',
              description: '',
              quantity: '',
              quantity_explained: '',
              notes: ''
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
    * Edit Take
    */
  async editTake(){
      const activeTake = this.state.activeTake;
      const bucketIndex = this.state.activeIndexBucket;
      const medicineIndex = this.state.activeIndexMedicine;
      let buckets = this.state.buckets;

      buckets[bucketIndex].medicines[medicineIndex] = {
          ...buckets[bucketIndex].medicines[medicineIndex],
          ...activeTake
      }

      const myForm = {
          take_id: uuidV4(),
          protocol_id : inputs.protocol.id,
          doctor_id : inputs.doctor.id,
          patient_id : inputs.patient.id,
          take_bucket_id : bucketIndex.bucket.id,
          medicine_id : inputs.medicine.id,
          repeat: inputs.repeat,
          description: inputs.description,
          quantity: parseInt(inputs.quantity),
          quantity_explained: inputs.quantity,
          notes: inputs.notes
      }

    if (myForm.protocol_id && myForm.doctor_id && myForm.patient_id && myForm.medicine_id && myForm.repeat &&
            myForm.take_bucket_id && myForm.description && myForm.quantity && myForm.quantity_explained){

          this.props.updateTake(myForm);

          this.setState({
                isAlertOpened: true,
                colorAlert: 'success',
                response: 'A new take was created successfully',
                inputs: {
                  doctor: {
                    id: null,
                    name: 'Select a doctor'
                  },
                  protocol: {
                    protocol_id: null,
                    doctor_id: null,
                    patient_id: null,
                    description: null,
                    protocol_code: null,
                    name: 'Select a protocol'
                  },
                   patient: {
                    id: null,
                    name: 'Select a patient'
                  },
                  bucket: {
                    id: null,
                    name: 'Select a bucket'
                  },
                  medicine: {
                    id: null,
                    name: 'Select a medicine'
                  },
                  repeat: '',
                  description: '',
                  quantity: '',
                  quantity_explained: '',
                  notes: ''
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
   * Save take options in the selected bucket
   */
  saveTake(){

    const activeTake = this.state.activeTake;
    const bucketIndex = this.state.activeIndexBucket;
    const medicineIndex = this.state.activeIndexMedicine;
    let buckets = this.state.buckets;

    buckets[bucketIndex].medicines[medicineIndex] = {
      ...buckets[bucketIndex].medicines[medicineIndex],
      ...activeTake
    }

    const myForm = {
      take_id: uuidV4(),
      protocol_id : inputs.protocol.id,
      doctor_id : inputs.doctor.id,
      patient_id : inputs.patient.id,
      take_bucket_id : bucketIndex.bucket.id,
      medicine_id : inputs.medicine.id,
      repeat: inputs.repeat,
      description: inputs.description,
      quantity: parseInt(inputs.quantity),
      quantity_explained: inputs.quantity,
      notes: inputs.notes
    }

    if (myForm.protocol_id && myForm.doctor_id && myForm.patient_id && myForm.medicine_id && myForm.repeat &&
          myForm.take_bucket_id && myForm.description && myForm.quantity && myForm.quantity_explained){

          this.props.addTake(myForm);

          this.setState({
              isAlertOpened: true,
              colorAlert: 'success',
              response: 'A new take was created successfully',
              inputs: {
                doctor: {
                  id: null,
                  name: 'Select a doctor'
                },
                protocol: {
                  protocol_id: null,
                  doctor_id: null,
                  patient_id: null,
                  description: null,
                  protocol_code: null,
                  name: 'Select a protocol'
                },
                patient: {
                  id: null,
                  name: 'Select a patient'
                },
                bucket: {
                  id: null,
                  name: 'Select a bucket'
                },
                medicine: {
                  id: null,
                  name: 'Select a medicine'
                },
                repeat: '',
                description: '',
                quantity: '',
                quantity_explained: '',
                notes: ''
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
   * Change medicine value options in the modal
   * @param {String} e
   * @param {String} type
   */
  editMedicine(e, type){
    let activeRow = this.state.activeTake;
    this.setState({
      activeTake: {
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

    /**
    * Format Date
    * @param {Date} row
    */
    function dateFunc(date) {
      return moment(date.split('.2Z')[0], 'HH:mm:ss').format('HH:mm')
    }

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
            {this.state.activePatient.first_name} {this.state.activePatient.last_name}
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

          <Row>
            <Col xs={12} md={12}>
              <hr className="my-2" />
            </Col>
          </Row>

          <DragDropContext onDragEnd={this.onDragEnd}>

            <Row className={s.row}>

              <Col xs={5} md={5} lg={5} className="text-center">
              


              {/*<SearchBar
                onChange={() => console.log('onChange')}
                onRequestSearch={() => console.log('onRequestSearch')}
                  style={{
                      margin: '0 auto',
                      maxWidth: 800
                    }}
                  />*/}

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
                                  <span className="thumb-xs avatar pull-left mr-sm">

                                  {/*     <img className="rounded-circle" src={'../../../images/medicine/'+ item.icon + '.png'} alt="..." />*/}

                                 <img className="rounded-circle" src={medicine} alt="..." />
                                  </span>
                                  {item.name} - {item.dosage} ({item.unity}).

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

                                    {item.time_to} - {item.time_from}

                                    {item.medicines.length ? (
                                      <div>
                                        <DropdownItem divider />
                                        Medicines
                                        <span className="thumb-xs avatar pull-left mr-sm">

                                        {/*     <img className="rounded-circle" src={'../../../images/medicine/'+ item.icon + '.png'} alt="..." />*/}

                                       <img className="rounded-circle" src={medicine1} alt="..." />
                                        </span>
                                        <DropdownItem divider />
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

          <FormGroup row className="form-action">
             <Label md={4} />
             <Col md={7}>
               <Button onClick={(e) => this.saveProtocol()} color="success" className="width-300 mb-xs mr-xs">Generate Protocol</Button>
             </Col>
           </FormGroup>
        </Widget>

        <Modal isOpen={this.state.showModal}>
          <ModalHeader toggle={() => this.closeModal()}>Edit Take</ModalHeader>

          <ModalBody className="bg-white">
            <Alert
              key={'al-1'} isOpen={this.state.isAlertOpened}
              color={'success'} >
              Medicine options saved in the bucket
            </Alert>

          <FormGroup row>
              <Label for="normal-field" md={4} className="text-md-right">
                Quantity
              </Label>
              <Col md={8}>
                <Input
                  type="text"
                  id="normal-field"
                  placeholder="Introduce a quantity"
                  onChange={(e) => this.editMedicine(e, 'quantity')}
                  value={this.state.activeTake.quantity}
                />
              </Col>
          </FormGroup>

          <FormGroup row>
              <Label for="normal-field" md={4} className="text-md-right">
                Description
              </Label>
              <Col md={8}>
                <TextareaAutosize
                  rows={4}
                  id="elastic-textarea"
                  onChange={(e) => this.changeInputValue(e, 'description')}
                  value={this.state.activeTake.description}
                  placeholder="Introduce a Description"
                  className={`form-control ${s.autogrow} transition-height`}
                />
              </Col>
        </FormGroup>

          </ModalBody>

          <ModalFooter>
            <Button color="success" onClick={() => this.saveTake()}>Save</Button>
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
  // graphql(DeleteMedicine, {
  //   options: {
  //     errorPolicy: 'ignore'
  //   },
  //   props: props => ({
  //     deleteMedicine: medicine => props.mutate({
  //       variables: medicine,
  //       optimisticResponse: {
  //         __typename: 'Mutation',
  //         deleteMedicine: { ...medicine,  __typename: 'Medicine' }
  //       }
  //     })
  //   })
  // }),
  // graphql(DeleteBucket, {
  //   options: {
  //     errorPolicy: 'ignore'
  //   },
  //   props: props => ({
  //     deleteBucket: bucket => props.mutate({
  //       variables: bucket,
  //       optimisticResponse: {
  //         __typename: 'Mutation',
  //         deleteBucket: { ...bucket,  __typename: 'Bucket' }
  //       }
  //     })
  //   })
  // }),
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
graphql(AddTake, {
    options: {
        errorPolicy: 'ignore',
        refetchQueries: [{ query: takes }]
      },
      props: props => ({
        addTake: take => props.mutate({
          variables: take,
          optimisticResponse: {
            __typename: 'Mutation',
            addTake: { ...take,  __typename: 'Take' }
          }
        })
      })
  }),
  graphql(UpdateTake, {
    options: {
        errorPolicy: 'ignore',
        refetchQueries: [{ query: takes }]
    },
    props: props => ({
        updateTake: take => props.mutate({
            variables: take,
            optimisticResponse: {
                __typename: 'Mutation',
                updateTake: { ...take,  __typename: 'Take' }
            }
        })
    })
}),
graphql(DeleteProtocol, {
    options: {
      errorPolicy: 'ignore',
      refetchQueries: [{ query: protocols }]
    },
    props: props => ({
      deleteProtocol: take => props.mutate({
        variables: protocol,
        optimisticResponse: {
          __typename: 'Mutation',
          deleteProtocol: { ...protocl,  __typename: 'Protocol' }
        }
      })
    })
  }),
graphql(AddProtocol, {
  options: {
      errorPolicy: 'ignore',
      refetchQueries: [{ query: protocols }]
    },
    props: props => ({
      addProtocol: protocol => props.mutate({
        variables: protocol,
        optimisticResponse: {
          __typename: 'Mutation',
          addProtocol: { ...protocol,  __typename: 'Protocol' }
        }
      })
    })
}),
graphql(UpdateProtocol, {
  options: {
      errorPolicy: 'ignore',
      refetchQueries: [{ query: protocols }]
  },
  props: props => ({
      updateProtocol: protocol => props.mutate({
          variables: protocol,
          optimisticResponse: {
              __typename: 'Mutation',
              updateProtocol: { ...take,  __typename: 'Protocol' }
          }
      })
  })
}),
)(Protocols)

export default withStyles(s)(ProtocolsData);
