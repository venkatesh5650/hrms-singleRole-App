import { useState, useEffect } from 'react';
import apiClient from '../services/api';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    action: '',
    method: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchLogs = async (page = 1, filterParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filterParams.action) params.append('action', filterParams.action);
      if (filterParams.method) params.append('method', filterParams.method);

      const response = await apiClient.get(`/logs?${params.toString()}`);
      const data = response.data.data;
      setLogs(data.logs || []);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, filters);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchLogs(1, filters);
  };

  const handlePageChange = (newPage) => {
    fetchLogs(newPage, filters);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMethodBadgeColor = (method) => {
    const colors = {
      GET: 'bg-gray-200 text-gray-800',
      POST: 'bg-blue-100 text-blue-700',
      PUT: 'bg-yellow-100 text-yellow-700',
      PATCH: 'bg-orange-100 text-orange-700',
      DELETE: 'bg-red-100 text-red-700',
    };
    return colors[method] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-400';
    // Industry standard status colors
    if (status === 200 || status === 201) return 'text-green-600 bg-green-50 px-2 py-1 rounded';
    if (status === 204) return 'text-green-600 bg-green-50 px-2 py-1 rounded';
    if (status === 304) return 'text-gray-500 bg-gray-50 px-2 py-1 rounded';
    if (status === 400) return 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded';
    if (status === 401) return 'text-orange-600 bg-orange-50 px-2 py-1 rounded';
    if (status === 403) return 'text-orange-600 bg-orange-50 px-2 py-1 rounded';
    if (status === 404) return 'text-red-600 bg-red-50 px-2 py-1 rounded';
    if (status >= 500) return 'text-red-600 bg-red-50 px-2 py-1 rounded';
    return 'text-gray-600';
  };

  const getResource = (path) => {
    if (!path) return '--';
    const clean = path.split('?')[0];
    const parts = clean.split('/');
    return parts[1] || 'system';
  };

  const formatPath = (path) => {
    if (!path) return '--';
    return path.split('?')[0].replace('/api/v1', '');
  };

  const formatAction = (method) => {
    switch (method) {
      case 'POST':
        return 'Created';
      case 'PUT':
        return 'Updated';
      case 'PATCH':
        return 'Updated';
      case 'DELETE':
        return 'Deleted';
      case 'GET':
        return 'Viewed';
      default:
        return method;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Audit Logs</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <input
              type="text"
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              placeholder="Search action..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Method
            </label>
            <select
              name="method"
              value={filters.method}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No logs found</div>
        ) : (
          <>
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Path
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {log.user?.name || log.user_id || '--'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.action}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${getMethodBadgeColor(
                          log.method
                        )}`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {formatPath(log.path)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusColor(log.status)}>
                        {log.status || '--'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * 20 + 1} to{' '}
                  {Math.min(pagination.page * 20, pagination.total)} of{' '}
                  {pagination.total} results
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Logs;
