import gql from 'graphql-tag';

export default gql`

query getMedicineById($medicine_id:ID!){
  getMedicineById(medicine_id: $medicine_id){
  items {
    medicine_id
   }
  }
}`
