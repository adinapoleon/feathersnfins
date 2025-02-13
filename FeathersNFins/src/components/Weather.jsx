import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog, Droplets } from 'lucide-react';

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Houston coordinates
        const API_KEY = '618510cecd8d1a5133a81f0b03231098';
        const lat = '29.7604'; // Houston latitude
        const lon = '-95.3698'; // Houston longitude
        
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
        );
        
        if (!response.ok) throw new Error('Weather data fetch failed');
        
        const data = await response.json();
        // Map the data from 2.5 endpoint structure
        setWeather({
          temp: data.main.temp,
          weather: [
            {
              id: data.weather[0].id,
              main: data.weather[0].main
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Fetch weather every 30 minutes
    const interval = setInterval(fetchWeather, 1800000);
    
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (weatherCode) => {
    if (!weatherCode) return <Sun size={24} />;
    
    const code = weatherCode.toString();
    
    if (code.startsWith('2')) return <CloudLightning size={24} />; // Thunderstorm
    if (code.startsWith('3')) return <Droplets size={24} />; // Drizzle
    if (code.startsWith('5')) return <CloudRain size={24} />; // Rain
    if (code.startsWith('6')) return <CloudSnow size={24} />; // Snow
    if (code.startsWith('7')) return <CloudFog size={24} />; // Atmosphere (fog, mist, etc)
    if (code === '800') return <Sun size={24} />; // Clear sky
    return <Cloud size={24} />; // Clouds
  };

  if (loading) return <div className="weather-widget">Loading...</div>;

  if (!weather) return null;

  return (
    <div className="weather-widget">
      <div className="weather-icon">
        {weather.weather && weather.weather[0] && 
          getWeatherIcon(weather.weather[0].id)}
      </div>
      <div className="weather-info">
        <span className="temperature">
          {Math.round(weather.temp)}°F
        </span>
        <span className="weather-description">
          {weather.weather && weather.weather[0] && 
            weather.weather[0].main}
        </span>
      </div>
    </div>
  );
};

export default Weather;