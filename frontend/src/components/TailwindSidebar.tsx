import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  HomeIcon, 
  CodeBracketIcon, 
  UserGroupIcon, 
  UserIcon, 
  Cog6ToothIcon, 
  Bars3Icon, 
  ChevronLeftIcon 
} from '@heroicons/react/24/outline';
import { TailwindThemeToggle } from './TailwindThemeToggle';

const navItems = [
  { label: 'Home', path: '/dashboard', icon: HomeIcon },
  { label: 'Problems', path: '/problems', icon: CodeBracketIcon },
  { label: 'Rooms', path: '/rooms', icon: UserGroupIcon },
  { label: 'Profile', path: '/profile', icon: UserIcon },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  onToggle?: (open: boolean) => void;
}

export const TailwindSidebar: React.FC<SidebarProps> = ({ 
  open = true, 
  onClose, 
  onToggle 
}) => {
  const location = useLocation();
  const user = { name: localStorage.getItem('username') || 'User', avatar: '' };

  // Use the open prop from parent instead of internal state
  const sidebarOpen = open;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle(!sidebarOpen);
    }
  };

  // If sidebar is collapsed, show a floating expand button
  if (!sidebarOpen) {
    return (
      <button
        className="fixed top-4 left-4 z-[100] p-2 bg-card border border-border rounded-lg shadow-lg hover:bg-primary/10 floating-expand-button sidebar-focus"
        onClick={handleToggle}
        title="Expand sidebar"
      >
        <Bars3Icon className="h-6 w-6 text-primary" />
      </button>
    );
  }

  return (
    <div className="w-[280px] h-screen bg-gradient-to-b from-background to-card backdrop-blur-2xl border-r border-card-foreground/10 flex flex-col fixed left-0 top-0 z-50 sidebar-transition">
      {/* Collapse button */}
      <button
        className="absolute top-4 right-4 z-20 p-2 bg-card border border-border rounded-lg hover:bg-primary/10 sidebar-button-hover sidebar-focus"
        onClick={handleToggle}
        title="Collapse sidebar"
      >
        <ChevronLeftIcon className="h-5 w-5 text-primary" />
      </button>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent pointer-events-none" />
      {/* Header */}
      <div className="relative z-10 p-6 border-b border-card-foreground/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <CodeBracketIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Structures</h1>
            <p className="text-sm text-muted-foreground">Code & Collaborate</p>
          </div>
        </div>
      </div>
      {/* Navigation */}
      <nav className="relative z-10 flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl sidebar-nav-item sidebar-focus group ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-card-foreground hover:bg-card hover:shadow-md'
                  }`}
                >
                  <IconComponent className={`h-5 w-5 transition-colors duration-200 ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-card-foreground'
                  }`} />
                  <span className="font-medium transition-colors duration-200">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* User Section */}
      <div className="relative z-10 p-4 border-t border-card-foreground/10">
        {/* User Profile */}
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-card/50 border border-card-foreground/10 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-muted to-muted-foreground/20 rounded-full flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-card-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center justify-between">
          <TailwindThemeToggle />
          <button
            onClick={handleLogout}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200"
            title="Logout"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        </div>
        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-card-foreground/10">
          <p className="text-xs text-muted-foreground text-center">
            Structures v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default TailwindSidebar;
