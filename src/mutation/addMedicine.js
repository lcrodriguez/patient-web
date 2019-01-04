
import gql from 'graphql-tag';

export default gql`

mutation addMedicine($name: String!, $description: String, $unity: Medicine_Unity!,	$icon: String, $color: String,$dosage: Int) {
  addMedicine(name: $name, description: $description, unity: $unity, icon: $icon, color: $color,dosage: $dosage) {
     medicine_id
     name
     description
     icon
     color
     dosage
   }
 } `
