export const SYSTEM_PLANS = {
    FREE: {
        id: 'FREE',
        name: 'Free',
        monthlyCredits: 100,
        features: ['txt2img'],
        maxUsers: 1,
        price: 0
    },
    PRO: {
        id: 'PRO',
        name: 'Pro',
        monthlyCredits: 1000,
        features: ['all'],
        maxUsers: 1,
        price: 29
    },
    TEAM: {
        id: 'TEAM',
        name: 'Team',
        monthlyCredits: 5000,
        features: ['all'],
        maxUsers: 10,
        price: 99
    }
} as const;

export type PlanType = keyof typeof SYSTEM_PLANS | 'CUSTOM';

export const SYSTEM_FEATURES = [
    'txt2img',
    'txt2video',
    'txt2audio',
    'frame2video',
    'campaign_wizard'
] as const;
