import gql from 'graphql-tag';

export default gql`

query list_clinic{
  list_clinic {
    clinic_id
    name
    address
    city
    state
    zip
    phone
    fax
  }
}`
