
import gql from 'graphql-tag';

export default gql`

mutation deleteMedicine($medicine_id: ID!) {
	deleteMedicine(medicine_id: $medicine_id) {
		medicine_id
		  }
	   }
   `