
import gql from 'graphql-tag';

export default gql`

mutation updateProtocol($protocol_id:ID!,$description: String!, $doctor_id: ID!,$patient_id: ID,$protocol_code: String,
  $start_date: AWSDate,	$end_date: AWSDate,$status: ProtocolStatus) {
   updateProtocol(protocol_id :$protocol_id,description: $description, doctor_id: $doctor_id, patient_id: $patient_id,
    protocol_code: $protocol_code, start_date :$start_date, end_date:$end_date,status:$status) {
      protocol_id
      doctor_id
      patient_id
      description
      protocol_code
      start_date
      end_date
      status
    }
  }`
