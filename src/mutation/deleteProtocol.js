
import gql from 'graphql-tag';

export default gql`

mutation deleteProtocol($protocol_id: ID!) {
  deleteProtocol(protocol_id: $protocol_id) {
    protocol_id
        }
     }
 `