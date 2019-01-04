
import gql from 'graphql-tag';

export default gql`

mutation deleteNotification($notification_id: ID!) {
	deleteNotification(notification_id: $notification_id) {
	  	  notification_id
		  }
	   }
   `
