import DashboardLayout from './DashboardLayout'
import { ROLES } from './roleConfig'

export default function StaffLayout() {
  return <DashboardLayout cfg={ROLES.staff} />
}
