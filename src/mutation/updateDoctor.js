
import gql from 'graphql-tag';

export default gql`

     mutation updateDoctor(  $doctor_id: ID!,$user_id: ID!,$clinic_id: ID,$first_name: String!,$last_name: String!,$address: String,$city: String,
      $state: String,$zip: Int,$phone: String,$fax: String,$email: String!) {
        updateDoctor(doctor_id : $doctor_id ,user_id: $user_id,clinic_id: $clinic_id,first_name: $first_name,last_name: $last_name, address: $address,city: $city,
            state: $state,zip: $zip,phone: $phone,fax: $fax, email:$email) {
               doctor_id
               user_id
               clinic_id
               first_name
               last_name
               phone
               zip
               fax
               email
             }
           } `