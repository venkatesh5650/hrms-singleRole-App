import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../services/api';

function TeamMembers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [adding, setAdding] = useState(false);

  const loadMembers = async () => {
    try {
      const [teamRes, employeesRes] = await Promise.all([
        apiClient.get(`/teams/${id}`),
        apiClient.get('/employees?limit=1000'),
      ]);
      setTeam(teamRes.data.data);
      const allEmps = employeesRes.data.data.employees || [];
      setAllEmployees(allEmps);
      
      // Filter employees that belong to this team
      const members = allEmps.filter(emp => emp.team_id === parseInt(id));
      setTeamMembers(members);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [id]);

  // Filter employees not already in the team
  const availableEmployees = allEmployees.filter(
    emp => !emp.team_id || emp.team_id !== parseInt(id)
  );

  const handleAddMember = async () => {
    if (!selectedEmployee) return;
    
    setAdding(true);
    setError(null);
    
    try {
      await apiClient.post(`/teams/${id}/employees/${selectedEmployee}`);
      setSelectedEmployee('');
      setShowAddMember(false);
      await loadMembers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (employeeId) => {
    try {
      // Fix: Correct endpoint for removing member from team
      await apiClient.delete(`/teams/${id}/employees/${employeeId}`);
      await loadMembers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/teams')}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2"
          >
            ← Back to Teams
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Manage Members - {team?.name}
          </h1>
        </div>
        <button
          onClick={() => setShowAddMember(!showAddMember)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddMember ? 'Cancel' : '+ Add Member'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Add Member Section */}
      {showAddMember && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Add Team Member
          </h2>
          
          {availableEmployees.length === 0 ? (
            <p className="text-gray-500">No employees available to add</p>
          ) : (
            <div className="flex gap-4 items-center">
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an employee</option>
                {availableEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} - {emp.email}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddMember}
                disabled={!selectedEmployee || adding}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Current Members */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Current Members ({teamMembers.length})
          </h2>
        </div>

        {teamMembers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No members in this team yet
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teamMembers.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                      </div>
                      <span className="font-medium text-gray-800">
                        {emp.first_name} {emp.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {emp.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        emp.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {emp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRemoveMember(emp.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TeamMembers;
