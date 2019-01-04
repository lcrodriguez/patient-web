
import gql from 'graphql-tag';

export default gql`

mutation updateNotification($notification_id: ID!, $patient_id: ID!, $local: Boolean, $scheduled_at: AWSDateTime, $repeat: Notification_Repeat,
$message: String, $type: Notification_Type, $active: Boolean) {
	updateNotification(	notification_id : $notification_id ,patient_id: $patient_id, local: $local, scheduled_at: $scheduled_at,
				 repeat: $repeat, message: $message,	type: $type,active: $active) {
         		 notification_id
				 patient_id
				 local
  		  		 scheduled_at
				 repeat
				 message
				 type
				 active
       }
     }`
