
import gql from 'graphql-tag';

export default gql`

     mutation deleteClinic($clinic_id: ID!) {
      deleteClinic(clinic_id: $clinic_id) {
        clinic_id
            }
         }
      `
