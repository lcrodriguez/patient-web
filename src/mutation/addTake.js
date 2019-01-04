
import gql from 'graphql-tag';

export default gql`

mutation addTake($protocol_id: ID!,$doctor_id: ID!,$patient_id: ID,$take_bucket_id: ID!, $medicine_id: ID!,$repeat: Take_Repeat!,$description: String,	$quantity: Int!, $quantity_explained: String,$notes: String) {
      addTake(protocol_id: $protocol_id,doctor_id: $doctor_id,patient_id: $patient_id,take_bucket_id: $take_bucket_id, medicine_id: $medicine_id,repeat: $repeat,description: $description,	quantity: $quantity, quantity_explained: $quantity_explained,notes: $notes) {
        take_id
        protocol_id
    		doctor_id
    		patient_id
    		take_bucket_id
    		medicine_id
    		repeat
    		description
    		quantity
    		quantity_explained
    		notes
       }
      } `
