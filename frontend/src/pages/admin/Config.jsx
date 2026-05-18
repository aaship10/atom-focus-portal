import React, { useState, useEffect } from 'react';
import { getUsers, updateUserHierarchy, getRoles } from '../../api/admin';
import { apiClient } from '../../api/client';
import { 
  Settings, 
  Search, 
  Users, 
  Shield, 
  Building2, 
  Edit3, 
  Check, 
  AlertCircle, 
  Zap, 
  X,
  RefreshCw
} from 'lucide-react';

export default function SystemConfig() {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal Edit State
  const [editingUser, setEditingUser] = useState(null);
  const [selectedManager, setSelectedManager] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Auto-Assign State
  const [autoAssigning, setAutoAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [allUsers, allRoles] = await Promise.all([
        getUsers(),
        getRoles()
      ]);
      
      setUsers(allUsers);
      setRoles(allRoles);
      
      // Filter out users who have the "Manager" role to populate manager dropdowns
      const mgrList = allUsers.filter(u => u.role === 'Manager');
      setManagers(mgrList);
      
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load user hierarchy data.');
    } finally {
      setLoading(false);
    }
  }

  const triggerFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setSelectedManager(user.manager_id || '');
    // Find matching role ID based on user.role name
    const matchingRole = roles.find(r => r.name === user.role);
    setSelectedRole(matchingRole ? matchingRole.id : '');
    setSelectedDept(user.department || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = {
        manager_id: selectedManager ? parseInt(selectedManager) : -1, // -1 clear manager
        role_id: selectedRole ? parseInt(selectedRole) : null,
        department: selectedDept
      };
      
      await updateUserHierarchy(editingUser.id, payload);
      triggerFeedback(`Successfully updated reporting hierarchy for ${editingUser.name}!`);
      setEditingUser(null);
      loadData();
    } catch (err) {
      triggerFeedback(err.message || 'Failed to update hierarchy.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!window.confirm('This will sequentially assign all Employees without managers to existing Managers in a round-robin fashion. Proceed?')) {
      return;
    }
    setAutoAssigning(true);
    try {
      // Direct post to backend auto-assign endpoint
      const { response, data } = await apiClient('/users/auto-assign-managers', {
        method: 'POST'
      });
      if (!response.ok) throw new Error(data?.detail || 'Round-robin assignment failed');
      
      triggerFeedback(data.message || 'Successfully run round-robin manager assignment!');
      loadData();
    } catch (err) {
      triggerFeedback(err.message || 'Failed to run auto-assignment.', 'error');
    } finally {
      setAutoAssigning(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-secondary font-bold">Importing Organization Hierarchy...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-container-padding transition-all duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Feedback Toast */}
        {feedback && (
          <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in ${
            feedback.type === 'error' 
              ? 'bg-error-container text-on-error-container border border-error/20' 
              : 'bg-surface border-2 border-success text-success neumorphic-outset'
          }`}>
            {feedback.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
            <span className="text-xs font-bold">{feedback.message}</span>
          </div>
        )}

        {/* Header */}
        <header className="mb-stack-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">System & Hierarchy Config</h1>
            <p className="text-secondary font-body-lg text-body-lg">Manage role allocations, reporting managers, and departments.</p>
          </div>
          <button
            onClick={handleAutoAssign}
            disabled={autoAssigning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-primary text-on-primary neumorphic-button hover:bg-primary/95 disabled:opacity-60 shrink-0"
          >
            {autoAssigning ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
            {autoAssigning ? 'Re-aligning hierarchy...' : 'Auto-Assign Managers'}
          </button>
        </header>

        {/* Search Bar */}
        <div className="bg-surface p-4 rounded-2xl neumorphic-outset mb-6 flex items-center gap-3">
          <Search size={20} className="text-secondary shrink-0" />
          <input 
            type="text"
            placeholder="Search employees by name, email, department, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none font-bold text-on-surface placeholder:text-secondary/60 text-sm"
          />
        </div>

        {/* Users Table */}
        <div className="bg-surface rounded-2xl neumorphic-outset overflow-hidden mb-stack-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-dim/30 border-b border-surface-dim/50">
                  <th className="p-4 font-label-caps text-label-caps text-secondary">Employee</th>
                  <th className="p-4 font-label-caps text-label-caps text-secondary">Department</th>
                  <th className="p-4 font-label-caps text-label-caps text-secondary">Role Allocation</th>
                  <th className="p-4 font-label-caps text-label-caps text-secondary">Reporting Manager</th>
                  <th className="p-4 font-label-caps text-label-caps text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-dim/40">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-dim/10 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{user.name}</span>
                        <span className="text-xs text-secondary">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                        <Building2 size={14} className="text-primary" />
                        {user.department}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        user.role === 'Admin' 
                          ? 'bg-error-container text-on-error-container' 
                          : user.role === 'Manager' 
                            ? 'bg-primary-fixed/30 text-on-primary-fixed'
                            : 'bg-secondary-container text-on-secondary-container'
                      }`}>
                        <Shield size={12} />
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                        <Users size={14} className="text-secondary" />
                        {user.manager_name}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="p-2 rounded-lg bg-surface border border-surface-dim/50 text-primary neumorphic-button hover:bg-surface-dim/20"
                        title="Edit Hierarchy"
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-secondary italic">
                      No employees match your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-2xl neumorphic-outset w-full max-w-lg animate-scale-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-md text-headline-md text-on-surface">Update System Alignments</h3>
                <button 
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 rounded-lg text-secondary hover:text-primary neumorphic-button"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-6 p-4 neumorphic-inset rounded-xl bg-surface/50">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-secondary uppercase">Configuring Employee</span>
                  <span className="font-black text-on-surface text-lg mt-0.5">{editingUser.name}</span>
                  <span className="text-xs text-secondary">{editingUser.email}</span>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-secondary uppercase">Role Assignment</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="p-3 bg-surface rounded-xl neumorphic-inset text-on-surface focus:outline-none font-bold"
                    required
                  >
                    <option value="">Select a system role</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-secondary uppercase">Reporting Manager</label>
                  <select
                    value={selectedManager}
                    onChange={(e) => setSelectedManager(e.target.value)}
                    className="p-3 bg-surface rounded-xl neumorphic-inset text-on-surface focus:outline-none font-bold"
                  >
                    <option value="-1">No Manager (Upper Management / Admin)</option>
                    {managers
                      .filter(m => m.id !== editingUser.id) // Cannot report to themselves
                      .map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
                      ))
                    }
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-secondary uppercase">Department</label>
                  <input
                    type="text"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    placeholder="Engineering, Product, Sales, etc."
                    className="p-3 bg-surface rounded-xl neumorphic-inset text-on-surface focus:outline-none font-bold text-sm"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-5 py-2.5 rounded-xl font-bold bg-surface text-secondary border border-surface-dim neumorphic-button hover:bg-surface-dim/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2.5 rounded-xl font-bold bg-primary text-on-primary neumorphic-button flex items-center gap-2 hover:bg-primary/95 disabled:opacity-60"
                  >
                    {updating ? 'Updating...' : 'Save Alignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
