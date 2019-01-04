import gql from 'graphql-tag';

export default gql`

query getPatientById($patient_id:ID!){
  getPatientById($patient_id: $patient_id){
  items {
    $patient_id
   }
  }
}`
