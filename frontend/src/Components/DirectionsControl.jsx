// src/Components/DirectionsControl.jsx
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

export default function DirectionsControl({ origin, destination }) {
  const map = useMap();
  const ref = useRef(null);

  useEffect(() => {
    if (!map || !origin || !destination) return;

    if (ref.current) {
      map.removeControl(ref.current);
      ref.current = null;
    }

    const ctrl = L.Routing.control({
      waypoints: [
        L.latLng(origin.lat, origin.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: true,
      lineOptions: { styles: [{ color: "#2563eb", weight: 6, opacity: 0.85 }] },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
    }).addTo(map);

    ref.current = ctrl;

    return () => {
      if (ref.current) map.removeControl(ref.current);
    };
  }, [map, origin, destination]);

  return null;
}

DirectionsControl.propTypes = {
  origin: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  destination: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
};
