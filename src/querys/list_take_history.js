import gql from 'graphql-tag';

export default gql`

query take_history{
  take_history{
    take_history_id
    patient_id
    medicine_id
    take_bucket_id
    quantity
    date_taken
  }
}`
