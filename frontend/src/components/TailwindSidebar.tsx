import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  HomeIcon, 
  CodeBracketIcon, 
  UserGroupIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  ChartBarIcon,
  FireIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { ThemeSelector } from './ThemeSelector';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Home', path: '/dashboard', icon: HomeIcon },
  { label: 'Problems', path: '/problems', icon: CodeBracketIcon },
  { label: 'Rooms', path: '/rooms', icon: UserGroupIcon },
  { label: 'Challenges', path: '/challenges', icon: FireIcon },
  { label: 'Community', path: '/community', icon: ChatBubbleLeftRightIcon },
  { label: 'Stats & Rankings', path: '/stats', icon: ChartBarIcon },
  { label: 'Snippets', path: '/snippets', icon: DocumentDuplicateIcon },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  onToggle?: (open: boolean) => void;
  isMobile?: boolean;
}

export const TailwindSidebar: React.FC<SidebarProps> = ({ 
  open = true, 
  onClose, 
  onToggle,
  isMobile = false
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
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[49]"
          onClick={() => onToggle && onToggle(false)}
        />
      )}
      
      <div 
        className={`fixed top-0 left-0 h-full z-50 bg-card border-r border-border flex flex-col ${
          sidebarOpen ? 'w-72' : 'w-20'
        } ${
          isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease-in-out',
          willChange: 'width, transform'
        }}
      >
        {/* Header */}
        <div className="flex items-center h-[88px] px-4 border-b border-border/20">
          <div className={`flex items-center gap-3 overflow-hidden w-full`}>
            {sidebarOpen ? (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <CodeBracketIcon className="h-[21.6px] w-[21.6px] text-white" />
                </div>
                <div className={`transition-opacity whitespace-nowrap flex-1 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    transitionDuration: '0.3s',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: sidebarOpen ? '0.1s' : '0s'
                  }}>
                  <h1 className="text-xl font-bold text-foreground whitespace-nowrap">Structures</h1>
                  <p className="text-sm text-muted-foreground whitespace-nowrap">Code & Collaborate</p>
                </div>
                {/* Collapse button - only visible when sidebar is open */}
                <button
                  onClick={handleToggle}
                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300 flex-shrink-0"
                  title="Collapse sidebar"
                >
                  <ChevronLeftIcon className="h-[14.4px] w-[14.4px]" />
                </button>
              </>
            ) : (
              <button
                onClick={handleToggle}
                className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group relative overflow-hidden"
                title="Expand sidebar"
              >
                <CodeBracketIcon className="h-[21.6px] w-[21.6px] text-white absolute transition-all duration-300 ease-in-out transform group-hover:-translate-x-10 group-hover:opacity-0" />
                <ChevronRightIcon className="h-[21.6px] w-[21.6px] text-white absolute transition-all duration-300 ease-in-out transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
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
                  className={`flex items-center h-[52px] rounded-xl group overflow-hidden ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-card-foreground hover:bg-muted/50 hover:shadow-md'
                  }`}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <div className="flex items-center justify-center w-[56px] h-[52px] flex-shrink-0">
                    <IconComponent className={`h-[21.6px] w-[21.6px] ${
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-card-foreground'
                    }`} 
                    style={{
                      transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                  </div>
                  <span className={`font-medium whitespace-nowrap ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                      transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transitionDelay: sidebarOpen ? '0.1s' : '0s'
                    }}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </nav>

        {/* User Section - Always at bottom */}
        <div className="mt-auto p-4 border-t border-border/20">
          {/* User Profile */}
          <Link 
            to="/profile"
            className={`flex items-center overflow-hidden mb-4 rounded-lg p-2 transition-all duration-300 hover:bg-muted/50 cursor-pointer group`}
          >
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex-shrink-0 text-white font-bold text-sm transition-transform duration-300 group-hover:scale-110" title={user.name}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={`pl-3 flex-1 min-w-0 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
              style={{
                transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: sidebarOpen ? '0.1s' : '0s'
              }}>
              <p className="text-sm font-medium text-card-foreground truncate whitespace-nowrap group-hover:text-primary transition-colors duration-300">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">Online</p>
            </div>
          </Link>
          
          {/* Controls */}
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <ThemeSelector />
              <button
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                style={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                style={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TailwindSidebar;
