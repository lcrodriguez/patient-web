
import gql from 'graphql-tag';

export default gql`

mutation deleteTakeHistory($take_history_id: ID!) {
	deleteTakeHistory(take_history_id: $take_history_id) {
		take_history_id
		  }
	   }
   `