import React, { useState, useEffect } from 'react';
import { getTeamData } from '../../api/manager';
import { Search, Filter, AlertCircle, RefreshCw, Calendar, User, Tag, Award } from 'lucide-react';

export default function SharedGoals() {
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedThrustArea, setSelectedThrustArea] = useState('All');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchSharedGoals();
  }, [currentYear]);

  const fetchSharedGoals = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTeamData(currentYear);
      setTeamData(data);
    } catch (err) {
      console.error('Error fetching team goals:', err);
      setError('Failed to load team goals. Please ensure you are logged in as a Manager.');
    } finally {
      setLoading(false);
    }
  };

  // Flatten the goals list to include owner details inside the goal object for easier filtering
  const allTeamGoals = teamData.flatMap(member => 
    (member.goals || []).map(goal => ({
      ...goal,
      ownerName: member.name,
      ownerEmail: member.email,
      ownerId: member.id
    }))
  );

  // Extract unique thrust areas and statuses for filters
  const uniqueThrustAreas = [...new Set(allTeamGoals.map(g => g.thrust_area?.name || 'Unassigned'))];
  const uniqueStatuses = [...new Set(allTeamGoals.map(g => g.status))];

  // Apply filters
  const filteredGoals = allTeamGoals.filter(goal => {
    const matchesSearch = 
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (goal.description && goal.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'All' || goal.status === selectedStatus;
    const matchesThrustArea = selectedThrustArea === 'All' || (goal.thrust_area?.name || 'Unassigned') === selectedThrustArea;

    return matchesSearch && matchesStatus && matchesThrustArea;
  });

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'pending':
      case 'pending review':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      case 'draft':
        return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border border-slate-500/20';
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500 px-4 md:px-8 py-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Shared Goals Dashboard</h1>
          <p className="text-secondary font-body-lg text-body-lg">
            Monitor and track the strategic objectives of all employees reporting to you.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] self-center">Year:</label>
          <select 
            className="bg-surface py-2 px-4 rounded-xl border-none neumorphic-inset focus:ring-2 focus:ring-primary font-bold text-on-surface"
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
          <button 
            onClick={fetchSharedGoals}
            className="p-3 rounded-xl bg-surface text-primary hover:text-primary-dark neumorphic-outset hover:scale-105 active:scale-95 transition-all"
            title="Refresh Goals"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-error-container/20 border border-error/20 p-4 rounded-2xl flex items-start gap-3 text-error mb-8">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm">Error Loading Goals</h3>
            <p className="text-xs text-error/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-surface rounded-3xl p-6 mb-8 shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input 
              type="text"
              placeholder="Search by employee, title, description..."
              className="w-full bg-surface py-3 pl-12 pr-4 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary text-sm font-bold text-on-surface placeholder:text-secondary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <Filter className="text-secondary shrink-0" size={18} />
            <select
              className="w-full bg-surface p-3 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary text-sm font-bold text-on-surface"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Thrust Area Filter */}
          <div className="flex items-center gap-3">
            <Tag className="text-secondary shrink-0" size={18} />
            <select
              className="w-full bg-surface p-3 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary text-sm font-bold text-on-surface"
              value={selectedThrustArea}
              onChange={(e) => setSelectedThrustArea(e.target.value)}
            >
              <option value="All">All Focus Areas</option>
              {uniqueThrustAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Goals Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-surface rounded-3xl p-8 shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] border border-white/20 h-64 animate-pulse">
              <div className="h-6 bg-surface-dim rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-surface-dim rounded w-2/3 mb-6"></div>
              <div className="h-4 bg-surface-dim rounded w-full mb-2"></div>
              <div className="h-4 bg-surface-dim rounded w-4/5 mb-6"></div>
              <div className="h-10 bg-surface-dim rounded w-1/2 mt-auto"></div>
            </div>
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="bg-surface rounded-3xl p-16 shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] border border-white/20 text-center flex flex-col items-center justify-center">
          <Award size={48} className="text-secondary mb-4 opacity-50" />
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No Goals Found</h3>
          <p className="text-secondary text-sm max-w-md">
            There are no goals matching your search filters, or your reporting employees haven't created goals for {currentYear} yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredGoals.map((goal) => (
            <div 
              key={goal.id} 
              className="bg-surface rounded-3xl p-8 shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] border border-white/20 flex flex-col hover:scale-[1.02] transition-all duration-300 relative group"
            >
              {/* Top Row: Employee Name and Status */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-wider">
                  <User size={14} className="text-primary" />
                  <span>{goal.ownerName}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getStatusBadgeClass(goal.status)}`}>
                  {goal.status}
                </span>
              </div>

              {/* Title and Description */}
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2 group-hover:text-primary transition-colors">
                {goal.title}
              </h2>
              <p className="text-secondary text-sm mb-6 line-clamp-3">
                {goal.description || 'No description provided.'}
              </p>

              {/* Target & Weight Badges */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-surface-dim shadow-inner border border-white/10 mb-6 mt-auto">
                <div>
                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest block mb-1">Target</span>
                  <span className="text-sm font-bold text-on-surface">{goal.target} <span className="text-[10px] text-secondary font-normal">{goal.uom}</span></span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest block mb-1">Weight</span>
                  <span className="text-sm font-bold text-primary">{goal.weight}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest block mb-1">Year</span>
                  <span className="text-sm font-bold text-on-surface">{goal.year}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-between items-center border-t border-surface-dim pt-4 mt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-secondary">
                  <Tag size={12} />
                  <span>{goal.thrust_area?.name || 'General Focus'}</span>
                </div>
                <a 
                  href={`/manager/goals/review/${goal.ownerId}`} 
                  className="px-5 py-2 rounded-xl bg-surface text-primary font-bold text-xs neumorphic-outset hover:scale-105 active:scale-95 hover:text-primary-dark transition-all flex items-center gap-1"
                >
                  Review Goals →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
