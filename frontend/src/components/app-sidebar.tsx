import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, FolderOpen, ChevronDown, ChevronRight,
  Video, Image as ImageIcon, Film, Palette, Music2, Layers,
  LayoutGrid, Users, Box, Mic, Crown, Zap, Target, X, Clock,
  Activity, FileText, AlertTriangle, Flag, LifeBuoy, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
  role?: string;
}

const adminGroups: NavGroup[] = [
  {
    title: 'Platform',
    defaultOpen: true,
    role: 'super_admin',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutGrid className="w-4 h-4" /> },
      { label: 'Tenants', path: '/admin/tenants', icon: <Users className="w-4 h-4" /> },
      { label: 'Features', path: '/admin/features', icon: <Zap className="w-4 h-4" /> },
      { label: 'Financials', path: '/admin/financials', icon: <Target className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Observability',
    defaultOpen: true,
    role: 'super_admin',
    items: [
      { label: 'Analytics', path: '/admin/observability/analytics', icon: <Activity className="w-4 h-4" /> },
      { label: 'Generation Logs', path: '/admin/observability/logs', icon: <FileText className="w-4 h-4" /> },
      { label: 'Error Monitor', path: '/admin/observability/errors', icon: <AlertTriangle className="w-4 h-4" /> },
      { label: 'Campaigns', path: '/admin/observability/campaigns', icon: <Flag className="w-4 h-4" /> },
      { label: 'Support Tools', path: '/admin/observability/support', icon: <LifeBuoy className="w-4 h-4" /> },
    ],
  },
];

