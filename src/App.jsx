import React, { useState, useEffect } from "react";
import "./App.css";
import NavigationBar from "./NavigationBar";
import Current from './Current';
import Hourly from "./Hourly";
import WeatherMap from "./WeatherMap";
import AirQuality from "./AirQuality";
import Footer from "./Footer";

const App = () => {
  // Variables
  const [locationData, setLocationData] = useState({
    lat: 0,
    long: 0,
    placeName: "",
    loading: true,
    error: null
  });

  const [selectedTab, setSelectedTab] = useState('current');

  // Fetch Place Name
  const fetchPlaceName = (lat, lon) => {
    const xhr = new XMLHttpRequest();
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const endpoint = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          try {
            const response = JSON.parse(this.responseText);
            if (response && response.length > 0) {
              const location = response[0];
              let placeName = location.name;
              if (location.state) {
                placeName += `, ${location.state}`;
              }
              if (location.country) {
                placeName += `, ${location.country}`;
              }
              
              setLocationData(prev => ({
                ...prev,
                placeName: placeName,
                loading: false,
                error: null
              }));
            } else {
              setLocationData(prev => ({
                ...prev,
                placeName: "Unknown Location",
                loading: false,
                error: null
              }));
            }
          } catch (error) {
            setLocationData(prev => ({
              ...prev,
              placeName: "Unknown Location",
              loading: false,
              error: "Error fetching place name"
            }));
          }
        } else {
          setLocationData(prev => ({
            ...prev,
            placeName: "Unknown Location",
            loading: false,
            error: "Failed to fetch place name"
          }));
        }
      }
    };
    
    xhr.open('GET', endpoint, true);
    xhr.send();
  };

  // Fetch Coordinates
  const fetchCoordinates = (city, countryCode, stateCode = "") => {
    const xhr = new XMLHttpRequest();
    const apiKey = '2c92afab2e290df3da427b57135992df';
    let query = `${city}`;
    if (stateCode) {
      query += `,${stateCode}`;
    }
    query += `,${countryCode}`;
    const endpoint = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${apiKey}`;
    
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          try {
            const response = JSON.parse(this.responseText);
            if (response && response.length > 0) {
              const location = response[0];
              let placeName = location.name;
              if (location.state) {
                placeName += `, ${location.state}`;
              }
              if (location.country) {
                placeName += `, ${location.country}`;
              }
              
              setLocationData({
                lat: location.lat,
                long: location.lon,
                placeName: placeName,
                loading: false,
                error: null
              });
            } else {
              setLocationData(prev => ({
                ...prev,
                loading: false,
                error: "Location not found"
              }));
            }
          } catch (error) {
            setLocationData(prev => ({
              ...prev,
              loading: false,
              error: "Error fetching coordinates"
            }));
          }
        } else {
          setLocationData(prev => ({
            ...prev,
            loading: false,
            error: "Failed to fetch coordinates"
          }));
        }
      }
    };
    
    xhr.open('GET', endpoint, true);
    xhr.send();
  };

  // Location Changing
  const handleLocationChange = (city, countryCode, stateCode, latitude, longitude) => {
    setLocationData(prev => ({ ...prev, loading: true }));
    
    if (latitude !== "" && longitude !== "") {
      // User Gave Lat, Long
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      
      setLocationData(prev => ({
        ...prev,
        lat: lat,
        long: lon
      }));
      
      fetchPlaceName(lat, lon);
    } else if (city !== "" && countryCode !== "") {
      // User Gave City
      fetchCoordinates(city, countryCode, stateCode);
    }
  };

  // Start
  useEffect(() => {
    // Approximate User Lat, Long
    const fetchLocationData = () => {
      const xhr = new XMLHttpRequest();
      const endpoint = 'https://ipwho.is/?fields=latitude,longitude,success,message';

      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            try {
              const response = JSON.parse(this.responseText);
              if (response.success) {
                setLocationData(prev => ({
                  ...prev,
                  lat: response.latitude,
                  long: response.longitude
                }));
                fetchPlaceName(response.latitude, response.longitude);
              } else {
                setLocationData({
                  lat: 0,
                  long: 0,
                  placeName: "",
                  loading: false,
                  error: 'Query failed: ' + response.message
                });
              }
            } catch (error) {
              setLocationData({
                lat: 0,
                long: 0,
                placeName: "",
                loading: false,
                error: "Error parsing response"
              });
            }
          } else {
            setLocationData({
              lat: 0,
              long: 0,
              placeName: "",
              loading: false,
              error: "Network request failed"
            });
          }
        }
      };

      xhr.open('GET', endpoint, true);
      xhr.send();
    };

    // User Accepted Location Request
    const successCallback = (position) => {
      const { latitude, longitude } = position.coords;
      setLocationData(prev => ({
        ...prev,
        lat: latitude,
        long: longitude
      }));
      fetchPlaceName(latitude, longitude);
    };

    // User Denied Location Request
    const errorCallback = (error) => {
      fetchLocationData();
    };

    // First, Ask For Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
      fetchLocationData();
    }
  }, []);  

  // Tab Changing
  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  // Loading Location...
  if (locationData.loading) {
    return (
      <div className="loading-container">
        <p>Loading location data...</p>
      </div>
    );
  }

  // Elements
  return (
    <>
      <h1 className="sr-only">
        Weather Dashboard
      </h1>

      <NavigationBar 
        lat={locationData.lat}
        long={locationData.long}
        placeName={locationData.placeName}
        onLocationChange={handleLocationChange}
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
      />

      <main id="main-content">
        {selectedTab === 'current' && (
          <section
            role="tabpanel"
            id="current-panel"
            aria-labelledby="current-tab"
          >
            <Current lat={locationData.lat} long={locationData.long} />
          </section>
        )}
        {selectedTab === 'hourly' && (
          <section
            role="tabpanel"
            id="hourly-panel"
            aria-labelledby="hourly-tab"
          >
            <Hourly lat={locationData.lat} long={locationData.long} />
          </section>
        )}
        {selectedTab === 'map' && (
          <section
            role="tabpanel"
            id="weather-map-panel"
            aria-labelledby="weather-map-tab"
          >
            <WeatherMap lat={locationData.lat} long={locationData.long} />
          </section>
        )}
        {selectedTab === 'air' && (
          <section
            role="tabpanel"
            id="air-quality-panel"
            aria-labelledby="air-quality-tab"
          >
            <AirQuality lat={locationData.lat} long={locationData.long} />
          </section>
        )}

        <Footer/>
      </main>
    </>
  );
};

export default App;
