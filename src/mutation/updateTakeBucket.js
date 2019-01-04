
import gql from 'graphql-tag';

export default gql`
mutation updateTakeBucket($take_bucket_id: ID!,$description: String!, $time_from: AWSTime!, $time_to: AWSTime!,$on_demand: Boolean!) {
  updateBucket(take_bucket_id : $take_bucket_id ,description: $description, time_from: $time_from, time_to: $time_to,on_demand: $on_demand) {
        take_bucket_id
        time_to
        time_from
        description
        on_demand
      }
    } `
