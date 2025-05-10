import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Circle, 
  ZoomControl,
  useMap,
  useMapEvents
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import L from 'leaflet';
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet.heat';

// Fix Leaflet marker icons
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom markers by category
const MARKER_ICONS = {
  LANDMARK: L.icon({...icon.options, iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png'}),
  FOOD: L.icon({...icon.options, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'}),
  ACTIVITY: L.icon({...icon.options, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'}),
  HOTEL: L.icon({...icon.options, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'}),
  USER: L.icon({...icon.options, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png'}),
};

// Interactive cities with rich content
const CITIES = [
  { 
    name: 'London', 
    position: [51.505, -0.09], 
    description: 'The capital of England and the United Kingdom',
    type: 'LANDMARK',
    color: '#3388ff',
    radius: 10000,
    facts: [
      'London has four UNESCO World Heritage Sites',
      'The London Underground is the oldest underground railway network in the world',
      'Over 300 languages are spoken in London'
    ],
    image: 'https://cdn.britannica.com/01/94501-050-7C939C4E/Big-Ben-Houses-of-Parliament-London.jpg'
  },
  { 
    name: 'Paris', 
    position: [48.8566, 2.3522], 
    description: 'The capital of France', 
    type: 'LANDMARK',
    color: '#3388ff',
    radius: 8000,
    facts: [
      'The Eiffel Tower was built for the 1889 World Fair',
      'Paris has over 400 parks and gardens',
      'Paris hosts the famous annual Tour de France cycling race'
    ],
    image: 'https://cdn.britannica.com/82/195482-050-2373E635/Eiffel-Tower-Paris.jpg'
  },
  { 
    name: 'Rome', 
    position: [41.9028, 12.4964], 
    description: 'The capital of Italy', 
    type: 'LANDMARK',
    color: '#3388ff',
    radius: 7000,
    facts: [
      'Rome is often called the "Eternal City"',
      'The Roman Colosseum could hold up to 80,000 spectators',
      'There are more than 900 churches in Rome'
    ],
    image: 'https://cdn.britannica.com/71/115571-050-4CFA6451/Colosseum-Rome.jpg'
  },
  { 
    name: 'Delicious Pasta', 
    position: [41.9000, 12.5100], 
    description: 'Try authentic Italian pasta here!', 
    type: 'FOOD',
    facts: [
      'Italy has over 350 different pasta shapes',
      'Pasta has been a staple of Italian cuisine since the 13th century',
      'The average Italian consumes about 23 kg of pasta per year'
    ],
    image: 'https://images.unsplash.com/photo-1622973536968-3ead9e780960'
  },
  { 
    name: 'Tower of London Tour', 
    position: [51.5081, -0.0759], 
    description: 'Historical guided tours available daily', 
    type: 'ACTIVITY',
    facts: [
      'The Tower of London was built by William the Conqueror in 1078',
      'It has served as a royal residence, treasury, armory, and prison',
      'The Crown Jewels are kept in the Tower of London'
    ],
    image: 'https://cdn.britannica.com/08/115708-050-3018F59A/Tower-of-London-England.jpg'
  },
  { 
    name: 'Grand Hotel Paris', 
    position: [48.8606, 2.3376], 
    description: 'Luxury accommodation in the heart of Paris', 
    type: 'HOTEL',
    facts: [
      'Paris has over 2,000 hotels ranging from luxury to budget accommodations',
      "The world's first grand hotel, Le Meurice, opened in Paris in 1815",
      'The Paris hotel rating system uses stars, with five stars being the highest rating'
    ],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945'
  },
  // Added new locations
  { 
    name: 'Barcelona', 
    position: [41.3851, 2.1734], 
    description: "The cosmopolitan capital of Spain's Catalonia region", 
    type: 'LANDMARK',
    color: '#3388ff',
    radius: 7500,
    facts: [
      'Barcelona is home to Sagrada Familia, under construction since 1882',
      'The city hosted the 1992 Summer Olympics',
      "Barcelona's beach is over 4 km long and was created for the Olympics"
    ],
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded'
  },
  { 
    name: 'Tokyo Sushi', 
    position: [35.6895, 139.6917], 
    description: 'Experience authentic Japanese sushi', 
    type: 'FOOD',
    facts: [
      'Sushi originated as a preservation method using fermented rice',
      "Tokyo's Tsukiji Fish Market was once the largest fish market in the world",
      'Traditional sushi takes years of apprenticeship to master'
    ],
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754'
  }
];

// MapControls component
const MapControls = ({ isAddingMarkers, toggleAddMarkers, mapStyle, setMapStyle }) => {
  return (
    <div className="map-controls">
      <div className="mode-selector">
        <button 
          className={`mode-btn ${isAddingMarkers ? 'active' : ''}`}
          onClick={toggleAddMarkers}
        >
          {isAddingMarkers ? 'Cancel' : 'Add Markers'}
        </button>
      </div>
      
      <div className="style-selector">
        <label>Map Style:</label>
        <select value={mapStyle} onChange={(e) => setMapStyle(e.target.value)}>
          <option value="streets">Streets</option>
          <option value="satellite">Satellite</option>
          <option value="dark">Dark</option>
          <option value="topo">Topographic</option>
          <option value="watercolor">Watercolor</option>
        </select>
      </div>
    </div>
  );
};

// Geocoder component
function GeocoderControl() {
  const map = useMap();
  
  useEffect(() => {
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: true,
      position: 'topleft',
      placeholder: 'Search for a location...',
      errorMessage: 'Nothing found.',
      suggestMinLength: 3,
      suggestTimeout: 250,
      queryMinLength: 1
    }).on('markgeocode', function(e) {
      const { center, bbox } = e.geocode;
      map.fitBounds(bbox);
      
      // Add marker with animation
      const marker = L.marker(center)
        .addTo(map)
        .bindPopup(e.geocode.name)
        .openPopup();
      
      // Bounce animation
      const animateMarker = () => {
        const el = marker._icon;
        if (!el) return;
        
        let pos = 0;
        const animate = () => {
          pos = pos === 0 ? -10 : 0;
          el.style.transform = el.style.transform.replace(/translateY\([^)]+\)/, '') + ` translateY(${pos}px)`;
          if (pos !== 0) setTimeout(animate, 150);
        };
        animate();
      };
      
      animateMarker();
    }).addTo(map);
    
    return () => map.removeControl(geocoder);
  }, [map]);
  
  return null;
}

// Weather display component
function WeatherDisplay() {
  const [weather, setWeather] = useState(null);
  const map = useMap();
  
  useEffect(() => {
    // Mock weather data - replace with real API in production
    const mockWeatherData = {
      temperature: Math.floor(Math.random() * 35) - 5, // -5°C to 30°C
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Windy'][Math.floor(Math.random() * 5)],
      humidity: Math.floor(Math.random() * 100),
      windSpeed: Math.floor(Math.random() * 30)
    };
    
    setTimeout(() => setWeather(mockWeatherData), 700);
  }, []);
  
  useEffect(() => {
    if (!weather) return;
    
    const weatherContainer = L.DomUtil.create('div', 'weather-info-container');
    
    const WeatherControl = L.Control.extend({
      options: { position: 'bottomleft' },
      onAdd: function() {
        const getWeatherIcon = (condition) => {
          const icons = {
            sunny: '☀️',
            cloudy: '☁️',
            rainy: '🌧️',
            snowy: '❄️',
            windy: '💨'
          };
          return icons[condition.toLowerCase()] || '🌤️';
        };
        
        weatherContainer.innerHTML = `
          <div class="weather-card">
            <h3>Current Weather</h3>
            <div class="weather-condition">${getWeatherIcon(weather.condition)} ${weather.condition}</div>
            <div class="weather-temp">${weather.temperature}°C</div>
            <div class="weather-details">
              <span>💧 ${weather.humidity}%</span>
              <span>💨 ${weather.windSpeed} km/h</span>
            </div>
          </div>
        `;
        return weatherContainer;
      }
    });
    
    const weatherControl = new WeatherControl();
    map.addControl(weatherControl);
    
    return () => map.removeControl(weatherControl);
  }, [map, weather]);
  
  return null;
}

// Add marker on click handler
function ClickHandler({ onAddMarker, isAddingMarkers }) {
  useMapEvents({
    click: (e) => {
      if (isAddingMarkers) onAddMarker(e.latlng);
    }
  });
  return null;
}

// City info panel component
const CityInfoPanel = ({ city, onClose }) => {
  if (!city) return null;
  
  return (
    <div className="city-info-panel">
      <button className="close-btn" onClick={onClose}>×</button>
      <h2>{city.name}</h2>
      {city.image && (
        <img src={city.image} alt={city.name} className="city-image" />
      )}
      <p>{city.description}</p>
      
      {city.facts && (
        <div className="city-facts">
          <h3>Quick Facts</h3>
          <ul>
            {city.facts.map((fact, index) => (
              <li key={index}>{fact}</li>
            ))}
          </ul>
        </div>
      )}
      
      <button className="explore-btn" onClick={onClose}>
        Explore Map
      </button>
    </div>
  );
};

// Main Map component
const Map = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [userMarkers, setUserMarkers] = useState([]);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const [mapStyle, setMapStyle] = useState('streets');
  const [showCityInfo, setShowCityInfo] = useState(false);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const heatmapLayerRef = useRef(null);
  const mapRef = useRef(null);
  
  // Initial map center and zoom
  const center = [48.8566, 2.3522]; // Paris
  const zoom = 5;
  
  const handleCityClick = (city) => {
    setSelectedCity(city);
    setShowCityInfo(true);
  };
  
  const handleAddMarker = (latlng) => {
    if (!isAddingMarkers) return;
    
    const newMarker = {
      id: Date.now(),
      position: [latlng.lat, latlng.lng],
      title: `My Marker #${userMarkers.length + 1}`,
      description: 'My custom location',
      type: 'USER'
    };
    
    setUserMarkers([...userMarkers, newMarker]);
  };
  
  const toggleAddMarkers = () => setIsAddingMarkers(!isAddingMarkers);
  
  const handleMarkerUpdate = (id, changes) => {
    setUserMarkers(userMarkers.map(m => 
      m.id === id ? {...m, ...changes} : m
    ));
  };
  
  const removeUserMarker = (id) => {
    setUserMarkers(userMarkers.filter(marker => marker.id !== id));
  };
  
  // Enable/disable heatmap
  const toggleHeatmap = () => {
    const map = mapRef.current;
    if (!map) return;
    
    if (heatmapEnabled) {
      if (heatmapLayerRef.current) {
        map.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }
    } else {
      const points = [
        ...CITIES.map(city => [...city.position, 0.8]),
        ...userMarkers.map(marker => [...marker.position, 0.5])
      ];
      
      heatmapLayerRef.current = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: {0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1: 'red'}
      }).addTo(map);
    }
    
    setHeatmapEnabled(!heatmapEnabled);
  };
  
  // Map mode control
  const MapModeControl = () => {
    const map = useMap();
    mapRef.current = map;
    
    useEffect(() => {
      const CustomControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function() {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control map-mode-control');
          
          // Add marker button
          const markerBtn = L.DomUtil.create('a', isAddingMarkers ? 'active' : '', container);
          markerBtn.href = '#';
          markerBtn.title = isAddingMarkers ? 'Cancel adding markers' : 'Add your own markers';
          markerBtn.innerHTML = '<span>📍</span>';
          
          // Heat map button
          const heatmapBtn = L.DomUtil.create('a', heatmapEnabled ? 'active' : '', container);
          heatmapBtn.href = '#';
          heatmapBtn.title = 'Toggle heatmap';
          heatmapBtn.innerHTML = '<span>🔥</span>';
          
          L.DomEvent.on(markerBtn, 'click', function(e) {
            L.DomEvent.stop(e);
            toggleAddMarkers();
            markerBtn.classList.toggle('active');
          });
          
          L.DomEvent.on(heatmapBtn, 'click', function(e) {
            L.DomEvent.stop(e);
            toggleHeatmap();
            heatmapBtn.classList.toggle('active');
          });
          
          return container;
        }
      });
      
      const control = new CustomControl();
      map.addControl(control);
      
      return () => map.removeControl(control);
    }, [map, isAddingMarkers, heatmapEnabled]);
    
    return null;
  };
  
  // Get tile layer based on selected style
  const getTileLayer = () => {
    const tileLayerProps = {
      streets: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      },
      satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      },
      dark: {
        url: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
      },
      topo: {
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
      },
      watercolor: {
        url: "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
    };
    
    return tileLayerProps[mapStyle] || tileLayerProps.streets;
  };
  
  return (
    <div className="map-page">
      {showCityInfo && selectedCity && (
        <CityInfoPanel 
          city={selectedCity} 
          onClose={() => setShowCityInfo(false)} 
        />
      )}
      
      <div className={`map-container ${showCityInfo ? 'with-panel' : ''}`}>
        <MapControls 
          isAddingMarkers={isAddingMarkers}
          toggleAddMarkers={toggleAddMarkers}
          mapStyle={mapStyle}
          setMapStyle={setMapStyle}
        />
        
        <MapContainer 
          center={center} 
          zoom={zoom} 
          className="leaflet-container"
          zoomControl={false}
        >
          <TileLayer {...getTileLayer()} />
          
          {/* City markers with circles */}
          {CITIES.map((city, index) => (
            <React.Fragment key={index}>
              <Marker 
                position={city.position} 
                icon={MARKER_ICONS[city.type]} 
                eventHandlers={{
                  click: () => handleCityClick(city)
                }}
              >
                <Popup>
                  <div className="custom-popup">
                    <h3>{city.name}</h3>
                    <p>{city.description}</p>
                    <button 
                      className="popup-btn"
                      onClick={() => handleCityClick(city)}
                    >
                      More Info
                    </button>
                  </div>
                </Popup>
              </Marker>
              
              {city.radius && (
                <Circle 
                  center={city.position}
                  radius={city.radius}
                  pathOptions={{
                    color: city.color,
                    fillColor: city.color,
                    fillOpacity: 0.1
                  }}
                />
              )}
            </React.Fragment>
          ))}
          
          {/* User's custom markers */}
          {userMarkers.map((marker) => (
            <Marker 
              key={marker.id}
              position={marker.position}
              draggable={true}
              icon={MARKER_ICONS.USER}
              eventHandlers={{
                dragend: (e) => handleMarkerUpdate(marker.id, {position: [e.target.getLatLng().lat, e.target.getLatLng().lng]})
              }}
            >
              <Popup>
                <div className="user-marker-popup">
                  <input 
                    type="text" 
                    value={marker.title}
                    onChange={(e) => handleMarkerUpdate(marker.id, {title: e.target.value})}
                    placeholder="Location name"
                  />
                  <textarea
                    value={marker.description}
                    onChange={(e) => handleMarkerUpdate(marker.id, {description: e.target.value})}
                    placeholder="Add notes about this location"
                  />
                  <button 
                    className="remove-marker-btn"
                    onClick={() => removeUserMarker(marker.id)}
                  >
                    Remove
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Map controls and features */}
          <GeocoderControl />
          <ZoomControl position="bottomright" />
          <WeatherDisplay />
          <ClickHandler onAddMarker={handleAddMarker} isAddingMarkers={isAddingMarkers} />
          <MapModeControl />
        </MapContainer>
        
        <div className="map-tooltip">
          <div className="tooltip-content">
            <h3>Interactive Map</h3>
            <p>Click on markers to explore the world!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;