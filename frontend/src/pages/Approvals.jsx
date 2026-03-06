import { useState, useEffect } from 'react';
import apiClient from '../services/api';

function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/approvals');
      setApprovals(response.data.data.approvals || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await apiClient.patch(`/approvals/${id}/approve`);
      fetchApprovals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please provide a rejection reason:');
    if (!reason) return;

    setActionLoading(id);
    try {
      await apiClient.patch(`/approvals/${id}/reject`, { rejection_reason: reason });
      fetchApprovals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      LOGIN_ACCESS: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const processedApprovals = approvals.filter((a) => a.status !== 'PENDING');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Approvals</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Pending Approvals */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Pending Approvals ({pendingApprovals.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : approvals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              No approval requests yet
            </h2>
            <p className="text-gray-500 mt-2">
              Approval requests will appear here when actions require review.
            </p>
          </div>
        ) : pendingApprovals.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 p-8 text-center text-gray-500">
            No pending approvals
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div
                key={approval.id}
                className="bg-white rounded-lg border border-gray-100 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(
                          approval.type
                        )}`}
                      >
                        {approval.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(approval.created_at)}
                      </span>
                    </div>
                    <p className="font-medium text-gray-800">
                      Request by: {approval.user?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {approval.user?.email}
                    </p>
                    {approval.payload && (
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(approval.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(approval.id)}
                      disabled={actionLoading === approval.id}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === approval.id ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(approval.id)}
                      disabled={actionLoading === approval.id}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === approval.id ? '...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Approvals */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Approval History ({processedApprovals.length})
        </h2>

        {processedApprovals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              No approval history
            </h2>
            <p className="text-gray-500 mt-2">
              Completed approvals will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {processedApprovals.map((approval) => (
                  <tr key={approval.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">
                      {approval.user?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(
                          approval.type
                        )}`}
                      >
                        {approval.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                          approval.status
                        )}`}
                      >
                        {approval.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(approval.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Approvals;
