import gql from 'graphql-tag';

export default gql`

query getBucketById($take_bucket_id:ID!){
  getBucketById(take_bucket_id: $take_bucket_id){
  items {
    take_bucket_id
   }
  }
}`
