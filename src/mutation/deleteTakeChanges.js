
import gql from 'graphql-tag';

export default gql`

mutation deleteTakeChanges($take_changes_id: ID!) {
  deleteTakeChanges(take_changes_id: $take_changes_id) {
    take_changes_id
        }
     }
  `
