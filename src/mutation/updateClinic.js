
import gql from 'graphql-tag';

export default gql`

mutation updateClinic($clinic_id: ID!,$name: String!, $address: String, $city: String,	$state: String,	$zip: Int, $phone: String,	$fax: String) {
  updateClinic(clinic_id : $clinic_id, name: $name, address: $address, city:$city, state:$state,zip:$zip,phone:$phone,fax:$fax) {
         clinic_id
         name
       	 address
      	 city
    	   state
     		 zip
    	   phone
         fax
       }
     } `
