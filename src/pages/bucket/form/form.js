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
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  Alert,
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from 'reactstrap';
import uuidV4 from 'uuid/v4';
import { graphql, compose } from 'react-apollo';
import Datetime from 'react-datetime';
import config from '../../../config';
import moment from 'moment/moment';
import { Auth } from 'aws-amplify';
import TextareaAutosize from 'react-autosize-textarea';

//GrahpQL Query
import buckets from '../../../querys/list_take_bucket';
import clinics from '../../../querys/list_clinic';

//GrahpQL Mutations
import AddBucket from '../../../mutation/addTakeBucket';
import UpdateBucket from '../../../mutation/updateTakeBucket';

import Widget from '../../../components/Widget';

import s from '../Bucket.scss';

class FormBucket extends Component {

  componentDidMount(){
    const currentLocation = location.pathname;
    if (currentLocation === '/app/bucket/update' && !localStorage.getItem('bucket_data')) this.props.history.push('/app/bucket/list');
    let myClinics = this.props.clinics_list;
    const keys = config.aws_keys;
    if (currentLocation === '/app/bucket/update' && localStorage.getItem('bucket_data')){
      const bucketData = JSON.parse(localStorage.getItem('bucket_data'));
      localStorage.removeItem('bucket_data');
      this.setState({
        clinics: myClinics,
        isEdition: true,
        inputs: {
          time_to: bucketData.time_to,
          time_from: bucketData.time_from,
          description: bucketData.description || '',
          on_demand: {
            id: bucketData.on_demand,
            name: (bucketData.on_demand) ? 'Yes' : 'No'
          }
        },
        time_to: moment(bucketData.time_to.split('.2Z')[0], 'HH:mm:ss').format('HH:mm'),
        time_from: moment(bucketData.time_from.split('.2Z')[0], 'HH:mm:ss').format("HH:mm"),
        take_bucket_id: bucketData.take_bucket_id
      });
    } else {
      this.setState({ clinics: myClinics });
    }
    //config credential aws-sdk
    AWS.config.update({ ...keys, region: Auth._config.region });
  }

  constructor(props) {
    super(props);

    this.state = {
      clinics: [],
      inputs: {
        time_to: `${moment().add(5, 'minute').format('HH:mm')}:00.2Z`,
        time_from:`${moment().format('HH:mm')}:00.2Z`,
        description: '',
        on_demand: {
          id: true,
          name: 'Yes'
        }
      },
      time_to: moment().add(5, 'minute').format('HH:mm'),
      time_from: moment().format('HH:mm'),
      take_bucket_id: null,
      isAlertOpened: false,
      isEdition: false,
      colorAlert: 'danger',
      on_demand_options: [{ type: "Yes", value: true }, { type: 'No', value: false }],
      isDatePickerOpen: false,
      isTimeFromPickerOpen: false,
      isTimeToPickerOpen: false,
      response: null
    };

    this.closePicker = this.closePicker.bind(this);
    this.time_fromRef = React.createRef();
  }

  /**
   * Close alert
   */
  closeAlert(){
    setTimeout(() => { this.setState({ isAlertOpened: false, response: null }); }, 4000);
  }

  /**
   * Go to bucket list page
   */
  goToListBucket(){
    this.props.history.push('/app/bucket/list');
  }

  /**
   * Change time picker value
   * @param {String} value
   * @param {String} type
   */
  timeChange(value, type){
    const time = `${moment(value).format('HH:mm')}:00.2Z`;
    const inputs = this.state.inputs;
    if (type === 'time_from')
      this.setState({ isTimeFromPickerOpen: true, time_from: moment(value), inputs: { ...inputs, time_from: time } });
    else
      this.setState({ isTimeToPickerOpen: true, time_to: moment(value), inputs: { ...inputs, time_to: time } });
  }

  /**
   * Close time picker
   */
  closePicker(){
    this.setState({ isTimeFromPickerOpen: false, isTimeToPickerOpen: false });
  }

