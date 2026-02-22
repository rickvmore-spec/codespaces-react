// Lightweight ZIP → city/state/lat/lng lookup
// Uses a curated set of major ZIP prefixes + the Zippopotam.us free API as fallback
// No API key required

const ZIP_FALLBACK = {
  '100': { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.006 },
  '101': { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.006 },
  '102': { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.006 },
  '110': { city: 'Queens', state: 'NY', lat: 40.7282, lng: -73.7949 },
  '112': { city: 'Brooklyn', state: 'NY', lat: 40.6782, lng: -73.9442 },
  '200': { city: 'Washington', state: 'DC', lat: 38.9072, lng: -77.0369 },
  '201': { city: 'Washington', state: 'DC', lat: 38.9072, lng: -77.0369 },
  '300': { city: 'Atlanta', state: 'GA', lat: 33.749, lng: -84.388 },
  '303': { city: 'Atlanta', state: 'GA', lat: 33.749, lng: -84.388 },
  '330': { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
  '331': { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
  '327': { city: 'Orlando', state: 'FL', lat: 28.5383, lng: -81.3792 },
  '606': { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  '607': { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  '700': { city: 'New Orleans', state: 'LA', lat: 29.9511, lng: -90.0715 },
  '750': { city: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.797 },
  '770': { city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
  '782': { city: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 },
  '787': { city: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 },
  '802': { city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
  '850': { city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.074 },
  '891': { city: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398 },
  '900': { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  '902': { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  '921': { city: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
  '941': { city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
  '946': { city: 'Oakland', state: 'CA', lat: 37.8044, lng: -122.2712 },
  '950': { city: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 },
  '971': { city: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
  '981': { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
  '021': { city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
  '191': { city: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652 },
  '152': { city: 'Pittsburgh', state: 'PA', lat: 40.4406, lng: -79.9959 },
  '481': { city: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458 },
  '441': { city: 'Cleveland', state: 'OH', lat: 41.4993, lng: -81.6944 },
  '432': { city: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988 },
  '372': { city: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816 },
  '381': { city: 'Memphis', state: 'TN', lat: 35.1495, lng: -90.049 },
  '282': { city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
  '551': { city: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.265 },
  '631': { city: 'St. Louis', state: 'MO', lat: 38.627, lng: -90.1994 },
  '641': { city: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786 },
  '462': { city: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581 },
  '532': { city: 'Milwaukee', state: 'WI', lat: 43.0389, lng: -87.9065 },
  '961': { city: 'Salt Lake City', state: 'UT', lat: 40.7608, lng: -111.891 },
  '968': { city: 'Honolulu', state: 'HI', lat: 21.3069, lng: -157.8583 },
};

/**
 * Look up location data from a ZIP code.
 * Tries the Zippopotam.us free API first, falls back to local prefix table.
 * @param {string} zip - 5-digit US ZIP code
 * @returns {Promise<{city, state, lat, lng}>}
 */
export async function lookupZip(zip) {
  const cleaned = zip.trim().replace(/-.*$/, '');

  if (!/^\d{5}$/.test(cleaned)) {
    throw new Error(`Invalid ZIP code: "${zip}". Must be a 5-digit US ZIP code.`);
  }

  // Try the free Zippopotam.us API first
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${cleaned}`, {
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      const place = data.places?.[0];
      if (place) {
        return {
          city: place['place name'],
          state: place['state abbreviation'],
          lat: parseFloat(place.latitude),
          lng: parseFloat(place.longitude),
          zip: cleaned,
        };
      }
    }
  } catch {
    // API unavailable — fall through to local lookup
  }

  // Local fallback: try 3-digit prefix
  const prefix = cleaned.substring(0, 3);
  const match = ZIP_FALLBACK[prefix];
  if (match) {
    return { ...match, zip: cleaned };
  }

  throw new Error(`Could not resolve ZIP code "${zip}". Please check and try again.`);
}
