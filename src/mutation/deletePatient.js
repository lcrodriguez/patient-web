
import gql from 'graphql-tag';

export default gql`

mutation deletePatient($patient_id: ID!) {
  deletePatient(patient_id: $patient_id) {
    patient_id
        }
     }
 `
