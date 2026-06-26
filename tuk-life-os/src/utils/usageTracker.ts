import { safeLocalStorage } from '../utils/storage';

export const trackEvent = (type: string, data: any) => {
    const analytics = JSON.parse(safeLocalStorage.getItem('tuk_usage_analytics') || '{}');
    if (!analytics[type]) analytics[type] = [];
    analytics[type].push({ ...data, timestamp: new Date().toISOString() });
    safeLocalStorage.setItem('tuk_usage_analytics', JSON.stringify(analytics));
};

export const getUsageAnalytics = () => {
    return JSON.parse(safeLocalStorage.getItem('tuk_usage_analytics') || '{}');
};
