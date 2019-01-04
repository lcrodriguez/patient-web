
import gql from 'graphql-tag';

export default gql`

mutation updateTakeHistory($take_history_id: ID!,$patient_id: ID!,$medicine_id: ID!,$take_bucket_id: ID!,$quantity: Int,$date_taken: AWSDateTime) {
	 updateTakeHistory(take_history_id : $take_history_id ,patient_id: $patient_id,medicine_id: $medicine_id,
		take_bucket_id: $take_bucket_id,quantity: $quantity,date_taken: $date_taken) {
				take_history_id
				patient_id
				medicine_id
				take_bucket_id
				quantity
				date_taken
         }
     } `
