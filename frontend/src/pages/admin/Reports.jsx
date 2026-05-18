import React, { useState, useEffect } from 'react';
import { getCompletionDashboard, getAchievementReports, exportAchievementReports } from '../../api/admin';
import { 
  FileText, 
  Download, 
  Search, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Filter, 
  BarChart2, 
  Users, 
  Compass 
} from 'lucide-react';

export default function ReportsAndGovernance() {
  const [activeTab, setActiveTab] = useState('completion'); // 'completion' or 'achievement'
  const [completionData, setCompletionData] = useState(null);
  const [achievementData, setAchievementData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [departments, setDepartments] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [completion, achievement] = await Promise.all([
        getCompletionDashboard(),
        getAchievementReports()
      ]);
      
      setCompletionData(completion);
      setAchievementData(achievement);
      
      // Extract unique departments for filtering
      const depts = new Set(['All']);
      achievement.forEach(g => {
        if (g.department) depts.add(g.department);
      });
      setDepartments(Array.from(depts));
      
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load governance report data.');
    } finally {
      setLoading(false);
    }
  }

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const blob = await exportAchievementReports();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `organization_achievement_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  // Filters logic
  const getFilteredReports = () => {
    if (activeTab === 'completion') {
      if (!completionData) return [];
      return completionData.reports.filter(report => {
        const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              report.manager_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDept === 'All' || report.department === selectedDept;
        return matchesSearch && matchesDept;
      });
    } else {
      return achievementData.filter(item => {
        const matchesSearch = item.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDept === 'All' || item.department === selectedDept;
        return matchesSearch && matchesDept;
      });
    }
  };

  const filteredReports = getFilteredReports();

  if (loading && !completionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-secondary font-bold">Aggregating Compliance Metrics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-container-padding transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-stack-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Reporting & Governance</h1>
            <p className="text-secondary font-body-lg text-body-lg">Track corporate check-in completion rates and download performance logs.</p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-primary text-on-primary neumorphic-button hover:bg-primary/95 disabled:opacity-60 shrink-0"
          >
            <Download size={18} />
            {exporting ? 'Generating CSV...' : 'Export Achievement Reports (CSV)'}
          </button>
        </header>

        {/* Tab Controls */}
        <div className="flex gap-4 p-2 neumorphic-inset rounded-2xl bg-surface mb-6 max-w-md">
          <button
            onClick={() => setActiveTab('completion')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === 'completion' 
                ? 'bg-surface shadow-[4px_4px_8px_#AEAEC0,-4px_-4px_8px_#FFFFFF] text-primary' 
                : 'text-secondary hover:text-primary'
            }`}
          >
            Completion Dashboard
          </button>
          <button
            onClick={() => setActiveTab('achievement')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === 'achievement' 
                ? 'bg-surface shadow-[4px_4px_8px_#AEAEC0,-4px_-4px_8px_#FFFFFF] text-primary' 
                : 'text-secondary hover:text-primary'
            }`}
          >
            Achievement Reports
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface p-3 rounded-2xl neumorphic-outset flex items-center gap-3 md:col-span-2">
            <Search size={18} className="text-secondary shrink-0" />
            <input 
              type="text"
              placeholder={
                activeTab === 'completion' 
                  ? "Search by employee or manager name..." 
                  : "Search by employee name or goal title..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-bold text-on-surface placeholder:text-secondary/60 text-xs"
            />
          </div>

          <div className="bg-surface p-3 rounded-2xl neumorphic-outset flex items-center gap-3">
            <Filter size={18} className="text-secondary shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-bold text-on-surface text-xs focus:ring-0"
            >
              <option value="All">All Departments</option>
              {departments.filter(d => d !== 'All').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Content */}
        {activeTab === 'completion' ? (
          /* COMPLETION DASHBOARD TAB */
          <div className="space-y-6">
            
            {/* Completion Summary Blocks */}
            {completionData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-6">
                <div className="bg-surface p-6 rounded-2xl neumorphic-outset flex items-center gap-4">
                  <div className="p-3 rounded-xl neumorphic-inset text-primary bg-primary/5">
                    <Users size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Monitored Headcount</span>
                    <span className="text-2xl font-black text-on-surface">{completionData.summary.total_employees} Employees</span>
                  </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl neumorphic-outset flex items-center gap-4">
                  <div className="p-3 rounded-xl neumorphic-inset text-success bg-success/5">
                    <CheckCircle size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Goal Lock Completion</span>
                    <span className="text-2xl font-black text-success">{completionData.summary.goal_setting_rate}% locked</span>
                  </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl neumorphic-outset flex items-center gap-4">
                  <div className="p-3 rounded-xl neumorphic-inset text-tertiary bg-tertiary/5">
                    <Compass size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Check-In Logged Rate</span>
                    <span className="text-2xl font-black text-tertiary">{completionData.summary.checkin_rate}% active</span>
                  </div>
                </div>
              </div>
            )}

            {/* Completion Table */}
            <div className="bg-surface rounded-2xl neumorphic-outset overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-dim/30 border-b border-surface-dim/50">
                      <th className="p-4 font-label-caps text-label-caps text-secondary">Employee</th>
                      <th className="p-4 font-label-caps text-label-caps text-secondary">Department</th>
                      <th className="p-4 font-label-caps text-label-caps text-secondary">Reporting Line</th>
                      <th className="p-4 font-label-caps text-label-caps text-secondary">Goal Sheet (Approved/Total)</th>
                      <th className="p-4 font-label-caps text-label-caps text-secondary">Q1 Check-in</th>
                      <th className="p-4 font-label-caps text-label-caps text-secondary">Q2 Check-in</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-dim/40 text-xs">
                    {filteredReports.map((report, idx) => (
                      <tr key={idx} className="hover:bg-surface-dim/10 transition-colors">
                        <td className="p-4 font-bold text-on-surface">
                          <div className="flex flex-col">
                            <span>{report.name}</span>
                            <span className="text-[10px] font-normal text-secondary">{report.email}</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold">{report.department}</td>
                        <td className="p-4 text-secondary">reports to {report.manager_name}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded font-black ${
                              report.locked_goals === report.total_goals && report.total_goals > 0
                                ? 'bg-success/15 text-success' 
                                : 'bg-error-container text-on-error-container'
                            }`}>
                              {report.locked_goals} / {report.total_goals} Locked
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 font-bold ${
                            report.checkin_status.Q1 === 'Completed' ? 'text-success' : 'text-secondary/70'
                          }`}>
                            {report.checkin_status.Q1 === 'Completed' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {report.checkin_status.Q1}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 font-bold ${
                            report.checkin_status.Q2 === 'Completed' ? 'text-success' : 'text-secondary/70'
                          }`}>
                            {report.checkin_status.Q2 === 'Completed' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {report.checkin_status.Q2}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredReports.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-12 text-center text-secondary italic">
                          No employee reports found matching parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ACHIEVEMENT REPORTS TAB */
          <div className="space-y-6">
            <div className="bg-surface rounded-2xl neumorphic-outset overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-dim/30 border-b border-surface-dim/50">
                      <th className="p-4 font-label-caps text-label-caps text-secondary">Employee</th>
                      <th className="p-4 font-label-caps text-label-caps text-secondary">Goal Details</th>
                      <th className="p-4 font-label-caps text-label-caps text-secondary">Weight</th>
                      <th className="p-4 font-label-caps text-label-caps text-secondary">Planned Target</th>
                      <th className="p-4 font-label-caps text-label-caps text-secondary">Q1 Actual</th>
                      <th className="p-4 font-label-caps text-label-caps text-secondary">Q2 Actual</th>
                      <th className="p-4 font-label-caps text-label-caps text-secondary">Overall Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-dim/40 text-xs">
                    {filteredReports.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-dim/10 transition-colors">
                        <td className="p-4 font-bold">
                          <div className="flex flex-col">
                            <span>{item.employee_name}</span>
                            <span className="text-[10px] font-normal text-secondary">{item.department}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col max-w-xs">
                            <span className="font-bold text-on-surface leading-tight">{item.title}</span>
                            <span className="text-[10px] text-secondary uppercase font-semibold tracking-wider mt-0.5">Thrust: {item.thrust_area}</span>
                          </div>
                        </td>
                        <td className="p-4 font-black">{item.weight}%</td>
                        <td className="p-4 font-bold text-primary">
                          {item.target} {item.uom}
                        </td>
                        <td className="p-4 text-on-surface font-semibold">{item.q1_actual || 0}</td>
                        <td className="p-4 text-on-surface font-semibold">{item.q2_actual || 0}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 bg-surface-dim h-2 rounded-full overflow-hidden shrink-0">
                              <div 
                                className="bg-primary h-full rounded-full transition-all duration-300"
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                            <span className="font-black text-primary leading-none min-w-[28px]">{item.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredReports.length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-12 text-center text-secondary italic">
                          No achievements or targets logged in system.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
