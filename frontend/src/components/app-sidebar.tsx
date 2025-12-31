import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, FolderOpen, ChevronDown, ChevronRight,
  Video, Image as ImageIcon, Film, Palette, Music2, Layers,
  LayoutGrid, Users, Box, Mic, Crown, Zap, Target, X, Clock,
  LogIn, ShieldAlert, Settings, Info
} from 'lucide-react';
import { userService, type Activity } from '@/services/user.service';

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
}

const navGroups: NavGroup[] = [
  {
    title: 'Create',
    defaultOpen: true,
    items: [
      { label: 'Home', path: '/app/dashboard', icon: <Home className="w-4 h-4" /> },
      { label: 'Campaign Wizard', path: '/app/campaign', icon: <Target className="w-4 h-4" /> },
      { label: 'History', path: '/app/history', icon: <FolderOpen className="w-4 h-4" /> },
      { label: 'My Assets', path: '/app/assets', icon: <FolderOpen className="w-4 h-4" /> },
    ],
  },
  {
    title: 'AI Playground',
    defaultOpen: true,
    items: [
      { label: 'Text → Image', path: '/app/create/text-to-image', icon: <ImageIcon className="w-4 h-4" /> },
      { label: 'Text → Video', path: '/app/create/text-to-video', icon: <Video className="w-4 h-4" /> },
      { label: 'Text → Audio', path: '/app/create/text-to-audio', icon: <Music2 className="w-4 h-4" /> },
      { label: 'Image → Video', path: '/app/create/image-to-video', icon: <Film className="w-4 h-4" /> },
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
    defaultOpen: true,
    items: [
      { label: 'Storyboard', path: '/app/studio/storyboard', icon: <LayoutGrid className="w-4 h-4" />, badge: 'Soon' },
      { label: 'Video Editor', path: '/app/studio/editor', icon: <Layers className="w-4 h-4" />, badge: 'Soon' },
      { label: 'Audio Suite', path: '/app/studio/audio', icon: <Music2 className="w-4 h-4" />, badge: 'Soon' },
    ],
  },
  {
    title: 'Advanced',
    defaultOpen: false,
    items: [
      { label: 'Brand Kits', path: '/app/brand-kits', icon: <Palette className="w-4 h-4" />, badge: 'Soon' },
      { label: 'AI Avatars', path: '/app/avatars', icon: <Users className="w-4 h-4" />, badge: 'Soon' },
      { label: 'AI Voices', path: '/app/voices', icon: <Mic className="w-4 h-4" />, badge: 'Soon' },
      { label: '3D Assets', path: '/app/3d', icon: <Box className="w-4 h-4" />, badge: 'Soon' },
    ],
  },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppSidebar = ({ isOpen, onClose }: AppSidebarProps) => {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    navGroups.reduce((acc, group) => ({ ...acc, [group.title]: group.defaultOpen ?? false }), {})
  );
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    const fetchRecent = async () => {
      setLoadingActivity(true);
      try {
        const data = await userService.getActivityLog(3);
        setRecentActivity(data.activities);
      } catch (err) {
        console.error('Failed to fetch sidebar activity:', err);
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchRecent();
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'generation': return <Zap className="w-3 h-3 text-[#00FF88]" />;
      case 'login': return <LogIn className="w-3 h-3 text-blue-400" />;
      case 'profile_update': return <Users className="w-3 h-3 text-purple-400" />;
      case 'settings_change': return <Settings className="w-3 h-3 text-orange-400" />;
      case 'security_alert': return <ShieldAlert className="w-3 h-3 text-red-400" />;
      default: return <Info className="w-3 h-3 text-gray-400" />;
    }
  };

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#0A0A0A] border-r border-white/10 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
        {navGroups.map((group) => (
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

        {/* Recent Activity Mini-Section */}
        <div className="pt-4 mt-2 border-t border-white/5">
          <div className="flex items-center justify-between px-2 mb-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Activity</span>
            <Link to="/app/activity" onClick={onClose} className="text-[10px] text-[#00FF88] hover:underline">View All</Link>
          </div>
          <div className="space-y-2 px-1">
            {loadingActivity ? (
              <div className="px-2 py-1 animate-pulse flex gap-2">
                <div className="w-3 h-3 bg-white/5 rounded-full" />
                <div className="h-3 w-20 bg-white/5 rounded" />
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((act) => (
                <div key={act._id} className="flex items-start gap-2.5 px-2 py-1 group cursor-default">
                  <div className="mt-0.5 flex-shrink-0">
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400 leading-tight line-clamp-2 group-hover:text-gray-200 transition-colors">
                      {act.action}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-2 py-1 text-[10px] text-gray-600 italic">No recent activity</p>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {/* Credits */}
        <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">100 Credits</span>
            </div>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-[#00FF88] to-[#00CC6A]" />
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
    </aside>
  );
};

export default AppSidebar;

