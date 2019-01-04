import gql from 'graphql-tag';

export default gql`

query list_notification{
  list_notification{
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
