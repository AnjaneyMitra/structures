import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  HomeIcon, 
  CodeBracketIcon, 
  UserGroupIcon, 
  UserIcon, 
  UsersIcon,
  Cog6ToothIcon, 
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { TailwindThemeToggle } from './TailwindThemeToggle';

const navItems = [
  { label: 'Home', path: '/dashboard', icon: HomeIcon },
  { label: 'Problems', path: '/problems', icon: CodeBracketIcon },
  { label: 'Rooms', path: '/rooms', icon: UserGroupIcon },
  { label: 'Friends', path: '/friends', icon: UsersIcon },
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

  return (
    <>
      <div className={`${
        sidebarOpen ? 'w-[280px]' : 'w-[72px]'
      } h-screen bg-gradient-to-b from-background to-card backdrop-blur-2xl border-r border-card-foreground/10 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out`}>
        
        {/* Header */}
        <div className="relative z-10 flex items-center h-[88px] px-4 border-b border-card-foreground/10">
          <div className={`flex items-center gap-3 overflow-hidden`}>
            {sidebarOpen ? (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <CodeBracketIcon className="h-6 w-6 text-white" />
                </div>
                <div className={`transition-opacity duration-200 opacity-100`}>
                  <h1 className="text-xl font-bold text-foreground whitespace-nowrap">Structures</h1>
                  <p className="text-sm text-muted-foreground whitespace-nowrap">Code & Collaborate</p>
                </div>
              </>
            ) : (
              <button
                onClick={handleToggle}
                className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group relative overflow-hidden"
                title="Expand sidebar"
              >
                <CodeBracketIcon className="h-6 w-6 text-white absolute transition-all duration-300 ease-in-out transform group-hover:-translate-x-10 group-hover:opacity-0" />
                <ChevronRightIcon className="h-6 w-6 text-white absolute transition-all duration-300 ease-in-out transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            return (
              <li key={item.path} className="list-none">
                <Link
                  to={item.path}
                  className={`flex items-center h-[52px] rounded-xl group transition-all duration-200 overflow-hidden ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-card-foreground hover:bg-card hover:shadow-md'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <div className="flex items-center justify-center w-[56px] h-[52px] flex-shrink-0">
                    <IconComponent className={`h-6 w-6 transition-all duration-200 ${
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-card-foreground'
                    }`} />
                  </div>
                  <span className={`font-medium transition-opacity duration-200 whitespace-nowrap ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-card-foreground/10">
          <div className={`flex items-center overflow-hidden`}>
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-muted to-muted-foreground/20 rounded-full flex-shrink-0" title={user.name}>
              <UserIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className={`pl-3 flex-1 min-w-0 transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-sm font-medium text-card-foreground truncate whitespace-nowrap">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">Online</p>
            </div>
          </div>
          
          <div className={`flex items-center justify-between mt-4 transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            <TailwindThemeToggle />
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200"
              title="Logout"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Toggle Button */}
      {sidebarOpen && (
        <button
          className="absolute top-7 left-[280px] -translate-x-1/2 z-[60] p-1.5 bg-card border border-border rounded-full hover:bg-primary/10 transition-all duration-300 ease-in-out"
          onClick={handleToggle}
          title="Collapse sidebar"
        >
          <ChevronLeftIcon className={`h-4 w-4 text-primary transition-transform duration-300`} />
        </button>
      )}
    </>
  );
};

export default TailwindSidebar;
