import gql from 'graphql-tag';

export default gql`

query list_takes{
  list_takes{
	take_id
  protocol_id
  doctor_id
  repeat
	description
  quantity
  quantity_explained
  notes
  take_bucket{
    take_bucket_id
    time_to
    time_from
    description
    on_demand
  }
    medicine{
      medicine_id
      name
      description
      icon
    }
    doctor{
      doctor_id
      first_name
      last_name
      email
  	}
  }
}`
