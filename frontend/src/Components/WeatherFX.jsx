// src/Components/WeatherFX.jsx
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { FiSun, FiCloudRain } from "react-icons/fi";

/* ---- WMO helpers ---- */
const isRainyCode = (c) =>
  (c >= 51 && c <= 67) || (c >= 80 && c <= 82) || (c >= 95 && c <= 99);
const isSunnyCode = (c) => c === 0 || c === 1 || c === 2;
const isOvercast = (c) => c === 3;

export default function WeatherFX({
  lat,
  lng,
  duration = 3500,
  maxDrops = 110,
  lookaheadHours = 3,
  probThreshold = 50,
  amountThreshold = 0.1,
  forceEffect = null,
  debug = false,
  className = "",
  rainDarken = 0.38,
  rainVignette = true,
  rainMist = true,
  sunWarmWash = 0.12,
  sunOnOvercastIfDry = true,
  timezone = "auto",
}) {
  const [effect, setEffect] = useState(null); // "rain" | "sun" | null
  const [isThunder, setIsThunder] = useState(false);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (reducedMotion) return;

    if (forceEffect) {
      setEffect(forceEffect);
      const t = setTimeout(() => setEffect(null), duration);
      return () => clearTimeout(t);
    }

    const controller = new AbortController();
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lng);
    url.searchParams.set(
      "current",
      "weather_code,precipitation,temperature_2m"
    );
    url.searchParams.set(
      "hourly",
      "precipitation,precipitation_probability,weather_code"
    );
    url.searchParams.set("timezone", timezone);
    url.searchParams.set("forecast_days", "1");

    fetch(url.toString(), { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const code = Number(data?.current?.weather_code ?? NaN);
        const precipNow = Number(data?.current?.precipitation ?? 0);
        if (Number.isNaN(code)) return;

        const times = data?.hourly?.time || [];
        const probs = data?.hourly?.precipitation_probability || [];
        const amnts = data?.hourly?.precipitation || [];
        const wcodes = data?.hourly?.weather_code || [];

        const rainyNow = isRainyCode(code) || precipNow > 0.05;
        const thunderNow = code >= 95 && code <= 99;

        const now = new Date();
        let idx = times.findIndex((t) => new Date(t) >= now);
        if (idx < 0) idx = times.length - 1;
        const end = Math.min(
          idx + Math.max(1, lookaheadHours),
          times.length - 1
        );

        let maxProb = 0,
          maxAmt = 0,
          rainCodeSeen = false;
        for (let i = idx; i <= end; i++) {
          const p = Number(probs?.[i] ?? 0) || 0;
          const a = Number(amnts?.[i] ?? 0) || 0;
          const wc = Number(wcodes?.[i] ?? NaN);
          if (p > maxProb) maxProb = p;
          if (a > maxAmt) maxAmt = a;
          if (isRainyCode(wc)) rainCodeSeen = true;
        }
        if (maxAmt < 0.01) maxAmt = 0;

        if (debug)
          console.log("[WeatherFX]", {
            code,
            precipNow,
            idx,
            end,
            maxProb,
            maxAmt,
            rainCodeSeen,
          });

        if (
          rainyNow ||
          (isOvercast(code) &&
            (rainCodeSeen ||
              maxProb >= probThreshold ||
              maxAmt >= amountThreshold))
        ) {
          setIsThunder(thunderNow);
          setEffect("rain");
          setTimeout(() => setEffect(null), duration);
          return;
        }

        if (isSunnyCode(code)) {
          setEffect("sun");
          setTimeout(() => setEffect(null), duration);
          return;
        }

        if (
          isOvercast(code) &&
          sunOnOvercastIfDry &&
          maxProb < probThreshold &&
          maxAmt < amountThreshold
        ) {
          setEffect("sun");
          setTimeout(() => setEffect(null), duration);
          return;
        }

        setEffect(null);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [
    lat,
    lng,
    duration,
    lookaheadHours,
    probThreshold,
    amountThreshold,
    reducedMotion,
    forceEffect,
    debug,
    timezone,
    sunOnOvercastIfDry,
  ]);

  if (!effect) return null;

  return (
    <>
      {/* Overlays */}
      {effect === "rain" ? (
        <RainOverlay
          maxDrops={maxDrops}
          isThunder={isThunder}
          className={className}
          darken={rainDarken}
          vignette={rainVignette}
          mist={rainMist}
        />
      ) : (
        // Sun → only a warm wash, no beams
        <div
          className={`fixed inset-0 z-[9999] pointer-events-none ${className}`}
          aria-hidden="true"
          style={{ background: `rgba(255,249,219,${sunWarmWash})` }}
        />
      )}

      {/* Centered fade banner */}
      <div className="fixed inset-0 flex justify-center items-center pointer-events-none z-[10000]">
        <div className="flex items-center gap-3 bg-black/70 text-white text-sm px-6 py-3 rounded-full animate-fadeBanner shadow-lg">
          {effect === "sun" ? (
            <>
              <FiSun className="text-yellow-400 text-2xl animate-rotateSun" />
              <span>
                Sunny skies expected for the next {lookaheadHours} hours
              </span>
            </>
          ) : (
            <>
              <FiCloudRain className="text-blue-300 text-2xl animate-bounce" />
              <span>Rain expected in the next {lookaheadHours} hours</span>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeBanner {
          0% { opacity: 0; transform: scale(0.95); }
          15% { opacity: 1; transform: scale(1); }
          85% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); }
        }
        .animate-fadeBanner {
          animation: fadeBanner ${duration}ms ease-in-out forwards;
        }
        @keyframes rotateSun {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-rotateSun {
          animation: rotateSun 4s linear infinite;
        }
      `}</style>
    </>
  );
}

/* ---------- Rain overlay ---------- */
function RainOverlay({
  maxDrops,
  isThunder,
  className,
  darken = 0.38,
  vignette = true,
  mist = true,
}) {
  const drops = useMemo(
    () =>
      Array.from({ length: maxDrops }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 800;
        const speed = 900 + Math.random() * 900;
        const opacity = 0.35 + Math.random() * 0.45;
        const width = 1.1 + Math.random() * 1.4;
        const height = 14 + Math.random() * 26;
        return { i, left, delay, speed, opacity, width, height };
      }),
    [maxDrops]
  );

  const veil = `rgba(0,0,0,${Math.min(Math.max(darken, 0), 0.9)})`;

  return (
    <div
      className={`fixed inset-0 z-[9999] pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0" style={{ background: veil }} />
      {vignette && (
        <div
          className="absolute inset-0"
          style={{
            boxShadow:
              "inset 0 0 200px rgba(0,0,0,0.35), inset 0 0 420px rgba(0,0,0,0.25)",
          }}
        />
      )}
      <div className="absolute inset-0" style={{ transform: "rotate(10deg)" }}>
        {drops.map((d) => (
          <span
            key={d.i}
            className="absolute"
            style={{
              left: `${d.left}vw`,
              top: "-12vh",
              width: `${d.width}px`,
              height: `${d.height}px`,
              borderRadius: "1px",
              background: "rgba(255,255,255,0.95)",
              opacity: d.opacity,
              filter: "blur(0.2px)",
              animation: `rainFall ${d.speed}ms linear ${d.delay}ms infinite`,
            }}
          />
        ))}
      </div>
      {mist && (
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "38vh",
            background:
              "linear-gradient(to top, rgba(255,255,255,0.18), rgba(255,255,255,0.08) 35%, rgba(255,255,255,0) 70%)",
            filter: "blur(2px)",
          }}
        />
      )}
      {isThunder && (
        <div
          className="absolute inset-0 bg-white"
          style={{ animation: "lightning 2.2s ease-in-out infinite" }}
        />
      )}
    </div>
  );
}

RainOverlay.propTypes = {
  maxDrops: PropTypes.number.isRequired,
  isThunder: PropTypes.bool.isRequired,
  className: PropTypes.string,
  darken: PropTypes.number,
  vignette: PropTypes.bool,
  mist: PropTypes.bool,
};
WeatherFX.propTypes = {
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
  duration: PropTypes.number,
  maxDrops: PropTypes.number,
  lookaheadHours: PropTypes.number,
  probThreshold: PropTypes.number,
  amountThreshold: PropTypes.number,
  forceEffect: PropTypes.oneOf(["rain", "sun", null]),
  debug: PropTypes.bool,
  className: PropTypes.string,
  rainDarken: PropTypes.number,
  rainVignette: PropTypes.bool,
  rainMist: PropTypes.bool,
  sunWarmWash: PropTypes.number,
  sunOnOvercastIfDry: PropTypes.bool,
  timezone: PropTypes.string,
};
