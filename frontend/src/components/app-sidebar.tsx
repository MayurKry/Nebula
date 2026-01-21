import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, FolderOpen, ChevronDown, ChevronRight,
  Video, Image as ImageIcon, Film, Palette, Music2, Layers,
  LayoutGrid, Users, Box, Mic, Crown, Zap, Target, X, Clock
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
];

const navGroups: NavGroup[] = [
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
  const { openMobile, setOpenMobile } = useSidebar();
  const isOpen = isOpenProp ?? openMobile;
  const onClose = onCloseProp ?? (() => setOpenMobile(false));

  const location = useLocation();
  const { user } = useAuth();
  const isAdminPath = location.pathname.startsWith('/admin');

  // If we are on an admin path, show ONLY admin groups.
  // If we are on an app path, show ONLY user groups (even for admins).
  const currentNavGroups = isAdminPath ? adminGroups : navGroups;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    currentNavGroups.reduce((acc, group) => ({ ...acc, [group.title]: group.defaultOpen ?? false }), {})
  );

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={`fixed lg:static top-0 left-0 h-[100dvh] lg:h-auto w-64 bg-[#0A0A0A] border-r border-white/10 flex flex-col z-[100] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo & Close Button */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <Link to="/app/dashboard" className="flex items-center gap-2" title="Nebula">
          <img src="/nebula-logo.png" alt="Nebula" className="h-8 object-contain" />
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation - Enable scrolling on mobile */}
      <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2">
        {currentNavGroups.map((group) => (
          <div key={group.title}>
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
            >
              {group.title}
              {openGroups[group.title] ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>

            {openGroups[group.title] && (
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.badge ? '#' : item.path}
                    onClick={(e) => {
                      if (item.badge) e.preventDefault();
                      else onClose();
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive(item.path)
                      ? 'bg-[#00FF88]/10 text-[#00FF88] font-medium'
                      : item.badge
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded font-medium">
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

          {/* Upgrade Banner */}
          <Link
            to="/pricing"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] rounded-lg hover:opacity-90 transition-opacity"
          >
            <Crown className="w-4 h-4 text-[#0A0A0A]" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0A0A0A]">Upgrade to Pro</p>
              <p className="text-[10px] text-[#0A0A0A]/70">Unlimited generations</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;

