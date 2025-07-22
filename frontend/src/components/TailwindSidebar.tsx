import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  HomeIcon, 
  CodeBracketIcon, 
  UserGroupIcon, 
  UserIcon, 
  Cog6ToothIcon, 
  ChevronLeftIcon,
  ChevronRightIcon
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

  return (
    <div className={`${
      sidebarOpen ? 'w-[280px]' : 'w-[72px]'
    } h-screen bg-gradient-to-b from-background to-card backdrop-blur-2xl border-r border-card-foreground/10 flex flex-col fixed left-0 top-0 z-50 sidebar-transition transition-all duration-300 ease-in-out`}>
      
      {/* Toggle button */}
      <button
        className={`absolute ${sidebarOpen ? 'top-4 right-4' : 'top-4 right-2'} z-20 p-2 bg-card border border-border rounded-lg hover:bg-primary/10 sidebar-button-hover sidebar-focus transition-all duration-200`}
        onClick={handleToggle}
        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {sidebarOpen ? (
          <ChevronLeftIcon className="h-5 w-5 text-primary" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 text-primary" />
        )}
      </button>

      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className={`relative z-10 ${sidebarOpen ? 'p-6' : 'p-4'} border-b border-card-foreground/10 transition-all duration-300`}>
        <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
          {sidebarOpen ? (
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center transition-all duration-300">
              <CodeBracketIcon className="h-6 w-6 text-white transition-all duration-300" />
            </div>
          ) : (
            <button
              onClick={handleToggle}
              className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group relative overflow-hidden"
              title="Expand sidebar"
            >
              {/* Default icon - slides out on hover */}
              <CodeBracketIcon className="h-5 w-5 text-white transition-all duration-300 transform group-hover:-translate-x-8 group-hover:opacity-0" />
              
              {/* Hover icon - slides in on hover */}
              <ChevronRightIcon className="h-5 w-5 text-white absolute transition-all duration-300 transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
            </button>
          )}
          {sidebarOpen && (
            <div className="transition-opacity duration-300 opacity-100">
              <h1 className="text-xl font-bold text-foreground">Structures</h1>
              <p className="text-sm text-muted-foreground">Code & Collaborate</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`relative z-10 flex-1 ${sidebarOpen ? 'p-4' : 'p-2'} transition-all duration-300`}>
        <ul className={`${sidebarOpen ? 'space-y-2' : 'space-y-3'}`}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center ${
                    sidebarOpen ? 'space-x-3 px-4 py-3' : 'justify-center px-3 py-3'
                  } rounded-xl sidebar-nav-item sidebar-focus group transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-card-foreground hover:bg-card hover:shadow-md'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <IconComponent className={`${sidebarOpen ? 'h-5 w-5' : 'h-6 w-6'} transition-all duration-200 ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-card-foreground'
                  }`} />
                  {sidebarOpen && (
                    <span className="font-medium transition-colors duration-200">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className={`relative z-10 ${sidebarOpen ? 'p-4' : 'p-2'} border-t border-card-foreground/10 transition-all duration-300`}>
        {/* User Profile */}
        {sidebarOpen ? (
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
        ) : (
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-muted to-muted-foreground/20 rounded-full flex items-center justify-center" title={user.name}>
              <UserIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'flex-col space-y-2'}`}>
          <div className={sidebarOpen ? '' : 'order-2'}>
            <TailwindThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className={`p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200 ${
              !sidebarOpen ? 'order-1' : ''
            }`}
            title="Logout"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Footer */}
        {sidebarOpen && (
          <div className="mt-4 pt-4 border-t border-card-foreground/10">
            <p className="text-xs text-muted-foreground text-center">
              Structures v1.0
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TailwindSidebar;
