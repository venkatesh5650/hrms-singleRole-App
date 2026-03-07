import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [assigningManager, setAssigningManager] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [teamsRes, employeesRes] = await Promise.all([
        apiClient.get('/teams?limit=100'),
        apiClient.get('/employees?limit=1000'),
      ]);
      setTeams(teamsRes.data.data.teams || []);
      setEmployees(employeesRes.data.data.employees || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getMemberCount = (team) => {
    return team.members?.length || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiClient.post('/teams', formData);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddManagerModal = (team) => {
    setSelectedTeam(team);
    setShowManagerModal(true);
  };

  const handleAssignManager = async (managerId) => {
    if (!selectedTeam || !managerId) return;
    
    setAssigningManager(true);
    try {
      await apiClient.post(`/teams/${selectedTeam.id}/manager/${managerId}`);
      setShowManagerModal(false);
      setSelectedTeam(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign manager');
    } finally {
      setAssigningManager(false);
    }
  };

  const handleRemoveManager = async (team) => {
    if (!team || !team.manager) return;
    
    if (!window.confirm(`Remove ${team.manager.first_name} ${team.manager.last_name} as manager of ${team.name}?`)) {
      return;
    }
    
    try {
      await apiClient.put(`/teams/${team.id}`, { manager_id: null });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove manager');
    }
  };

  // Get employees with Manager role for assignment
  const managerEmployees = employees.filter(emp => emp.role === 'Manager');

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Teams</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Create Team'}
        </button>
      </div>

      {/* Create Team Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Create New Team
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter team description"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Team'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: '', description: '' });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Message */}
      {!showForm && error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Teams List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : teams.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No teams found. Create your first team!
          </div>
        ) : (
          teams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {team.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getMemberCount(team)} members
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    team.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {team.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {/* Manager Info */}
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Manager</p>
                {team.manager ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">
                      {team.manager.first_name} {team.manager.last_name}
                    </p>
                    <button
                      onClick={() => handleRemoveManager(team)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400 italic">No manager assigned</p>
                    <button
                      onClick={() => openAddManagerModal(team)}
                      className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      + Add Manager
                    </button>
                  </div>
                )}
              </div>
              
              {team.description && (
                <p className="text-sm text-gray-600 mb-4">{team.description}</p>
              )}
              
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => navigate(`/teams/${team.id}/edit`)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button 
                  onClick={() => navigate(`/teams/${team.id}/members`)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Manage Members
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Manager Modal */}
      {showManagerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Add Manager to {selectedTeam?.name}
              </h3>
              
              {managerEmployees.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-2">No employees with Manager role found.</p>
                  <p className="text-sm text-gray-400">Create employees with Manager role to assign them as team managers.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {managerEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => handleAssignManager(emp.id)}
                      disabled={assigningManager}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-50"
                    >
                      <p className="font-medium text-gray-800">
                        {emp.first_name} {emp.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{emp.email}</p>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowManagerModal(false);
                    setSelectedTeam(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Teams;
