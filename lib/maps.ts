import { Loader } from '@googlemaps/js-api-loader';
import mapboxgl from 'mapbox-gl';

const googleLoader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places', 'routes', 'geometry'],
});

export const loadGoogleMaps = async () => {
  return googleLoader.load();
};

export const initMapbox = (containerId: string, center: [number, number], zoom: number = 12) => {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
  return new mapboxgl.Map({
    container: containerId,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: center,
    zoom: zoom,
  });
};

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: string[];
  types?: string[];
  location: { lat: number; lng: number };
}

export const searchPlaces = async (query: string): Promise<PlaceResult[]> => {
  await loadGoogleMaps();
  const service = new google.maps.places.PlacesService(document.createElement('div'));
  
  return new Promise((resolve, reject) => {
    service.textSearch({ query, location: new google.maps.LatLng(19.4326, -99.1332), radius: 5000 }, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results.map(p => ({
          id: p.place_id || '',
          name: p.name || '',
          address: p.formatted_address || '',
          rating: p.rating,
          user_ratings_total: p.user_ratings_total,
          photos: p.photos?.map(photo => photo.getUrl()),
          types: p.types,
          location: { lat: p.geometry?.location?.lat() || 0, lng: p.geometry?.location?.lng() || 0 }
        })));
      } else {
        reject(status);
      }
    });
  });
};
