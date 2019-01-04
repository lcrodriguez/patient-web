import gql from 'graphql-tag';

export default gql`

query list_medicine{
  list_medicine{
    medicine_id
    name
    description
    dosage
    unity
    icon
    color
  }
}`
