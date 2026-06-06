import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuth } from '../hooks/useAuth'

import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

import AdminLayout from '../components/layout/AdminLayout'
import AdminDashboard from '../pages/admin/DashboardPage'
import AdminStaff from '../pages/admin/StaffPage'
import AdminParts from '../pages/admin/PartsPage'
import AdminVendors from '../pages/admin/VendorsPage'
import AdminPurchaseInvoices from '../pages/admin/PurchaseInvoicesPage'
import AdminReports from '../pages/admin/ReportsPage'
import AdminReviews from '../pages/admin/ReviewsPage'

import StaffLayout from '../components/layout/StaffLayout'
import StaffDashboard from '../pages/staff/DashboardPage'
import StaffProfile from '../pages/staff/ProfilePage'
import StaffPartRequests from '../pages/staff/PartRequestsPage'
import StaffAppointments from '../pages/staff/AppointmentsPage'
import StaffCustomers from '../pages/staff/CustomersPage'
import StaffSales from '../pages/staff/SalesPage'
import StaffCustomerReports from '../pages/staff/CustomerReportsPage'

import CustomerLayout from '../components/layout/CustomerLayout'
import CustomerDashboard from '../pages/customer/DashboardPage'
import CustomerPartsCatalog from '../pages/customer/PartsCatalogPage'
import CustomerAppointments from '../pages/customer/AppointmentsPage'
import CustomerPartRequests from '../pages/customer/PartRequestsPage'
import CustomerReviews from '../pages/customer/ReviewsPage'
import CustomerHistory from '../pages/customer/HistoryPage'

import UnauthorizedPage from '../pages/UnauthorizedPage'

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'Staff') return <Navigate to="/staff/dashboard" replace />
  return <Navigate to="/customer/dashboard" replace />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/parts" element={<AdminParts />} />
            <Route path="/admin/vendors" element={<AdminVendors />} />
            <Route path="/admin/purchase-invoices" element={<AdminPurchaseInvoices />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Staff']} />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/profile" element={<StaffProfile />} />
            <Route path="/staff/part-requests" element={<StaffPartRequests />} />
            <Route path="/staff/appointments" element={<StaffAppointments />} />
            <Route path="/staff/customers" element={<StaffCustomers />} />
            <Route path="/staff/sales" element={<StaffSales />} />
            <Route path="/staff/customer-reports" element={<StaffCustomerReports />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Customer']} />}>
          <Route element={<CustomerLayout />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/catalog" element={<CustomerPartsCatalog />} />
            <Route path="/customer/appointments" element={<CustomerAppointments />} />
            <Route path="/customer/part-requests" element={<CustomerPartRequests />} />
            <Route path="/customer/reviews" element={<CustomerReviews />} />
            <Route path="/customer/history" element={<CustomerHistory />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
