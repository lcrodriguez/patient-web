
import gql from 'graphql-tag';

export default gql`

mutation updateTakeChanges($take_changes_id: ID!,$patient_id: ID!,$medicine_id: ID!,$take_bucket_id: ID!,$change_by_doctor_id: ID!,$state: Take_Changes_State,
$repeat: String!) {
  updateTakeChanges(take_changes_id : $take_changes_id ,patient_id: $patient_id,medicine_id: $medicine_id,take_bucket_id: $take_bucket_id,change_by_doctor_id: $change_by_doctor_id,state: $state,
       repeat: $repeat) {
       take_changes_id
       patient_id
       medicine_id
       change_by_doctor_id
       take_bucket_id
       state
     }
   } `
