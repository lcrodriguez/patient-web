import gql from 'graphql-tag';

export default gql`

query list_protocol{
  list_protocol{
    protocol_id
    doctor_id
    patient_id
    description
    protocol_code
    doctor{
      first_name
      last_name
    }
    patient{
      first_name
      last_name
    }
    takes{
      take_id
      protocol_id
      quantity
      description
      take_bucket{
        time_to
        time_from
        description
      }
      medicine{
        name
        dosage
        unity
        icon
        color
      }
    }
  }
}

`
