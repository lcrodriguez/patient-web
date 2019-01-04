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
  	protocols{
			doctor{
				doctor_id
				first_name
				last_name
			}
			description
			protocol_id
    	protocol_code
  			takes{
      		description
    			quantity
  					medicine{
      				name
      				dosage
      				unity
    				}
  					take_bucket{
    				  time_to
     					time_from
    					description
        		}
      		}
    		}
  		}
		}`
