import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  HomeIcon, 
  CodeBracketIcon, 
  UserGroupIcon, 
  UserIcon, 
  UsersIcon,
  TrophyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { ThemeSelector } from './ThemeSelector';
import { FontSizeSelector } from './FontSizeSelector';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Home', path: '/dashboard', icon: HomeIcon },
  { label: 'Problems', path: '/problems', icon: CodeBracketIcon },
  { label: 'Rooms', path: '/rooms', icon: UserGroupIcon },
  { label: 'Levels', path: '/levels', icon: StarIcon },
  { label: 'Achievements', path: '/achievements', icon: TrophyIcon },
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
  const { username, logout } = useAuth();
  const user = { name: username || 'User', avatar: '' };

  // Use the open prop from parent instead of internal state
  const sidebarOpen = open;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
  const handleToggle = () => {
    if (onToggle) {
      onToggle(!sidebarOpen);
    }
  };

  return (
    <>
          <div 
      className={`fixed top-0 left-0 h-full transition-all duration-300 ease-in-out z-50 bg-card/95 backdrop-blur-sm border-r border-border/30 ${
        sidebarOpen ? 'w-72' : 'w-20'
      }`}
    >
        
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
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex-shrink-0 text-white font-bold text-sm" title={user.name}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={`pl-3 flex-1 min-w-0 transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-sm font-medium text-card-foreground truncate whitespace-nowrap">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">Online</p>
            </div>
          </div>
          
          {/* Expanded state - show theme controls and logout */}
          <div className={`mt-4 transition-all duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between mb-2">
              <ThemeSelector />
              <FontSizeSelector />
              <button
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Collapsed state - show theme controls and logout */}
          {!sidebarOpen && (
            <div className="flex flex-col items-center space-y-3 mt-4">
              <div className="scale-75">
                <ThemeSelector />
              </div>
              <div className="scale-75">
                <FontSizeSelector />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed Toggle Button - positioned absolutely to prevent scrolling */}
      {sidebarOpen && (
        <button
          className="fixed top-7 z-[60] p-1.5 bg-card border border-border rounded-full hover:bg-primary/10 transition-all duration-300 ease-in-out shadow-lg"
          style={{ left: `${280 - 12}px` }} // 280px sidebar width minus half button width
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
