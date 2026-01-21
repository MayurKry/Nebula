// Feature Identifiers
export const FEATURES = {
    TEXT_TO_IMAGE: 'TEXT_TO_IMAGE',
    TEXT_TO_VIDEO: 'TEXT_TO_VIDEO',
    TEXT_TO_AUDIO: 'TEXT_TO_AUDIO',
    FRAME_TO_VIDEO: 'FRAME_TO_VIDEO',
    CAMPAIGN_WIZARD: 'CAMPAIGN_WIZARD'
} as const;

export type FeatureId = typeof FEATURES[keyof typeof FEATURES];

// Feature Display Names
export const FEATURE_NAMES: Record<FeatureId, string> = {
    TEXT_TO_IMAGE: 'Text to Image',
    TEXT_TO_VIDEO: 'Text to Video',
    TEXT_TO_AUDIO: 'Text to Audio',
    FRAME_TO_VIDEO: 'Frame to Video',
    CAMPAIGN_WIZARD: 'Campaign Wizard'
};

// Feature Descriptions
export const FEATURE_DESCRIPTIONS: Record<FeatureId, string> = {
    TEXT_TO_IMAGE: 'Generate images from text prompts',
    TEXT_TO_VIDEO: 'Create videos from text descriptions',
    TEXT_TO_AUDIO: 'Generate audio and music from text',
    FRAME_TO_VIDEO: 'Convert static images to video',
    CAMPAIGN_WIZARD: 'AI-powered marketing campaign generator'
};

// All features list
export const ALL_FEATURES = Object.values(FEATURES);

// Helper to validate feature ID
export const isValidFeature = (featureId: string): featureId is FeatureId => {
    return ALL_FEATURES.includes(featureId as FeatureId);
};
