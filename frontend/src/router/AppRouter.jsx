import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/layout/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Employees from '../pages/Employees';
import CreateEmployee from '../pages/CreateEmployee';
import EditEmployee from '../pages/EditEmployee';
import Teams from '../pages/Teams';
import EditTeam from '../pages/EditTeam';
import TeamMembers from '../pages/TeamMembers';
import Users from '../pages/Users';
import EditUser from '../pages/EditUser';
import Approvals from '../pages/Approvals';
import Logs from '../pages/Logs';

function AppRouter() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* Public route */}
      <Route
  path="/login"
  element={
    localStorage.getItem("token")
      ? <Navigate to="/dashboard" replace />
      : <Login />
  }
/>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/new" element={<CreateEmployee />} />
          <Route path="employees/:id/edit" element={<EditEmployee />} />
          <Route path="teams" element={<Teams />} />
          <Route path="teams/:id/edit" element={<EditTeam />} />
          <Route path="teams/:id/members" element={<TeamMembers />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id/edit" element={<EditUser />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="logs" element={<Logs />} />
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route
        path="*"
        element={
          token
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default AppRouter;
