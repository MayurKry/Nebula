import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';

type Theme = 'default' | 'lagoon' | 'carina';

const ThemeSwitcher = () => {
    const [theme, setTheme] = useState<Theme>('default');

    useEffect(() => {
        // Remove all theme classes first
        document.body.classList.remove('theme-lagoon', 'theme-carina');

        // Add the selected theme class if it's not default
        if (theme !== 'default') {
            document.body.classList.add(`theme-${theme}`);
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('theme-lagoon', 'theme-carina');
        };
    }, [theme]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-2xl transition-all hover:bg-black/70 group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white/50 group-hover:bg-transparent group-hover:text-[var(--marketing-accent)] transition-all">
                <Palette className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-1 pr-1 max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out">
                <button
                    onClick={() => setTheme('default')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${theme === 'default'
                        ? 'bg-[var(--marketing-accent)] text-black'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                >
                    Default
                </button>
                <button
                    onClick={() => setTheme('lagoon')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${theme === 'lagoon'
                        ? 'bg-[#B5FFF6] text-[#010B19]'
                        : 'text-white/70 hover:text-[#B5FFF6] hover:bg-white/10'
                        }`}
                >
                    Lagoon
                </button>
                <button
                    onClick={() => setTheme('carina')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${theme === 'carina'
                        ? 'bg-[#F2A766] text-[#120806]'
                        : 'text-white/70 hover:text-[#F2A766] hover:bg-white/10'
                        }`}
                >
                    Carina
                </button>
            </div>
        </div>
    );
};

export default ThemeSwitcher;
