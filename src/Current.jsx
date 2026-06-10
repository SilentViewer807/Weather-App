import React, { useState, useEffect } from 'react';
import './Current.css';

const Current = ({ lat, long }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Weather Data
  useEffect(() => {
    const fetchWeather = async () => {
      if (!lat || !long) {
        setError('Location coordinates not available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=2c92afab2e290df3da427b57135992df&units=imperial`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();

        if (data.wind?.gust && data.wind.gust < data.wind.speed) {
          data.wind.gust = null;
        }

        setWeatherData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, long]);

  // Convert Unix Timestamp To Local Time
  const formatTime = (timestamp, timezoneOffset) => {
    const date = new Date((timestamp + timezoneOffset) * 1000);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  };

  // Convert Meters To Miles
  const metersToMiles = (meters) => {
    return (meters * 0.000621371).toFixed(2);
  };

  // Get Wind Direction
  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  // Loading...
  if (loading) {
    return (
      <div className="current-weather-container">
        <div className="weather-card">
          <div
            className="card-content"
            aria-live="polite"
          >
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="current-weather-container">
        <div className="weather-card">
          <div className="card-content">Error: {error}</div>
        </div>
      </div>
    );
  }

  // No Weather Data
  if (!weatherData) {
    return (
      <div className="current-weather-container">
        <div className="weather-card">
          <div className="card-content">No weather data available</div>
        </div>
      </div>
    );
  }

  // Elements
  return (
    <div className="current-weather-container">
      {/* Basic Conditions Card */}
      <div className="weather-card">
      <h2 className="card-header">
        Basic Conditions
        <span aria-hidden="true"> ☀️</span>
      </h2>
        <div className="card-content basic-conditions">
          <div className="left-section">
            <div className="weather-icon-bg" aria-hidden="true">
              <img 
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt=""
                className="weather-icon"
              />
            </div>
            <div className="weather-summary">{weatherData.weather[0].main}</div>
            <div className="weather-description">{weatherData.weather[0].description}</div>
          </div>
          <div className="right-section">
            <div className="temperature-main">{Math.round(weatherData.main.temp)}°F</div>
            <div className="info-item">
              <span className="label">Feels Like:</span>
              <span className="value">{Math.round(weatherData.main.feels_like)}°F</span>
            </div>
            <div className="info-item">
              <span className="label">Humidity:</span>
              <span className="value">{weatherData.main.humidity}%</span>
            </div>
            <div className="info-item">
              <span className="label">Precipitation:</span>
              <span className="value">{weatherData.rain ? weatherData.rain*0.0393700787 : weatherData.snow ? weatherData.snow*0.0393700787 : 0} in/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wind & Visibility Card */}
      <div className="weather-card">
      <h2 className="card-header">
        Wind & Atmosphere
        <span aria-hidden="true"> ☁️</span>
      </h2>
        <div className="card-content wind-visibility">
          <div className="info-item">
            <span className="label">Wind Speed:</span>
            <span className="value">{weatherData.wind.speed} mph</span>
          </div>
          <div className="info-item">
            <span className="label">Wind Gust:</span>
            <span className="value">{weatherData.wind.gust ? `${weatherData.wind.gust} mph` : 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="label">Wind Direction:</span>
            <span className="value">{weatherData.wind.deg}° ({getWindDirection(weatherData.wind.deg)})</span>
          </div>
          <div className="info-item">
            <span className="label">Cloudiness:</span>
            <span className="value">{weatherData.clouds.all}%</span>
          </div>
          <div className="info-item">
            <span className="label">Visibility:</span>
            <span className="value">{metersToMiles(weatherData.visibility)} miles</span>
          </div>
        </div>
      </div>

      {/* Other Info Card */}
      <div className="weather-card">
      <h2 className="card-header">
        Other Info
        <span aria-hidden="true"> ⏰</span>
      </h2>
        <div className="card-content other-info">
          <div className="info-item">
            <span className="label">Sea-Level Pressure:</span>
            <span className="value">{weatherData.main.sea_level ?? 'N/A'} hPa</span>
          </div>
          <div className="info-item">
            <span className="label">Ground-Level Pressure:</span>
            <span className="value">{weatherData.main.grnd_level ?? 'N/A'} hPa</span>
          </div>
          <div className="info-item">
            <span className="label">Timezone:</span>
            <span className="value">{weatherData.timezone}s (UTC{weatherData.timezone >= 0 ? '+' : ''}{weatherData.timezone / 3600})</span>
          </div>
          <div className="info-item">
            <span className="label">Sunrise:</span>
            <span className="value">{formatTime(weatherData.sys.sunrise, weatherData.timezone)}</span>
          </div>
          <div className="info-item">
            <span className="label">Sunset:</span>
            <span className="value">{formatTime(weatherData.sys.sunset, weatherData.timezone)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Current;
