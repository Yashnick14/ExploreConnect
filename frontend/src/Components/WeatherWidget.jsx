import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

// Simple mapping of weather codes → label + emoji
const codeMap = {
  0: ["Clear", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"],
  61: ["Light rain", "🌧️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  80: ["Showers", "🌦️"],
  81: ["Showers", "🌦️"],
  82: ["Heavy showers", "🌧️"],
  71: ["Snow", "🌨️"],
  73: ["Snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunder + hail", "⛈️"],
  99: ["Thunder + hail", "⛈️"],
};

export default function WeatherWidget({
  lat,
  lng,
  title = "Weather",
  timezone = "Asia/Colombo",
  className = "",
}) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lng);
    url.searchParams.set(
      "current",
      "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,precipitation"
    );
    url.searchParams.set(
      "daily",
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset"
    );
    url.searchParams.set("timezone", timezone);

    setState({ loading: true, error: null, data: null });
    fetch(url.toString())
      .then((r) => r.json())
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((e) =>
        setState({
          loading: false,
          error: e?.message || "Failed to load weather",
          data: null,
        })
      );
  }, [lat, lng, timezone]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const { loading, error, data } = state;

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-md shadow-sm text-gray-900 ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {!loading && data?.current?.time && (
          <span className="text-xs text-gray-700">
            {new Date(data.current.time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* States */}
      {loading && (
        <div className="p-4 text-sm text-gray-800">Loading weather…</div>
      )}
      {error && <div className="p-4 text-sm text-red-600">Error: {error}</div>}

      {/* Content */}
      {!loading && !error && data?.current && (
        <div className="p-4">
          {/* Current weather */}
          <div className="flex items-center gap-4">
            <div className="text-4xl" translate="no">
              {(codeMap[data.current.weather_code] || ["", "🌡️"])[1]}
            </div>
            <div>
              <div className="text-2xl font-bold" translate="no">
                {Math.round(data.current.temperature_2m)}°C
              </div>
              <div className="text-xs text-gray-800">
                {(codeMap[data.current.weather_code] || ["—"])[0]} • Feels{" "}
                {Math.round(data.current.apparent_temperature)}°C • Humidity{" "}
                {data.current.relative_humidity_2m}% • Wind{" "}
                {Math.round(data.current.wind_speed_10m)} km/h
              </div>
            </div>
          </div>

          {/* 5-day forecast */}
          {data.daily && (
            <div className="mt-4 grid grid-cols-5 gap-2 text-center">
              {data.daily.time.slice(0, 5).map((d, i) => {
                const [label, icon] = codeMap[data.daily.weather_code[i]] || [
                  "—",
                  "🌡️",
                ];
                const tMax = Math.round(data.daily.temperature_2m_max[i]);
                const tMin = Math.round(data.daily.temperature_2m_min[i]);
                const day = new Date(d).toLocaleDateString(undefined, {
                  weekday: "short",
                });
                return (
                  <div
                    key={d}
                    className="rounded-lg border border-gray-200 p-2 bg-white/70"
                  >
                    <div className="text-xs text-gray-800">{day}</div>
                    <div className="text-xl" translate="no">
                      {icon}
                    </div>
                    <div className="forecast-card">
                      <span className="forecast-text text-gray-900 font-medium">
                        {label}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {tMax}° / {tMin}°
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

WeatherWidget.propTypes = {
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
  title: PropTypes.string,
  timezone: PropTypes.string,
  className: PropTypes.string,
};
