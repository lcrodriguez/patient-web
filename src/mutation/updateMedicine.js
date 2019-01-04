
import gql from 'graphql-tag';

export default gql`
mutation updateMedicine($medicine_id: ID!,$name: String!, $description: String,	$unity: Medicine_Unity!,	$icon: String, $color: String, $dosage: Int) {
	updateMedicine(medicine_id : $medicine_id , name: $name, description: $description, unity: $unity , icon: $icon, color: $color, dosage: $dosage) {
	medicine_id
	name
	description
	icon
	dosage
  }
}`
