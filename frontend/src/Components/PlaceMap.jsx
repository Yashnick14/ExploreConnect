// src/Components/PlaceMap.jsx
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import DirectionsControl from "@/Components/DirectionsControl";
import { toast } from "react-hot-toast";
import "leaflet/dist/leaflet.css";

try {
  // Fix marker assets for Vite
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  });
} catch {}

function CenterOn({ position, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], zoom, { duration: 0.7 });
  }, [map, position, zoom]);
  return null;
}

function ClickToSetOrigin({ enabled, onPick }) {
  useMapEvents({
    click: (e) => {
      if (!enabled) return;
      const { lat, lng } = e.latlng;
      onPick({ lat, lng });
    },
  });
  return null;
}

export default function PlaceMap({
  dest,                // { lat, lng }
  name,
  height = 300,
  zoom = 13,
  className = "",
  scrollWheelZoom = false,
}) {
  if (!dest || Number.isNaN(+dest.lat) || Number.isNaN(+dest.lng)) return null;

  const [origin, setOrigin] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [gettingLoc, setGettingLoc] = useState(false);
  const [pickMode, setPickMode] = useState(false);

  const watchRef = useRef(null);
  const stopTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    };
  }, []);

  const errorToMessage = (err) => {
    if (!err) return "Unable to get your location";
    if (err.code === 1) return "Location permission denied. Allow it in browser settings.";
    if (err.code === 2) return "Position unavailable. Turn on GPS/Wi-Fi and try again.";
    if (err.code === 3) return "Timed out getting location. Try again near a window/outdoors.";
    return err.message || "Unable to get your location";
  };

  const getPosition = (opts) =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, opts)
    );

  const useMyLocation = async () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported in this browser");
      return;
    }

    try {
      if (navigator.permissions?.query) {
        const st = await navigator.permissions.query({ name: "geolocation" });
        if (st.state === "denied") {
          toast.error("Location is blocked. Enable it in site settings.");
          return;
        }
      }
    } catch {}

    setGettingLoc(true);
    setAccuracy(null);

    // Initial non-cached fix
    try {
      const pos = await getPosition({
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      });
      const { latitude, longitude, accuracy: acc } = pos.coords;
      setOrigin({ lat: latitude, lng: longitude });
      setAccuracy(Math.round(acc || 0));
      toast.success("Using your current location");
    } catch (err) {
      setGettingLoc(false);
      toast.error(errorToMessage(err));
      return;
    }

    // Refine with watchPosition
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }

    const GOOD_ENOUGH = 50;

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
        setOrigin({ lat: latitude, lng: longitude });
        if (acc != null) {
          const a = Math.round(acc);
          setAccuracy(a);
          if (a <= GOOD_ENOUGH) {
            if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
            watchRef.current = null;
            if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
            stopTimerRef.current = null;
            setGettingLoc(false);
          }
        }
      },
      (err) => {
        if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
        if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
        setGettingLoc(false);
        if (!origin) toast.error(errorToMessage(err));
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );

    // Hard stop after 15s
    stopTimerRef.current = setTimeout(() => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
      setGettingLoc(false);
    }, 15000);
  };

  const clearDirections = () => {
    if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = null;
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
    setOrigin(null);
    setAccuracy(null);
    setPickMode(false);
  };

  const startPick = () => {
    setPickMode(true);
    toast("Click on the map to set your start point.");
  };
  const onPicked = (pt) => {
    setOrigin(pt);
    setPickMode(false);
    setAccuracy(null);
  };

  return (
    <div className={className}>

      <MapContainer
        center={[dest.lat, dest.lng]}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        style={{ height: typeof height === "number" ? `${height}px` : height, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickToSetOrigin enabled={pickMode} onPick={onPicked} />

        {/* Destination marker */}
        <Marker position={[dest.lat, dest.lng]}>
          <Popup>{name}</Popup>
        </Marker>

        {/* Route + origin marker when available */}
        {origin && (
          <>
            <CenterOn position={origin} zoom={14} />
            <Marker position={[origin.lat, origin.lng]}>
              <Popup>
                Your location {accuracy ? <span>(±{accuracy} m)</span> : null}
              </Popup>
            </Marker>
            <DirectionsControl origin={origin} destination={dest} />
          </>
        )}
      </MapContainer>

      {/* BELOW THE MAP — right aligned buttons */}
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: small status text */}
        <div className="text-xs text-gray-600">
          {pickMode && <span className="text-blue-700">Click the map to set your start point.</span>}
          {!pickMode && origin && accuracy != null && (
            <>Current location accuracy: <span className="font-medium">±{accuracy} m</span></>
          )}
        </div>

        {/* Right side: button group (aligned to the right) */}
        <div className="flex justify-end gap-2">
          <button
            onClick={useMyLocation}
            className="text-sm px-3 py-1.5 rounded-md bg-black text-white hover:bg-gray-900 disabled:opacity-60"
            disabled={gettingLoc}
            title="Draw directions from your current location"
          >
            {gettingLoc ? "Getting location..." : "Get directions"}
          </button>
          <button
            onClick={startPick}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
            title="Manually pick a start point on the map"
          >
            Pick start on map
          </button>
          {origin && (
            <button
              onClick={clearDirections}
              className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
              title="Clear directions"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
