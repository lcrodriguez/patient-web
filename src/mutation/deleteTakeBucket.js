
import gql from 'graphql-tag';

export default gql`

mutation deleteTakeBucket($take_bucket_id: ID!) {
  deleteTakeBucket(take_bucket_id: $take_bucket_id) {
    take_bucket_id
        }
     }
 `