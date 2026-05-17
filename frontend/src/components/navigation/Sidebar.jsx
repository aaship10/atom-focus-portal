import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  ClipboardCheck, 
  Users, 
  CheckCircle2, 
  MessageSquare, 
  Share2, 
  BarChart3, 
  RotateCw, 
  Settings, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Zap
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, children, active, isCollapsed }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
      ? 'bg-surface shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] text-primary font-bold' 
      : 'text-secondary hover:text-primary hover:shadow-[4px_4px_8px_#AEAEC0,-4px_-4px_8px_#FFFFFF]'
    }`}
  >
    <div className={`${active ? 'text-primary' : 'text-secondary group-hover:text-primary'} transition-colors`}>
      <Icon size={22} />
    </div>
    {!isCollapsed && <span className="text-sm whitespace-nowrap overflow-hidden transition-all">{children}</span>}
    {isCollapsed && (
      <div className="absolute left-16 bg-primary text-on-primary px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
        {children}
      </div>
    )}
  </Link>
);

const UserSection = ({ role, name, isCollapsed }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="mt-auto pt-6 border-t border-surface-dim flex flex-col gap-4">
      <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
        <div className="w-10 h-10 rounded-full bg-surface shadow-[4px_4px_8px_#AEAEC0,-4px_-4px_8px_#FFFFFF] flex items-center justify-center text-primary shrink-0">
          <UserIcon size={20} />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black text-on-surface uppercase tracking-wider truncate">{name || 'User Name'}</span>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit uppercase">{role}</span>
          </div>
        )}
      </div>
      <button 
        onClick={handleLogout}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error-container/10 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
        title={isCollapsed ? "Logout" : ""}
      >
        <LogOut size={22} />
        {!isCollapsed && <span className="text-sm font-bold">Logout</span>}
      </button>
    </div>
  );
};

const SidebarContainer = ({ role, name, links, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-surface shadow-[6px_0_12px_#AEAEC0] border-r border-surface-dim transition-all duration-300 z-50 flex flex-col p-4 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand */}
      <div className={`mb-10 flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg shrink-0">
          <Zap size={24} />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tighter text-primary uppercase italic">Focus</span>
            <span className="text-[10px] font-bold text-secondary tracking-widest uppercase">Portal</span>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-3 flex-grow overflow-y-auto no-scrollbar">
        {links.map((link) => (
          <SidebarLink 
            key={link.to} 
            to={link.to} 
            icon={link.icon} 
            active={location.pathname === link.to}
            isCollapsed={isCollapsed}
          >
            {link.label}
          </SidebarLink>
        ))}
      </nav>

      {/* Collapse Toggle (Desktop) */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 rounded-full bg-surface shadow-md border border-surface-dim items-center justify-center text-primary hover:scale-110 transition-transform"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* User Section */}
      <UserSection role={role} name={name} isCollapsed={isCollapsed} />
    </aside>
  );
};

export const EmployeeSidebar = ({ name, isCollapsed, setIsCollapsed }) => {
  const links = [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/goals/my-goals', label: 'My Goals', icon: Target },
    { to: '/employee/check-ins', label: 'Quarterly Check-Ins', icon: ClipboardCheck },
  ];
  return <SidebarContainer role="Employee" name={name} links={links} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />;
};

export const ManagerSidebar = ({ name, isCollapsed, setIsCollapsed }) => {
  const links = [
    { to: '/manager/dashboard', label: 'Team Dashboard', icon: Users },
    { to: '/manager/approvals', label: 'Goal Approvals', icon: CheckCircle2 },
    { to: '/manager/check-ins', label: 'Team Check-Ins', icon: MessageSquare },
    { to: '/manager/shared', label: 'Shared Goals', icon: Share2 },
  ];
  return <SidebarContainer role="Manager" name={name} links={links} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />;
};

export const AdminSidebar = ({ name, isCollapsed, setIsCollapsed }) => {
  const links = [
    { to: '/admin/dashboard', label: 'Org Dashboard', icon: BarChart3 },
    { to: '/admin/cycles', label: 'Cycle Management', icon: RotateCw },
    { to: '/admin/config', label: 'System Config', icon: Settings },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
    { to: '/admin/audit', label: 'Audit & Governance', icon: ShieldCheck },
    { to: '/admin/escalations', label: 'Escalations', icon: AlertCircle },
  ];
  return <SidebarContainer role="Admin" name={name} links={links} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />;
};

export const LeftSidebar = ({ role, name, isCollapsed, setIsCollapsed }) => {
  if (role === 'Admin') return <AdminSidebar name={name} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />;
  if (role === 'Manager') return <ManagerSidebar name={name} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />;
  return <EmployeeSidebar name={name} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />;
};
