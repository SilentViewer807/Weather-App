import React, { useState, useEffect } from 'react';
import './AirQuality.css';

const AirQuality = ({ lat, long }) => {
  // Variables
  const [airData, setAirData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pollutantNames = {
    co: 'Carbon Monoxide (CO)',
    no: 'Nitrogen Monoxide (NO)',
    no2: 'Nitrogen Dioxide (NO₂)',
    o3: 'Ozone (O₃)',
    so2: 'Sulphur Dioxide (SO₂)',
    pm2_5: 'Fine Particles (PM2.5)',
    pm10: 'Coarse Particles (PM10)',
    nh3: 'Ammonia (NH₃)'
  };

  // Harm Per μg/m3
  const pollutionFactors = {
    co: 0.05,
    no: 0.1,
    no2: 1.2,
    o3: 1.0,
    so2: 1.1,
    pm2_5: 2.5,
    pm10: 1.5,
    nh3: 0.4
  };

  // Fetch Air Quality
  useEffect(() => {
    const fetchAirQuality = async () => {
      if (!lat || !long) {
        setError('Location coordinates not available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=2c92afab2e290df3da427b57135992df`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch air quality data');
        }

        const data = await response.json();
        setAirData(data);
        setError(null);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAirQuality();
  }, [lat, long]);

  // Calculate Pollution Impact
  const calculatePollutionImpact = (components) => {
    const impacts = [];

    for (const [key, value] of Object.entries(components)) {
      if (key !== 'aqi' && pollutionFactors[key]) {
        const impact = value * pollutionFactors[key];
        impacts.push({
          name: pollutantNames[key],
          concentration: value,
          impact: impact
        });
      }
    }

    return impacts.sort((a, b) => b.impact - a.impact);
  };

  // Loading...
  if (loading) {
    return (
      <div className="air-quality-container">
        <h2 className="air-quality-header">Air Quality</h2>
        <div className="quality-card">
          <h3
            className="quality-card-header"
            aria-live="polite"
          >
            Loading...
          </h3>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="air-quality-container">
        <h2 className="air-quality-header">Air Quality</h2>
        <div className="quality-card">
          <h3 className="quality-card-header">Error: {error}</h3>
        </div>
      </div>
    );
  }

  const components = airData?.list[0]?.components;
  const aqi = airData?.list?.[0]?.main?.aqi;
  const aqiDescription = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
  const sortedPollutants = components ? calculatePollutionImpact(components) : [];

  // No Air Quality Data
  if (!components || !sortedPollutants.length) {
    return (
      <div className="air-quality-container">
        <h2 className="air-quality-header">
          <span aria-hidden="true">🏭 </span>
          Air Quality
        </h2>

        <div className="quality-card">
          <h3 className="quality-card-header">
            No air quality data available
          </h3>
        </div>
      </div>
    );
  }

  // Elements
  return (
    <div className="air-quality-container">
      <h2 className="air-quality-header">
      <span aria-hidden="true">🏭 </span>
      Air Quality: {aqi ? `${aqiDescription[aqi - 1]}` : "N/A"}
    </h2>
      <div className="quality-card">
        <h3 className="quality-card-header">Here's What's Causing This</h3>
        <div className="pollutants-list">
          {sortedPollutants.map((pollutant, index) => (
            <div key={index} className="pollutant-item">
              <span className="pollutant-rank">{index + 1}</span>
              <div className="pollutant-info">
                <span className="pollutant-name">{pollutant.name}</span>
                <span className="pollutant-concentration">
                  {pollutant.concentration.toFixed(2)} μg/m³
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AirQuality;
