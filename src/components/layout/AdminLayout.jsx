import DashboardLayout from './DashboardLayout'
import { ROLES } from './roleConfig'

export default function AdminLayout() {
  return <DashboardLayout cfg={ROLES.admin} />
}
