import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/teams': 'Teams',
  '/users': 'Users',
  '/approvals': 'Approvals',
  '/logs': 'Audit Logs',
};

function Header() {
  const location = useLocation();
  const { user } = useAuth();

  const pageTitle = pageTitles[location.pathname] || 'HRMS';

  return (
    <header className="h-full px-6 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">{pageTitle}</h2>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{user?.name || 'User'}</span>
          <span className="mx-2">•</span>
          <span className="text-gray-500">{user?.role || 'Employee'}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