const navGroups: NavGroup[] = [
  {
    title: 'Platform',
    defaultOpen: true,
    role: 'super_admin',
    items: [
      { label: 'Admin Panel', path: '/admin/dashboard', icon: <Crown className="w-4 h-4 text-yellow-400" /> },
    ],
  },
  {
    title: 'Create',
    defaultOpen: true,
    items: [
      { label: 'Home', path: '/app/dashboard', icon: <Home className="w-4 h-4" /> },
      { label: 'Campaign Wizard', path: '/app/campaign', icon: <Target className="w-4 h-4" /> },
      { label: 'Library', path: '/app/library', icon: <Layers className="w-4 h-4" /> },
      { label: 'History', path: '/app/history', icon: <FolderOpen className="w-4 h-4" /> },
      { label: 'My Assets', path: '/app/assets', icon: <FolderOpen className="w-4 h-4" /> },
    ],
  },
  {
    title: 'AI Playground',
    defaultOpen: false, // Closed by default on mobile
    items: [
      { label: 'Text → Image', path: '/app/create/text-to-image', icon: <ImageIcon className="w-4 h-4" /> },
      { label: 'Text → Video', path: '/app/create/text-to-video', icon: <Video className="w-4 h-4" /> },
      { label: 'Text → Audio', path: '/app/create/text-to-audio', icon: <Music2 className="w-4 h-4" /> },
      { label: 'Frame → Video', path: '/app/create/frame-to-video', icon: <Film className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Account',
    defaultOpen: false,
    items: [
      { label: 'Activity Log', path: '/app/activity', icon: <Clock className="w-4 h-4" /> },
      { label: 'Member Settings', path: '/app/settings', icon: <Users className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Studio',
    defaultOpen: false, // Closed by default on mobile
    items: [
      { label: 'Storyboard', path: '/app/studio/storyboard', icon: <LayoutGrid className="w-4 h-4" />, badge: 'Soon' },
      { label: 'Video Editor', path: '/app/studio/editor', icon: <Layers className="w-4 h-4" /> },
      { label: 'Audio Suite', path: '/app/studio/audio', icon: <Music2 className="w-4 h-4" />, badge: 'Soon' },
    ],
  },
  {
    title: 'Advanced',
    defaultOpen: false,
    items: [
      { label: 'Brand Kits', path: '/app/brand-kits', icon: <Palette className="w-4 h-4" />, badge: 'Soon' },
      { label: 'AI Avatars', path: '/app/avatars', icon: <Users className="w-4 h-4" />, badge: 'Soon' },
      { label: 'AI Voices', path: '/app/create/ai-voices', icon: <Mic className="w-4 h-4" /> },
      { label: '3D Assets', path: '/app/3d', icon: <Box className="w-4 h-4" />, badge: 'Soon' },
    ],
  },
];

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const AppSidebar = ({ isOpen: isOpenProp, onClose: onCloseProp }: AppSidebarProps) => {
  const { openMobile, setOpenMobile, open: isDesktopOpen, toggleSidebar, isMobile } = useSidebar();
  const isOpen = isOpenProp ?? openMobile;
  const isCollapsed = !isDesktopOpen;
  const onClose = onCloseProp ?? (() => setOpenMobile(false));

  const location = useLocation();
  const { user } = useAuth();
  const isAdminPath = location.pathname.startsWith('/admin');

  // If we are on an admin path, show ONLY admin groups.
  // If we are on an app path, show ONLY user groups (even for admins), PLUS the link to admin if applicable.
  let currentNavGroups = isAdminPath ? adminGroups : navGroups;

  // Filter groups by role if specified
  currentNavGroups = currentNavGroups.filter(group => !group.role || group.role === user?.role);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    currentNavGroups.reduce((acc, group) => ({ ...acc, [group.title]: group.defaultOpen ?? false }), {})
  );

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={`fixed lg:static top-0 left-0 h-[100dvh] lg:h-auto ${isCollapsed ? 'w-20' : 'w-64'} bg-[#0A0A0A] border-r border-white/10 flex flex-col z-[100] transition-all duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo & Toggle Button */}
      <div className={`p-4 border-b border-white/10 flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'} min-h-[65px] transition-all`}>
        {(!isCollapsed || isOpen) && (
          <Link to="/app/dashboard" className="flex items-center gap-2 overflow-hidden animate-in fade-in slide-in-from-left-2" title="Nebula">
            <img src="/nebula-logo.png" alt="Nebula" className="h-8 object-contain" />
          </Link>
        )}

        <button
          onClick={isMobile ? onClose : toggleSidebar}
          className={`p-2 text-gray-400 hover:text-[#00FF88] transition-all duration-300 bg-white/5 hover:bg-[#00FF88]/10 rounded-xl group/toggle ${isCollapsed && !isMobile ? 'mx-auto' : ''}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isMobile ? (
            <X className="w-5 h-5" />
          ) : isCollapsed ? (
            <PanelLeft className="w-5 h-5 animate-in zoom-in-75 duration-300" />
          ) : (
            <PanelLeftClose className="w-5 h-5 animate-in zoom-in-75 duration-300" />
          )}
        </button>
      </div>

      {/* Navigation - Enable scrolling on mobile */}
      <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2">
        {currentNavGroups.map((group) => (
          <div key={group.title}>
            {!isCollapsed ? (
              <button
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between px-2 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] hover:text-[#00FF88] transition-colors mt-2"
              >
                {group.title}
                {openGroups[group.title] ? (
                  <ChevronDown className="w-3 h-3 opacity-50" />
                ) : (
                  <ChevronRight className="w-3 h-3 opacity-50" />
                )}
              </button>
            ) : (
              <div className="flex justify-center my-4">
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            )}

            {(openGroups[group.title] || isCollapsed) && (
              <div className="mt-1 space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.badge ? '#' : item.path}
                    title={isCollapsed ? item.label : undefined}
                    onClick={(e) => {
                      if (item.badge) e.preventDefault();
                      else onClose();
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative group/item ${isActive(item.path)
                      ? 'bg-[#00FF88]/10 text-[#00FF88] font-semibold'
                      : item.badge
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <div className={`shrink-0 transition-transform duration-300 ${isCollapsed ? 'group-hover/item:scale-110' : ''}`}>
                      {item.icon}
                    </div>

                    {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}

                    {isActive(item.path) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#00FF88] rounded-r-full shadow-[0_0_12px_#00FF88]" />
                    )}

                    {!isCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded font-bold uppercase tracking-tighter">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Section - Hide strictly for admin view */}
      {!isAdminPath && (
        <div className="p-3 border-t border-white/10 space-y-2">
          {/* Credits */}
          {!isCollapsed ? (
            <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">{user?.credits || 0} Credits</span>
                </div>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00FF88] to-[#00CC6A] transition-all duration-1000"
                  style={{ width: `${Math.min(((user?.credits || 0) / 1000) * 100, 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center text-yellow-400 py-2" title={`${user?.credits || 0} Credits`}>
              <Zap className="w-5 h-5" />
            </div>
          )}

          {/* Upgrade Banner */}
          <Link
            to="/pricing"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] rounded-lg hover:opacity-90 transition-opacity justify-center ${!isCollapsed ? 'lg:justify-start' : ''}`}
            title={isCollapsed ? 'Upgrade to Pro' : undefined}
          >
            <Crown className="w-4 h-4 text-[#0A0A0A] shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-[#0A0A0A] truncate">Upgrade to Pro</p>
                <p className="text-[10px] text-[#0A0A0A]/70 truncate">Unlimited generations</p>
              </div>
            )}
          </Link>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;

