// System Plan Definitions
export const SYSTEM_PLANS = {
    FREE: {
        id: 'FREE' as const,
        name: 'Free',
        monthlyCredits: 100,
        features: ['TEXT_TO_IMAGE'],
        maxUsers: 1,
        description: 'Basic plan for individuals getting started'
    },
    PRO: {
        id: 'PRO' as const,
        name: 'Pro',
        monthlyCredits: 1000,
        features: ['TEXT_TO_IMAGE', 'TEXT_TO_VIDEO', 'TEXT_TO_AUDIO', 'FRAME_TO_VIDEO'],
        maxUsers: 1,
        description: 'Professional plan with all creative features'
    },
    TEAM: {
        id: 'TEAM' as const,
        name: 'Team',
        monthlyCredits: 5000,
        features: ['TEXT_TO_IMAGE', 'TEXT_TO_VIDEO', 'TEXT_TO_AUDIO', 'FRAME_TO_VIDEO', 'CAMPAIGN_WIZARD'],
        maxUsers: 10,
        description: 'Team collaboration with campaign tools'
    }
} as const;

export type PlanId = keyof typeof SYSTEM_PLANS;

// Helper to get plan details
export const getPlanById = (planId: PlanId | 'CUSTOM') => {
    if (planId === 'CUSTOM') {
        return {
            id: 'CUSTOM' as const,
            name: 'Custom',
            monthlyCredits: 0,
            features: [],
            maxUsers: 0,
            description: 'Custom negotiated plan'
        };
    }
    return SYSTEM_PLANS[planId];
};

// Helper to check if plan includes feature
export const planIncludesFeature = (planId: PlanId, feature: string): boolean => {
    const plan = SYSTEM_PLANS[planId];
    return plan.features.includes(feature as any);
};
