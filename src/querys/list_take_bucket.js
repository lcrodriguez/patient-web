
import gql from 'graphql-tag';

export default gql`

query list_take_bucket{
  list_take_bucket{
    take_bucket_id
    time_to
    time_from
    description
    on_demand
  }
}`
