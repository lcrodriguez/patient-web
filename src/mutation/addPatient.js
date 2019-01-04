
import gql from 'graphql-tag';

export default gql`
mutation addPatient( $user_id: ID!, $email: String!, $first_name: String!, $last_name: String!,
  $ssn: String, $phone: String , $doctor_id: ID! ) {
    addPatient( user_id: $user_id, email: $email, first_name: $first_name, last_name:$last_name,
        ssn:$ssn, phone:$phone ,  doctor_id :$doctor_id) {
        patient_id
        doctor_id
        user_id
        first_name
        last_name
        email
        ssn
        phone
      }
    }`
