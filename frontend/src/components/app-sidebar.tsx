import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Sparkles, FolderOpen, Settings, ChevronDown, ChevronRight,
  Video, Image as ImageIcon, Film, Palette, Music2, Layers,
  LayoutGrid, Users, Box, Mic, Crown, HelpCircle, Zap, Target
} from 'lucide-react';

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
      { label: 'My Assets', path: '/app/assets', icon: <FolderOpen className="w-4 h-4" /> },
    ],
  },
  {
    title: 'AI Playground',
    defaultOpen: true,
    items: [
      { label: 'Text → Image', path: '/app/create/text-to-image', icon: <ImageIcon className="w-4 h-4" /> },
      { label: 'Text → Video', path: '/app/create/text-to-video', icon: <Video className="w-4 h-4" /> },
      { label: 'Image → Video', path: '/app/create/image-to-video', icon: <Film className="w-4 h-4" /> },
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

const AppSidebar = () => {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    navGroups.reduce((acc, group) => ({ ...acc, [group.title]: group.defaultOpen ?? false }), {})
  );

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#0A0A0A] border-r border-white/10 flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <Link to="/app/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FF88] to-[#00CC6A] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <span className="text-lg font-bold text-white">Nebula</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2">
        {navGroups.map((group) => (
          <div key={group.title}>
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-400 transition-colors"
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
                    onClick={(e) => item.badge && e.preventDefault()}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive(item.path)
                      ? 'bg-[#00FF88]/10 text-[#00FF88] font-medium'
                      : item.badge
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
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
          className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] rounded-lg hover:opacity-90 transition-opacity"
        >
          <Crown className="w-4 h-4 text-[#0A0A0A]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#0A0A0A]">Upgrade to Pro</p>
            <p className="text-[10px] text-[#0A0A0A]/70">Unlimited generations</p>
          </div>
        </Link>

        {/* Settings & Help */}
        <div className="flex gap-2">
          <Link
            to="/app/settings"
            className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-xs">Settings</span>
          </Link>
          <Link
            to="/help"
            className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-xs">Help</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
