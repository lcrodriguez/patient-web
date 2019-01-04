import gql from 'graphql-tag';

export default gql`

query list_patient{
  list_patient{
    patient_id
    user_id
    first_name
    last_name
    email
    ssn
    phone
    singup_code
    signup_code_expirest_at
  takes{
      	take_id
        doctor_id
        protocol_id
    		description
    		quantity
    		quantity_explained
        repeat
    		notes
    take_bucket{
   			take_bucket_id
    		time_to
  		  time_from
  		  description
   			on_demand
    }
    medicine{
        medicine_id
        name
       	description
      	dosification
    	  icon
     		color
    	  size
    }
   }
  }
}`
