import gql from 'graphql-tag';

export default gql`

query getDoctor($email:String!){
  getDoctor(email: $email){
  items {
    doctor_id
    user_id
    clinic_id
    first_name
    last_name
    address
    state
    city
    phone
    zip
    fax
    email
    protocols{
       protocol_id
       description
    	 start_date
       end_date
     }
    patients{
       patient_id
       first_name
       last_name
       email
     }
   }
  }
}`
