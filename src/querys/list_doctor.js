import gql from 'graphql-tag';

export default gql`

query list_doctor{
  list_doctor{
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
         }
        patients{
           patient_id
           first_name
           last_name
           email
         }
       }
     }`
