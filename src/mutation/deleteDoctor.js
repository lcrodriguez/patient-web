
import gql from 'graphql-tag';

export default gql`

mutation deleteDoctor($doctor_id: ID!) {
      deleteDoctor(doctor_id: $doctor_id) {
        doctor_id
            }
         }
     `
