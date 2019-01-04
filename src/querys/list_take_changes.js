import gql from 'graphql-tag';

export default gql`

query take_changes{
  list_take_changes{
    take_changes_id
    patient_id
    medicine_id
    change_by_doctor_id
    take_bucket_id
    state
  }
}`
