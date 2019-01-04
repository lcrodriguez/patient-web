
import gql from 'graphql-tag';

export default gql`

query list_take_bucket{
  list_take_bucket{
    take_bucket_id
    time_to
    time_from
    description
    on_demand
      takes{
        	take_id
       		protocol_id
  				doctor_id
          patient_id
        	medicine_id
  				repeat
  				description
  				quantity
  				quantity_explained
 					notes
      patient{
          patient_id
   				user_id
    			first_name
    			last_name
   				email
    			ssn
   				phone
   				singup_code
   				signup_code_expirest_at
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
        doctor{
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
      }
 	  }
  }
}`
