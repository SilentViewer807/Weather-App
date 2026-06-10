import React, { useState } from "react";
import "./NavigationBar.css";

const NavigationBar = ({ lat, long, placeName, onLocationChange, selectedTab, onTabChange }) => {
  // Variables
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("");
  const [iso, setIso] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState("");

  // City Change
  const handleCityChange = (e) => {
    setCity(e.target.value);
    if (e.target.value !== "") {
      setLatitude("");
      setLongitude("");
    }
    setError("");
  };

  // Iso Change
  const handleIsoChange = (e) => {
    setIso(e.target.value.toUpperCase());
    if (e.target.value !== "") {
      setLatitude("");
      setLongitude("");
    }
    setError("");
  };

  // State Change
  const handleStateChange = (e) => {
    setStateCode(e.target.value.toUpperCase());
    if (e.target.value !== "") {
      setLatitude("");
      setLongitude("");
    }
    setError("");
  };

  // Lat Change
  const handleLatChange = (e) => {
    setLatitude(e.target.value);
    if (e.target.value !== "" || longitude !== "") {
      setCity("");
      setIso("");
      setStateCode("");
    }
    setError("");
  };

  // Long Change
  const handleLongChange = (e) => {
    setLongitude(e.target.value);
    if (e.target.value !== "" || latitude !== "") {
      setCity("");
      setIso("");
      setStateCode("");
    }
    setError("");
  };

  // Handle Full Change
  const handleChangeClick = () => {
    const hasCoordinates = latitude !== "" || longitude !== "";
    const hasCityCountry = city !== "" || iso !== "";
    
    if (!hasCoordinates && !hasCityCountry) {
      setError("Please fill out either of them completely.");
      return;
    }
    
    if ((latitude !== "" && longitude === "") || (longitude !== "" && latitude === "")) {
      setError("Please enter both latitude and longitude.");
      return;
    }
    
    if ((city !== "" && iso === "") || (iso !== "" && city === "")) {
      setError("Please enter both city and country code.");
      return;
    }

    setError("");
    onLocationChange(city, iso, stateCode, latitude, longitude);

    setCity("");
    setIso("");
    setStateCode("");
    setLatitude("");
    setLongitude("");
    setOpen(false);
  };

  // Elements
  return (
    <>
      <nav className="navbar">
        {/* Main */}
        <div className="coords">
        {lat}° Lat, {long}° Long
        </div>

        <div className="location-row">
          <span className="location-name">{placeName}</span>
          <button
            className="change-btn"
            onClick={() => setOpen((prev) => !prev)}
            aria-hidden="true"
          >
            Change Location {open ? " ▲" : " ▼"}
          </button>
        </div>

        {/* Dropdown */}
        <div
          id="location-dropdown"
          className={`dropdown ${open ? "open" : ""}`}
        >
          {/* City, Iso, State */}
          <div className="dropdown-top">
            <div className="input-group">
              <label htmlFor="city" id="city-label">City:</label>
              <input
                id="city"
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={handleCityChange}
              />
            </div>

            <div className="input-group">
              <label htmlFor="iso">
                Your country's 2-letter ISO code (examples: US, RU, CA):
              </label>
              <input
                id="iso"
                type="text"
                placeholder="Enter ISO code"
                maxLength={2}
                value={iso}
                onChange={handleIsoChange}
              />
            </div>

            {iso === "US" && (
              <div className="input-group">
                <label htmlFor="state">
                  Your state's 2-letter code (examples: CA, TX, WA):
                </label>
                <input
                  id="state"
                  type="text"
                  placeholder="Enter state code"
                  maxLength={2}
                  value={stateCode}
                  onChange={handleStateChange}
                />
              </div>
            )}
          </div>

          <div className="or-text">— OR —</div>

          {/* Lat, Long */}
          <div className="dropdown-bottom">
            <div className="input-group">
              <label htmlFor="lat">Latitude:</label>
              <input
                id="lat"
                type="number"
                placeholder="Enter latitude"
                value={latitude}
                onChange={handleLatChange}
              />
            </div>

            <div className="input-group">
              <label htmlFor="long">Longitude:</label>
              <input
                id="long"
                type="number"
                placeholder="Enter longitude"
                value={longitude}
                onChange={handleLongChange}
              />
            </div>
          </div>

          <div className="button-error-container">
            <button className="confirm-btn" onClick={handleChangeClick}>Change</button>
            {error && <span className="error-message" role="alert">{error}</span>}
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="tab-container">
        <div
          className="tab-buttons"
          role="tablist"
          aria-label="Weather Sections"
        >
          <button
            id="current-tab"
            role="tab"
            aria-selected={selectedTab === 'current'}
            aria-controls="current-panel"
            className={`tab-button ${selectedTab === 'current' ? 'active' : ''}`}
            onClick={() => onTabChange('current')}
          >
            Current
            <div className="tab-underline"></div>
          </button>
          <button
            id="hourly-tab"
            role="tab"
            aria-selected={selectedTab === 'hourly'}
            aria-controls="hourly-panel"
            className={`tab-button ${selectedTab === 'hourly' ? 'active' : ''}`}
            onClick={() => onTabChange('hourly')}
          >
            3-Hourly
            <div className="tab-underline"></div>
          </button>
          <button
            id="weather-map-tab"
            role="tab"
            aria-selected={selectedTab === 'map'}
            aria-controls="weather-map-panel"
            className={`tab-button ${selectedTab === 'map' ? 'active' : ''}`}
            onClick={() => onTabChange('map')}
          >
            Weather Map
            <div className="tab-underline"></div>
          </button>
          <button
            id="air-quality-tab"
            role="tab"
            aria-selected={selectedTab === 'air'}
            aria-controls="air-quality-panel"
            className={`tab-button ${selectedTab === 'air' ? 'active' : ''}`}
            onClick={() => onTabChange('air')}
          >
            Air Quality
            <div className="tab-underline"></div>
          </button>
        </div>
        <hr className="section-line" />
      </div>
    </>
  );
};

export default NavigationBar;
