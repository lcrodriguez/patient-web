import gql from 'graphql-tag';

export default gql`

query getProtocolById($protocol_id:ID!){
  getProtocolById(protocol_id: $protocol_id){
  items {
    protocol_id
    patient{
      patient_id
    }
   }
  }
}`
