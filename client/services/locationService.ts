import api from './api';

export interface LocationSuggestion {
    id: string; // OSM ID or unique string
    name: string;
    address: string;
    city: string;
    country: string;
    coordinates: {
        lat: number;
        lon: number;
    };
    distance?: number; // Distance in kilometers
}

/**
 * Searches for locations with proximity biasing
 */
export const searchLocations = async (
    query: string,
    lat?: number,
    lon?: number
): Promise<LocationSuggestion[]> => {
    try {
        if (!query || query.length < 2) return [];

        const response = await api.get('/locations/search', {
            params: { q: query, lat, lon }
        });

        const results: LocationSuggestion[] = response.data;

        // If we have user coordinates, ensure the backend results are sorted by proximity
        // (The backend already biases, but we can double check or refine ranking here if needed)
        if (lat !== undefined && lon !== undefined) {
            return results.sort((a, b) => {
                const distA = calculateDistance(lat, lon, a.coordinates.lat, a.coordinates.lon);
                const distB = calculateDistance(lat, lon, b.coordinates.lat, b.coordinates.lon);
                return distA - distB;
            }).map(item => ({
                ...item,
                distance: calculateDistance(lat, lon, item.coordinates.lat, item.coordinates.lon)
            }));
        }

        return results;
    } catch (error) {
        console.error('Location search error:', error);
        return [];
    }
};

/**
 * Helper to calculate distance in KM between two points (Haversine formula)
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const deg2rad = (deg: number) => deg * (Math.PI / 180);

/**
 * Formats distance for display (e.g. "500 m" or "1.2 km")
 */
export const formatDistance = (km: number): string => {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
};
