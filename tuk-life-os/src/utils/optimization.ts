import { safeLocalStorage } from './storage';
import { getUsageAnalytics } from './usageTracker';

export const getOptimizedActions = (allActions: any[]) => {
    const analytics = getUsageAnalytics();
    const personalization = JSON.parse(safeLocalStorage.getItem('tuk_personalization') || '{"autoSort": true, "autoHide": true}');
    const favorites = JSON.parse(safeLocalStorage.getItem('tuk_favorites') || '[]');

    if (!personalization.autoSort) return allActions;

    // Calculate scores
    const scores: Record<string, number> = {};
    Object.entries(analytics).forEach(([type, events]: [string, any]) => {
        scores[type] = events.length;
    });

    const sortedActions = [...allActions].sort((a, b) => {
        if (favorites.includes(a.type) && !favorites.includes(b.type)) return -1;
        if (!favorites.includes(a.type) && favorites.includes(b.type)) return 1;
        
        return (scores[b.type] || 0) - (scores[a.type] || 0);
    });

    return sortedActions;
};

export const toggleFavorite = (type: string) => {
    let favorites = JSON.parse(safeLocalStorage.getItem('tuk_favorites') || '[]');
    if (favorites.includes(type)) {
        favorites = favorites.filter((t: string) => t !== type);
    } else {
        favorites.push(type);
    }
    safeLocalStorage.setItem('tuk_favorites', JSON.stringify(favorites));
};
