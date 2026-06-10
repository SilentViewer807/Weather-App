import React, { useState, useEffect, useRef } from 'react';
import './Hourly.css';

const Hourly = ({ lat, long }) => {
  // Variables
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const canvasRef = useRef(null);
  const graphScrollRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const pointSpacing = 50;
  const [visibleOffset, setVisibleOffset] = useState(
    Math.round(window.innerWidth / 400) + 1
  );

  // Fetch Forecast Data
  useEffect(() => {
    const fetchForecastData = async () => {
      if (!lat || !long) {
        setError('Location coordinates not available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=2c92afab2e290df3da427b57135992df&units=imperial`
        );
        if (!response.ok) throw new Error('Failed to fetch weather data');
        const data = await response.json();
        setForecastData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForecastData();
  }, [lat, long]);

  // Graph Draw Calls
  useEffect(() => {
    if (forecastData && canvasRef.current) {
      drawTemperatureGraph();
    }

    const handleChange = () => {
      if (forecastData && canvasRef.current) drawTemperatureGraph();
    };

    window.addEventListener('resize', handleChange);
    return () => window.removeEventListener('resize', handleChange);
  }, [forecastData, selectedIndex]);

  // Scroll Graph When Different Item Selected
  useEffect(() => {
    if (!forecastData || !graphScrollRef.current) return;
    const scrollX = (selectedIndex - visibleOffset) * pointSpacing;
    graphScrollRef.current.scrollTo({
      left: scrollX,
      behavior: 'smooth'
    });
  }, [selectedIndex, forecastData]);

  // Is Night Time?
  const isNighttime = (timestamp, timezoneOffset) => {
    const localTime = new Date((timestamp + timezoneOffset) * 1000);
    const hour = localTime.getUTCHours();
    return hour < 6 || hour >= 18;
  };

  // Draw Temperature Graph
  const drawTemperatureGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas || !forecastData) return;

    const ctx = canvas.getContext('2d');
    const temperatures = forecastData.list.map(item => item.main.temp);
    const sunrise = forecastData.city.sunrise;
    const sunset = forecastData.city.sunset;
    const timezoneOffset = forecastData.city.timezone;

    const fullGraphWidth = pointSpacing * (temperatures.length - 0.5);

    const devicePixelRatio = window.devicePixelRatio || 1;
    const height = 100;
    canvas.width = fullGraphWidth * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${fullGraphWidth}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, fullGraphWidth, height);

    const padding = 12;
    const graphWidth = fullGraphWidth - padding * 2;
    const graphHeight = height - padding * 2.5;
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const tempRange = maxTemp - minTemp + 5;

    // Points Calculation
    const points = temperatures.map((temp, i) => ({
      x: padding + i * pointSpacing,
      y: padding + graphHeight - ((temp - minTemp) / tempRange) * graphHeight,
      isNight: isNighttime(forecastData.list[i].dt, timezoneOffset)
    }));

    // Draw Segments
    for (let i = 0; i < points.length - 1; i++) {
      const currentPoint = points[i];
      const nextPoint = points[i + 1];

      const isNightSegment = currentPoint.isNight;

      // Segement
      const gradient = ctx.createLinearGradient(0, padding, 0, height -padding);
      if (isNightSegment) {
        gradient.addColorStop(0, 'rgba(107, 157, 238, 0.4)');
        gradient.addColorStop(1, 'rgba(107, 157, 238, 0.2)');
      } else {
        gradient.addColorStop(0, 'rgba(255, 235, 59, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 235, 59, 0.4)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(currentPoint.x, currentPoint.y);
      ctx.lineTo(nextPoint.x, nextPoint.y);
      ctx.lineTo(nextPoint.x, height - padding);
      ctx.lineTo(currentPoint.x, height - padding);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = isNightSegment ? '#7c9ed6' : '#FFC107';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(currentPoint.x, currentPoint.y);
      ctx.lineTo(nextPoint.x, nextPoint.y);
      ctx.stroke();
    }

    // Draw Labels
    ctx.font = '550 11px sans-serif';
    ctx.textAlign = 'center';
    points.forEach((point, i) => {
      if (i === selectedIndex) {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#6b6b6b';
      }

      ctx.fillText(`${Math.round(temperatures[i])}°`, point.x, point.y - 8);
    });
  };

  // Format Time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    return `${hours}:${minutes} ${ampm}`;
  };

  // Detect 6:00 AM or 6:00 PM
  const isSixTransition = (timestamp, timezoneOffset) => {
    const local = new Date((timestamp + timezoneOffset) * 1000);
    const hour = local.getUTCHours();
    const minute = local.getUTCMinutes();
    return minute === 0 && (hour === 6 || hour === 18);
  };

  // Get Day Of Week
  const getDayOfWeek = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Get Weather Icon
  const getWeatherIcon = (iconCode) =>
    `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  // States
  if (loading)
    return <div
      className="map-card error"
      aria-live="polite"
    >
      Loading...
    </div>;
  if (error)
    return <div className="map-card error">Error: {error}</div>;
  if (!forecastData?.list?.length) {
    return (
      <div className="map-card error">
        No hourly forecast data available
      </div>
    );
  }

  // Elements
  return (
    <div className="hourly-card">
      <div className="top-section">
        {/* Top Left */}
        <div className="top-left">
          <div className="icon-group">
            <div className="hourly-weather-icon-bg">
              <img
                src={getWeatherIcon(forecastData.list[selectedIndex].weather[0].icon)}
                alt=""
                aria-hidden="true"
                className="hourly-weather-icon"
              />
            </div>
            <div className="hourly-main-group">
              <span className="hourly-temperature">
                {Math.round(forecastData.list[selectedIndex].main.temp)}°F
              </span>
              <span className="hourly-weather-description">
                {forecastData.list[selectedIndex].weather[0].description}
              </span>
            </div>
          </div>
          <div className="weather-details-inline">
            <span className="detail-text">
              Feels Like {Math.round(forecastData.list[selectedIndex].main.feels_like)}°F
            </span>
            <span className="detail-text">
              Humidity {forecastData.list[selectedIndex].main.humidity}%
            </span>
            <span className="detail-text">
              Wind Speed {forecastData.list[selectedIndex].wind.speed} mph
            </span>
          </div>
        </div>

        {/* Top Right */}
        <div className="top-right">
          <div className="day-of-week">{getDayOfWeek(forecastData.list[selectedIndex].dt)}</div>
          <div className="time">{formatTime(forecastData.list[selectedIndex].dt)}</div>
          <div className="day-part">{isNighttime(forecastData.list[selectedIndex].dt, forecastData.city.timezone) ? "Nighttime" : "Daytime"}</div>
        </div>
      </div>

      {/* Temperature Graph */}
      <div className="graph-scroll-container">
        <div className="graph-container" ref={graphScrollRef}>
          <canvas
            ref={canvasRef}
            className="temperature-graph"
            aria-hidden="true"
          />
          <p className="sr-only">
            Temperature forecast graph. Use the forecast cards below to select and access the same information.
          </p>
        </div>
      </div>

      {/* Forecast Items */}
      <div className="forecast-scroll-container">
        <div className="forecast-items" ref={scrollContainerRef}>
          {forecastData.list.map((item, index) => {
            const showSeparator = index > 0 && 
              getDayOfWeek(forecastData.list[index - 1].dt + 1) !== getDayOfWeek(item.dt + 1);

            return (
              <React.Fragment key={index}>
                {showSeparator && (
                  <div className="day-separator">
                    <div
                      className="separator-circle"
                      aria-hidden="true"
                    />
                  </div>
                )}
                <button
                  type="button"
                  className={`forecast-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => setSelectedIndex(index)}
                  aria-pressed={index === selectedIndex}
                >
                  <div className="forecast-day">{getDayOfWeek(item.dt)}</div>
                  <div
                    className="forecast-time"
                    style={{
                      color: isSixTransition(item.dt, forecastData.city.timezone)
                        ? '#59572e'
                        : isNighttime(item.dt, forecastData.city.timezone)
                        ? '#1c5075'
                        : '#8a8308'
                    }}                    
                  >
                    {formatTime(item.dt)}
                  </div>
                  <div className="weather-icon-bg icon-bg-hourly">
                    <img
                      src={getWeatherIcon(item.weather[0].icon)}
                      alt=""
                      aria-hidden="true"
                      className="weather-icon icon-hourly"
                    />
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Hourly;
