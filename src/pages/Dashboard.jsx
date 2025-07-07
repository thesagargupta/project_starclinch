import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { incidentsAPI } from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({
    total_incidents: 0,
    open_incidents: 0,
    closed_incidents: 0,
    high_priority: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [incidentsResult, statsResult] = await Promise.all([
        incidentsAPI.getIncidents(), // Backend already filters by current user
        incidentsAPI.getIncidentStats()
      ]);

      if (incidentsResult.success) {
        // Backend already filters by current user, just ensure it's an array
        const userIncidents = Array.isArray(incidentsResult.data) 
          ? incidentsResult.data
          : [];
        console.log('Fetched incidents:', userIncidents);
        setIncidents(userIncidents);
      } else {
        console.error('Failed to fetch incidents:', incidentsResult.error);
        setIncidents([]);
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setIncidents([]); // Ensure incidents is empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchDashboardData();
      return;
    }

    try {
      const result = await incidentsAPI.searchIncidents(searchQuery);
      if (result.success) {
        // Backend already filters by current user, just ensure it's an array
        const userIncidents = Array.isArray(result.data) 
          ? result.data
          : [];
        console.log('Search results:', userIncidents);
        setIncidents(userIncidents);
      } else {
        setError('Search failed');
        setIncidents([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed');
      setIncidents([]);
    }
  };

  const handleCloseIncident = async (incidentId) => {
    try {
      const result = await incidentsAPI.updateIncident(incidentId, { status: 'CLOSED' });
      if (result.success) {
        fetchDashboardData(); // Refresh data
      } else {
        setError('Failed to close incident');
      }
    } catch (error) {
      console.error('Error closing incident:', error);
      setError('Failed to close incident');
    }
  };

  const handleEditIncident = (incident) => {
    if (incident.status === 'CLOSED') {
      setError('Cannot edit closed incidents');
      return;
    }
    setEditingIncident(incident);
    setShowEditModal(true);
  };

  const handleUpdateIncident = async (incidentId, updatedData) => {
    try {
      const result = await incidentsAPI.updateIncident(incidentId, updatedData);
      if (result.success) {
        fetchDashboardData(); // Refresh data
        setShowEditModal(false);
        setEditingIncident(null);
      } else {
        setError('Failed to update incident');
      }
    } catch (error) {
      console.error('Error updating incident:', error);
      setError('Failed to update incident');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the router
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Incident Management System</h1>
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">Welcome, {user?.first_name} {user?.last_name}</span>
              <span className="user-email">{user?.email}</span>
              <span className="user-type">{user?.user_type}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Incidents</h3>
          <p className="stat-number">{stats.total_incidents || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Open Incidents</h3>
          <p className="stat-number open">{stats.open_incidents || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Closed Incidents</h3>
          <p className="stat-number closed">{stats.closed_incidents || 0}</p>
        </div>
        <div className="stat-card">
          <h3>High Priority</h3>
          <p className="stat-number high">{stats.high_priority || 0}</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="actions-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by Incident ID (e.g., RMG12345****)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        <div className="action-buttons">
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create New Incident
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {/* Incidents Table */}
      <div className="incidents-container">
        <h2>Recent Incidents</h2>
        {incidents.length === 0 ? (
          <div className="no-incidents">
            <p>No incidents found.</p>
          </div>
        ) : (
          <div className="incidents-table">
            <table>
              <thead>
                <tr>
                  <th>Incident ID</th>
                  <th>Description</th>
                  <th>Reporter</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td className="incident-id">{incident.incident_id}</td>
                    <td className="incident-details">{incident.incident_details?.substring(0, 100)}...</td>
                    <td>{incident.reporter_name}</td>
                    <td>
                      <span className={`type-badge ${incident.reporter_type?.toLowerCase()}`}>
                        {incident.reporter_type}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${incident.priority?.toLowerCase()}`}>
                        {incident.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${incident.status?.toLowerCase()}`}>
                        {incident.status}
                      </span>
                    </td>
                    <td>{new Date(incident.reported_date || incident.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditIncident(incident)}
                          className="btn btn-sm btn-secondary"
                          disabled={incident.status === 'CLOSED'}
                        >
                          {incident.status === 'CLOSED' ? 'View' : 'Edit'}
                        </button>
                        {incident.status !== 'CLOSED' && (
                          <button
                            onClick={() => handleCloseIncident(incident.id)}
                            className="btn btn-sm btn-danger"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <CreateIncidentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchDashboardData();
          }}
        />
      )}

      {/* Edit Incident Modal */}
      {showEditModal && editingIncident && (
        <EditIncidentModal
          incident={editingIncident}
          onClose={() => {
            setShowEditModal(false);
            setEditingIncident(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingIncident(null);
            fetchDashboardData();
          }}
          onUpdate={handleUpdateIncident}
        />
      )}
    </div>
  );
};

// Create Incident Modal Component
const CreateIncidentModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    incident_details: '',
    priority: 'MEDIUM',
    reporter_type: 'ENTERPRISE', // Default to Enterprise, user can change
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Send only the fields expected by IncidentCreateSerializer
      const incidentData = {
        incident_details: formData.incident_details,
        priority: formData.priority,
        reporter_type: formData.reporter_type,
      };

      console.log('Sending incident data:', incidentData);
      
      const result = await incidentsAPI.createIncident(incidentData);
      if (result.success) {
        onSuccess();
      } else {
        console.error('API error:', result.error);
        setError(result.error.message || result.error.detail || 'Failed to create incident');
      }
    } catch (error) {
      console.error('Create incident error:', error);
      setError('Failed to create incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create New Incident</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Reporter Information Section */}
          <div className="form-section">
            <h4>Reporter Information</h4>
            <div className="form-group">
              <label>Reporter Name</label>
              <input
                type="text"
                value={`${user?.first_name || ''} ${user?.last_name || ''}`.trim()}
                readOnly
                className="form-input readonly"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="form-input readonly"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reporter_type">Reporter Type</label>
              <select
                id="reporter_type"
                name="reporter_type"
                value={formData.reporter_type}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="ENTERPRISE">Enterprise</option>
                <option value="GOVERNMENT">Government</option>
              </select>
            </div>
          </div>

          {/* Incident Details Section */}
          <div className="form-section">
            <h4>Incident Details</h4>
            <div className="form-group">
              <label htmlFor="incident_details">Incident Description</label>
              <textarea
                id="incident_details"
                name="incident_details"
                value={formData.incident_details}
                onChange={handleChange}
                required
                rows="6"
                className="form-input"
                placeholder="Provide detailed description of the incident..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Creating...' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Incident Modal Component
const EditIncidentModal = ({ incident, onClose, onSuccess, onUpdate }) => {
  const [formData, setFormData] = useState({
    incident_details: incident.incident_details || '',
    priority: incident.priority || 'MEDIUM',
    status: incident.status || 'OPEN',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await onUpdate(incident.id, formData);
      onSuccess();
    } catch (error) {
      console.error('Update incident error:', error);
      setError('Failed to update incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isReadOnly = incident.status === 'CLOSED';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{isReadOnly ? 'View Incident' : 'Edit Incident'} - {incident.incident_id}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Incident Information */}
          <div className="form-section">
            <h4>Incident Information</h4>
            <div className="form-group">
              <label>Incident ID</label>
              <input
                type="text"
                value={incident.incident_id}
                readOnly
                className="form-input readonly"
              />
            </div>
            <div className="form-group">
              <label>Reporter</label>
              <input
                type="text"
                value={incident.reporter_name}
                readOnly
                className="form-input readonly"
              />
            </div>
            <div className="form-group">
              <label>Reported Date</label>
              <input
                type="text"
                value={new Date(incident.reported_date || incident.created_at).toLocaleString()}
                readOnly
                className="form-input readonly"
              />
            </div>
          </div>

          {/* Editable Fields */}
          <div className="form-section">
            <h4>Incident Details</h4>
            <div className="form-group">
              <label htmlFor="incident_details">Incident Description</label>
              <textarea
                id="incident_details"
                name="incident_details"
                value={formData.incident_details}
                onChange={handleChange}
                required
                rows="6"
                className="form-input"
                readOnly={isReadOnly}
              />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="form-select"
                  disabled={isReadOnly}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                  disabled={isReadOnly}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Updating...' : 'Update Incident'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;