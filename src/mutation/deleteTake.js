
import gql from 'graphql-tag';

export default gql`

mutation deleteTake($take_id: ID!) {
	deleteTake(take_id: $take_id) {
		take_id
		  }
	   }
   `