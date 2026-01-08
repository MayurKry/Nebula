export const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
    { code: 'th', name: 'Thai', flag: '🇹🇭' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
];

export const COUNTRIES = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'Spain', 'Italy', 'Japan', 'China', 'India', 'Brazil',
    'Mexico', 'South Korea', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
    'Finland', 'Switzerland', 'Austria', 'Belgium', 'Poland', 'Turkey',
    'Saudi Arabia', 'UAE', 'Singapore', 'Malaysia', 'Thailand', 'Vietnam',
    'Indonesia', 'Philippines', 'New Zealand', 'Ireland', 'Portugal',
    'Greece', 'Czech Republic', 'Hungary', 'Romania', 'South Africa',
];

export const OBJECTIVES = [
    'Brand Awareness',
    'Product Promotion',
    'Lead Generation',
    'App Installs',
] as const;

export const PLATFORMS = [
    'Instagram',
    'Facebook',
    'YouTube',
    'TikTok',
    'LinkedIn',
    'Twitter',
];

export const AUDIENCE_TYPES = ['B2C', 'B2B'] as const;

export const BRAND_TONES = [
    'Professional',
    'Playful',
    'Bold',
    'Minimalist',
    'Luxury',
    'Friendly',
    'Urgent',
];

export const CTA_OPTIONS = [
    'Shop Now',
    'Learn More',
    'Sign Up',
    'Get Started',
    'Download',
    'Contact Us',
    'Book Now',
];

export const CONTENT_TYPES = ['video', 'image', 'both'] as const;

export const VIDEO_DURATIONS = [6, 15, 30] as const;

export const VISUAL_STYLES = [
    'Photorealistic',
    'Cinematic',
    'Minimalist',
    'Bold',
    'Artistic',
    'Corporate',
];

export const CREDIT_COSTS = {
    script_generation: 2,
    script_regeneration: 2,
    image_per_platform: 1,
    video_per_platform: 5,
    export_individual: 1,
    export_all: 1,
};
