import DashboardLayout from './DashboardLayout'
import { ROLES } from './roleConfig'

export default function CustomerLayout() {
  return <DashboardLayout cfg={ROLES.customer} />
}