  /**
   * Change select value
   * @param {String} id
   * @param {String} name
   * @param {String} type
   */
  changeSelectValue(id, name, type) {
    let inputsValue = this.state.inputs;
    this.setState({
      inputs: {
        ...inputsValue,
        [type]: {
          id: id,
          name: name
        }
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
   * Save bucket
   */
  async save (){
    const inputs = this.state.inputs;
    const myForm = {
      take_bucket_id: uuidV4(),
      time_to: inputs.time_to,
      time_from: inputs.time_from,
      description: inputs.description,
      on_demand: inputs.on_demand.id,
    }

    if (myForm.time_to &&  myForm.time_from && myForm.description){
        await this.props.addBucket(myForm);
        this.setState({
          isAlertOpened: true,
          colorAlert: 'success',
          response: 'A new bucket was created successfully',
          inputs: {
            time_to: '',
            time_from: '',
            description: '',
            on_demand: {
              id: true,
              name: 'Yes'
            }
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
   * Edit current bucket
   */
  async edit(){
    const inputs = this.state.inputs;
    const myForm = {
      take_bucket_id: this.state.take_bucket_id,
      time_to: inputs.time_to,
      time_from: inputs.time_from,
      description: inputs.description,
      on_demand: inputs.on_demand.id,
    }

    if (myForm.time_to && myForm.time_from && myForm.description){
      try {
        await this.props.updateBucket(myForm);
        this.setState({
          isAlertOpened: true,
          colorAlert: 'success',
          response: "The bucket was updated successfully."
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
    return (
      <div className={s.root} onClick={() => this.closePicker() }>
        <ol className="breadcrumb">
          <li className="breadcrumb-item">YOU ARE HERE</li>
          {!this.state.isEdition ?
            <li className="active breadcrumb-item">Create Bucket</li>
            :
            <li className="active breadcrumb-item">Edit Bucket</li>
          }
        </ol>
        <h1 className="page-title">Bucket -
          {!this.state.isEdition ?
            <span className="fw-semi-bold">Create</span>
            :
            <span className="fw-semi-bold">Edition</span>
          }
        </h1>

        <Button onClick={() => {this.goToListBucket()} } color="inverse" className={`width-300 mb-xs mr-xs ${s.posAbsoluteList}`}>Back to List</Button>
        <Row>
          {/* Horizontal form */}
          <Col lg={12} md={12}>
            <Widget>
              <Alert
                key={'al-4'} isOpen={this.state.isAlertOpened}
                color={this.state.colorAlert}
              >
                {this.state.response}
              </Alert>
              <FormGroup>
                <Form>

                <FormGroup row >

                <Label for="timepicker_from" md={4} className="text-md-right">
                    Time-from
                  </Label>
                  <Col md={7}>
                    <Datetime
                      open={this.state.isTimeFromPickerOpen}
                      id="timepicker_from"
                      inputProps={{ ref: (input) => { this.refTimePicker = input; } }}
                      timeFormat={'HH:mm'}
                      value={this.state.time_from}
                      onChange={(e) => this.timeChange(e, 'time_from')}
                      viewMode="time"
                      dateFormat={false}
                    />
                  </Col>
                </FormGroup>

              <FormGroup row>
                <Label for="timepicker_to" md={4} className="text-md-right">
                    Time-to
                  </Label>
                  <Col lg={6} md={7}>
                    <Datetime
                      open={this.state.isTimeToPickerOpen}
                      id="timepicker_to"
                      inputProps={{ ref: (input) => { this.refTimePicker2 = input; } }}
                      timeFormat={'HH:mm'}
                      value={this.state.time_to}
                      onChange={(e) => this.timeChange(e, 'time_to')}
                      viewMode="time"
                      dateFormat={false}
                    />
                  </Col>
                </FormGroup>

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

                  <FormGroup row>
                    <Label for="normal-field" md={4} className="text-md-right">
                        On demand
                    </Label>
                    <Col md={7}>
                      <UncontrolledButtonDropdown>
                        <DropdownToggle
                          caret color="default"
                          className="dropdown-toggle-split mr-xs" >
                          {this.state.inputs.on_demand.name}
                        </DropdownToggle>
                        <DropdownMenu>
                          {this.state.on_demand_options.map((item, key) =>
                            <DropdownItem
                              key={key}
                              onClick={(e) => this.changeSelectValue(item.value, item.type, 'on_demand')}>
                              {item.type}
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </UncontrolledButtonDropdown>
                    </Col>
                  </FormGroup>

                  <FormGroup row className="form-action">
                    <Label md={4} />
                    <Col md={7}>
                      {!this.state.isEdition ?
                        <Button onClick={(e) => this.save()} color="success" className="width-300 mb-xs mr-xs">Save Bucket</Button>
                        :
                        <Button onClick={(e) => this.edit()} color="success" className="width-300 mb-xs mr-xs">Update Bucket</Button>
                      }
                    </Col>
                  </FormGroup>
                </Form>
              </FormGroup>
            </Widget>
          </Col>
        </Row>
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
  graphql(AddBucket, {
      options: {
          errorPolicy: 'ignore',
          refetchQueries: [{ query: buckets }]
      },
      props: props => ({
          addBucket: bucket => props.mutate({
              variables: bucket,
              optimisticResponse: {
                  __typename: 'Mutation',
                  addBucket: { ...bucket,  __typename: 'Bucket' }
              }
          })
      })
  }),
  graphql(UpdateBucket, {
    options: {
        errorPolicy: 'ignore',
        refetchQueries: [{ query: buckets }]
    },
    props: props => ({
        updateBucket: bucket => props.mutate({
            variables: bucket,
            optimisticResponse: {
              __typename: 'Mutation',
              updateBucket: { ...bucket,  __typename: 'Bucket' }
            }
        })
    })
}),
)(FormBucket)

export default withStyles(s)(BucketData);
