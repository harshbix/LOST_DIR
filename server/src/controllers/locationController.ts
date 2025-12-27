import { Request, Response } from 'express';
import axios from 'axios';

export const searchLocations = async (req: Request, res: Response) => {
    try {
        const { q, lat, lon } = req.query;

        if (!q || (q as string).length < 2) {
            return res.json([]);
        }

        const buildUrl = (withBiasing: boolean) => {
            let baseUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q as string)}&limit=15`;
            if (withBiasing && lat && lon) {
                baseUrl += `&lat=${lat}&lon=${lon}`;
            }
            return baseUrl;
        };

        // Attempt biased search first
        let response = await axios.get(buildUrl(true));

        // If empty and we had biasing, try a broader search without lat/lon
        if (response.data.features.length === 0 && lat && lon) {
            response = await axios.get(buildUrl(false));
        }

        const suggestions = response.data.features.map((feature: any) => {
            const props = feature.properties;
            const coords = feature.geometry.coordinates;

            const city = props.city || props.town || props.village || '';
            const district = props.district || '';
            const street = props.street || '';
            const state = props.state || '';
            const country = props.country || '';

            // Filter out exact duplicates in address parts
            const addressParts = [props.name, street, district, city, state, country]
                .filter(p => p && p.trim() !== '');
            const fullAddress = Array.from(new Set(addressParts)).join(', ');

            return {
                id: `${props.osm_id || Math.random()}-${props.name}`, // Guaranteed unique
                name: props.name || city || 'Unknown Place',
                address: fullAddress,
                city: city,
                country: country,
                coordinates: {
                    lat: coords[1],
                    lon: coords[0]
                }
            };
        });

        // Filter duplicates by name + address to keep list clean
        const uniqueSuggestions = suggestions.filter((v: any, i: number, a: any[]) =>
            a.findIndex(t => (t.address === v.address)) === i
        ).slice(0, 10);

        res.json(uniqueSuggestions);
    } catch (error) {
        console.error('Location Search Error:', error);
        res.status(500).json({ message: 'Error fetching locations' });
    }
};
