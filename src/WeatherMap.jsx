import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './WeatherMap.css';

const { BaseLayer } = LayersControl;

const WeatherMap = ({ lat, long }) => {
  // Variables
  const [selectedLayer, setSelectedLayer] = useState('temp_new');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const weatherLayers = [
    'temp_new',
    'wind_new',
    'clouds_new',
    'precipitation_new',
    'pressure_new'
  ];

  const layerNames = [
    'Temperature',
    'Wind',
    'Clouds',
    'Precipitation',
    'Pressure'
  ];

  const apiKey = '2c92afab2e290df3da427b57135992df';

  // Error Check
  useEffect(() => {
    if (!lat || !long) {
      setError('Location coordinates not available');
      setLoading(false);
      return;
    }

    if (typeof lat === 'number' && typeof long === 'number' && lat >= -90 && lat <= 90 && long >= -180 && long <= 180) {
      setLoading(false);
      setError(null);
    } else {
      setError('Invalid coordinates');
      setLoading(false);
    }
  }, [lat, long]);

  // Loading...
  if (loading) {
    return (
      <div
        className="map-card error"
        aria-live="polite"
      >
        Loading...
      </div>
    );
  }

  // Error
  if (error) {
    return <div className="map-card error">Error: {error}</div>;
  }

  // No Map Data
  if (!lat || !long) {
    return (
      <div className="map-card error">
        No weather map data available
      </div>
    );
  }

  // Elements
  return (
    <div className="map-card">
      <h2 className="map-card-header">Weather Radar</h2>

      <div aria-hidden="true">
        <MapContainer
          center={[lat, long]}
          zoom={6}
          scrollWheelZoom={true}
          className="leaflet-map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <TileLayer
            url={`https://tile.openweathermap.org/map/${selectedLayer}/{z}/{x}/{y}.png?appid=${apiKey}`}
            attribution='© <a href="https://openweathermap.org/">OpenWeatherMap</a>'
          />
        </MapContainer>
        <div className="layer-buttons">
          {weatherLayers.map((layer, index) => (
            <button
              key={layer}
              className={`layer-button ${
                selectedLayer === layer ? 'active' : ''
              }`}
              onClick={() => setSelectedLayer(layer)}
            >
              {layerNames[index]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherMap;
