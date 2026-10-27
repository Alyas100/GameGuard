import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_API_URL } from '../../../config_base_url';

const DEFAULT_REPORT = {
    game: 'Unknown Game',
    description: 'No description provided.',
    platform: 'N/A',
    risks: {},
};

function toTitleCase(value) {
    return String(value)
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
        .join(' ');
}

function normalizeCategoryKey(key) {
    const raw = String(key || '').trim();
    const withoutEmojiPrefix = raw.replace(/^[^A-Za-z0-9]+/, '').trim();
    return toTitleCase(withoutEmojiPrefix || raw);
}

function normalizeRiskMap(rawCategories) {
    let categories = rawCategories;

    if (!categories) return {};

    if (typeof categories === 'string') {
        try {
            categories = JSON.parse(categories);
        } catch {
            return {};
        }
    }

    if (Array.isArray(categories)) {
        const mapped = {};
        categories.forEach((name) => {
            mapped[normalizeCategoryKey(name)] = 0;
        });
        return mapped;
    }

    if (typeof categories === 'object') {
        const mapped = {};
        Object.entries(categories).forEach(([name, score]) => {
            const numericScore = typeof score === 'number' ? score : Number(score);
            mapped[normalizeCategoryKey(name)] = Number.isFinite(numericScore) ? numericScore : 0;
        });
        return mapped;
    }

    return {};
}

function normalizePlatform(platform) {
    if (!platform) return 'N/A';

    if (Array.isArray(platform)) {
        return platform.join(', ');
    }

    if (typeof platform === 'string') {
        try {
            const parsed = JSON.parse(platform);
            if (Array.isArray(parsed)) {
                return parsed.join(', ');
            }
        } catch {
            // Keep original string fallback below.
        }

        return platform.replace(/[\[\]"']/g, '').trim() || 'N/A';
    }

    return String(platform);
}

function toDisplayDate(rawDate) {
    if (!rawDate) return 'Unknown date';
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString();
}

function normalizeImageUrl(rawImageUrl) {
    if (!rawImageUrl) return null;

    const imagePath = String(rawImageUrl).trim();
    if (!imagePath) return null;

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    const apiBase = BACKEND_API_URL.endsWith('/') ? BACKEND_API_URL.slice(0, -1) : BACKEND_API_URL;
    const hostBase = apiBase.replace(/\/api$/, '');
    const relativePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${hostBase}${relativePath}`;
}

function normalizeReport(raw) {
    const risks = normalizeRiskMap(raw.categories || raw.risks);
    return {
        id: raw.id,
        game: raw.game?.name || raw.gameName || DEFAULT_REPORT.game,
        date: toDisplayDate(raw.selectedDate || raw.createdAt),
        fullDate: toDisplayDate(raw.createdAt || raw.selectedDate),
        description: raw.description || DEFAULT_REPORT.description,
        risks,
        platform: normalizePlatform(raw.platform),
        imageUrl: normalizeImageUrl(raw.imageUrl),
    };
}

export async function getMySubmittedReports() {
    const userId = await AsyncStorage.getItem('userId');
    console.log('[MyReports] AsyncStorage userId =', userId);

    if (!userId) {
        throw new Error('No logged-in user found. Please log in again.');
    }

    const baseUrl = BACKEND_API_URL.endsWith('/') ? BACKEND_API_URL.slice(0, -1) : BACKEND_API_URL;
    const url = `${baseUrl}/reports/user/${userId}`;
    console.log('[MyReports] GET', url);

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const rawBody = await res.text();
    console.log('[MyReports] status =', res.status);
    console.log('[MyReports] raw body =', rawBody);

    if (!res.ok) {
        throw new Error(`Failed to fetch submitted reports: ${res.status} ${rawBody}`);
    }

    let data;
    try {
        data = JSON.parse(rawBody);
    } catch {
        throw new Error('Backend returned non-JSON response for submitted reports endpoint.');
    }

    const rawReports = data.reports || data.data || [];

    if (!Array.isArray(rawReports)) {
        console.warn('[MyReports] reports payload is not array:', rawReports);
        return [];
    }

    console.log('[MyReports] reports count =', rawReports.length);
    return rawReports.map(normalizeReport);
}
