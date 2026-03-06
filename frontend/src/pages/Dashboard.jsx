import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTeams: 0,
    pendingApprovals: 0,
    totalUsers: 0,
    loading: true,
    error: null,
  });
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [employeesRes, teamsRes, approvalsRes, usersRes, logsRes] = await Promise.all([
          apiClient.get('/employees?limit=1'),
          apiClient.get('/teams?limit=1'),
          apiClient.get('/approvals/pending'),
          apiClient.get('/users?limit=1'),
          apiClient.get('/logs?page=1&limit=10'),
        ]);

        setStats({
          totalEmployees: employeesRes.data.data.total || 0,
          totalTeams: teamsRes.data.data.total || 0,
          pendingApprovals: approvalsRes.data.data.length || 0,
          totalUsers: usersRes.data.data.total || 0,
          loading: false,
          error: null,
        });

        // Filter to show only meaningful actions (exclude GET requests)
        let meaningfulLogs = (logsRes.data.data.logs || []).filter(
          log => log.method !== 'GET'
        );
        
        // If no meaningful logs, fallback to latest logs
        const displayLogs = meaningfulLogs.length > 0 ? meaningfulLogs : (logsRes.data.data.logs || []).slice(0, 5);
        
        setRecentLogs(displayLogs);
      } catch (error) {
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      label: 'Total Employees',
      value: stats.totalEmployees,
      icon: '👥',
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Total Teams',
      value: stats.totalTeams,
      icon: '🏢',
      color: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: '⏳',
      color: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Active Users',
      value: stats.totalUsers,
      icon: '✅',
      color: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Dashboard</h1>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} rounded-lg p-4 md:p-6 border border-gray-100`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                <p className={`text-2xl md:text-3xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <span className="text-2xl md:text-4xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {stats.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {stats.error}
        </div>
      )}

      {/* Quick Actions and Recent Activity */}
      <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Activity
          </h2>
          {recentLogs.length > 0 ? (
            <ul className="space-y-3">
              {recentLogs.map((log) => {
                const path = log.path || '';
const cleanPath = path.split('?')[0].replace('/api/v1/', '');
const resource = cleanPath.split('/')[0] || 'resource';

const formatActivity = () => {
  const method = log.method;
  const userName = log.user?.name || 'User';

  const actions = {
    POST: 'created',
    PUT: 'updated',
    PATCH: 'updated',
    DELETE: 'deleted',
    GET: 'viewed'
  };

  const action = actions[method] || 'performed action';

  return `${userName} ${action} ${resource}`;
};
                
                return (
                  <li key={log.id} className="text-xs md:text-sm flex items-start gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded font-medium flex-shrink-0 ${
                      log.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                      log.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                      log.method === 'PATCH' ? 'bg-orange-100 text-orange-700' :
                      log.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {log.method}
                    </span>
                    <span className="text-gray-700 truncate">{formatActivity()}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No recent activity yet</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/employees')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              + Add New Employee
            </button>
            <button 
              onClick={() => navigate('/teams')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              + Create New Team
            </button>
            <button 
              onClick={() => navigate('/approvals')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              View Pending Approvals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
