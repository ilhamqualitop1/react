// src/components/ClusterLayer.jsx
import React, { useEffect, useState, useCallback } from 'react';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

// Icône personnalisée
const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const ClusterLayer = () => {
  const [features, setFeatures] = useState([]);
  const map = useMap();

  // Fonction pour récupérer les centroïdes
  const fetchClusterPoints = useCallback(async () => {
    if (!map) return;

    const bounds = map.getBounds();
    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ].join(',');

    try {
      const res = await axios.get(`http://localhost:5050/api/clusters/polygones?bbox=${bbox}`);

      if (res.data && Array.isArray(res.data.features)) {
        setFeatures(res.data.features);
      } else {
        console.warn('Données GeoJSON invalides:', res.data);
        setFeatures([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des clusters:', error);
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;

    fetchClusterPoints(); // Initial load
    map.on('moveend', fetchClusterPoints); // Refresh on map move

    return () => {
      map.off('moveend', fetchClusterPoints);
    };
  }, [map, fetchClusterPoints]);

  return (
    <MarkerClusterGroup>
      {features.map((feature, i) => {
        if (
          feature?.geometry?.type === 'Point' &&
          Array.isArray(feature.geometry.coordinates)
        ) {
          const [lng, lat] = feature.geometry.coordinates;
          const { nvtitre, id } = feature.properties;

          return (
            <Marker key={id || i} position={[lat, lng]} icon={icon}>
              <Popup>
                <strong>Titre :</strong> {nvtitre || 'N/A'}<br />
                <strong>ID :</strong> {id || 'N/A'}
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MarkerClusterGroup>
  );
};

export default ClusterLayer;
