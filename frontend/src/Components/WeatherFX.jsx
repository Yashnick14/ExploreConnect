// src/Components/WeatherFX.jsx
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

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
  forceEffect = null, // "rain" | "sun" (testing)
  debug = false,
  className = "",
  // Rain look
  rainDarken = 0.38,
  rainVignette = true,
  rainMist = true,
  // Sun beams (the only sunny effect now)
  sunBeamCount = 32,
  sunBeamIntensity = 1.25,
  sunBeamsAngle = -8, // degrees
  sunWarmWash = 0.12, // 0..1 background warmth
  // (kept for compatibility, but ignored unless you set sunShowCore=true)
  sunSize = 160,
  sunCornerInset = 24,
  sunShowCore = false, // default OFF: no sun disk, only beams
  // NEW: treat dry overcast as sunny
  sunOnOvercastIfDry = true,
  // NEW: timezone (keep "auto" or set "Asia/Colombo" to match widget)
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

        // Find the start index for "next hours"
        const now = new Date();
        let idx = times.findIndex((t) => new Date(t) >= now);
        if (idx < 0) idx = times.length - 1;
        const end = Math.min(
          idx + Math.max(1, lookaheadHours),
          times.length - 1
        );

        // Compute maxima in that window; resilient to missing probability values
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
        // Treat tiny noise as zero
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

        // 1) Immediate rain or imminent rain under overcast
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

        // 2) Clear / mostly clear → sun
        if (isSunnyCode(code)) {
          setEffect("sun");
          setTimeout(() => setEffect(null), duration);
          return;
        }

        // 3) Overcast but DRY soon → optionally show sun beams
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
        <SunBeamsOverlay
          className={className}
          beamCount={sunBeamCount}
          beamIntensity={sunBeamIntensity}
          angle={sunBeamsAngle}
          warmWash={sunWarmWash}
          // Core is hidden unless explicitly enabled:
          showCore={sunShowCore}
          coreSize={sunSize}
          coreInset={sunCornerInset}
        />
      )}
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

/* ---------- Sun BEAMS overlay (no sun disk by default) ---------- */
function SunBeamsOverlay({
  className,
  beamCount = 32,
  beamIntensity = 1.25,
  angle = -8,
  warmWash = 0.12,
  showCore = false,
  coreSize = 160,
  coreInset = 24,
}) {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const beams = useMemo(() => {
    const widthBase = 2.8 * beamIntensity;
    const widthVar = 2.2 * beamIntensity;
    const lenBase = 140 * beamIntensity;
    const lenVar = 140 * beamIntensity;
    const oMin = clamp(0.22 * beamIntensity, 0.18, 0.55);
    const oMax = clamp(0.46 * beamIntensity, 0.28, 0.7);

    return Array.from({ length: beamCount }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 1200;
      const speed = 4600 + Math.random() * 4200;
      const opacity = oMin + Math.random() * (oMax - oMin);
      const width = widthBase + Math.random() * widthVar;
      const height = lenBase + Math.random() * lenVar;
      return { i, left, delay, speed, opacity, width, height };
    });
  }, [beamCount, beamIntensity]);

  return (
    <div
      className={`fixed inset-0 z-[9999] pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* subtle warm wash over the page */}
      <div
        className="absolute inset-0"
        style={{ background: `rgba(255,249,219,${clamp(warmWash, 0, 0.25)})` }}
      />

      {/* drifting sunshine streaks only */}
      <div
        className="absolute inset-0"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        {beams.map((b) => (
          <span
            key={b.i}
            className="absolute"
            style={{
              left: `${b.left}vw`,
              top: "-20vh",
              width: `${b.width}px`,
              height: `${b.height}px`,
              borderRadius: 999,
              background:
                "linear-gradient(to bottom, rgba(255,255,240,0), rgba(255,255,230,0.95), rgba(255,255,240,0))",
              boxShadow:
                "0 0 18px rgba(255,235,150,0.55), 0 0 36px rgba(255,235,150,0.35)",
              opacity: b.opacity,
              filter: "blur(0.5px)",
              mixBlendMode: "screen",
              animation: `beamDrift ${b.speed}ms linear ${b.delay}ms infinite`,
            }}
          />
        ))}
      </div>

      {/* Optional: compact sun disk (hidden by default) */}
      {showCore && (
        <div
          className="absolute"
          style={{
            top: `-${coreInset}px`,
            right: `-${coreInset}px`,
            width: `${coreSize}px`,
            height: `${coreSize}px`,
          }}
        >
          <div className="relative w-full h-full">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 40% 40%, rgba(255,235,140,1), rgba(255,205,0,0.95) 60%, rgba(255,205,0,0.6) 78%, rgba(255,205,0,0) 100%)",
                boxShadow:
                  "0 0 22px rgba(255,210,0,0.6), 0 0 66px rgba(255,210,0,0.45)",
                animation: "sunPulse 1.6s ease-in-out infinite",
              }}
            />
            <span
              className="absolute inset-0 rounded-full"
              style={{
                border: "1px solid rgba(253,224,71,0.55)",
                animation: "ringBurst 1.9s ease-out infinite",
              }}
            />
            <span
              className="absolute inset-0 rounded-full"
              style={{
                border: "1px solid rgba(245,208,54,0.45)",
                animation: "ringBurst 2.6s ease-out .5s infinite",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- PropTypes ---------------- */

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
  sunBeamCount: PropTypes.number,
  sunBeamIntensity: PropTypes.number,
  sunBeamsAngle: PropTypes.number,
  sunWarmWash: PropTypes.number,
  sunSize: PropTypes.number,
  sunCornerInset: PropTypes.number,
  sunShowCore: PropTypes.bool,
  sunOnOvercastIfDry: PropTypes.bool,
  timezone: PropTypes.string,
};

RainOverlay.propTypes = {
  maxDrops: PropTypes.number.isRequired,
  isThunder: PropTypes.bool.isRequired,
  className: PropTypes.string,
  darken: PropTypes.number,
  vignette: PropTypes.bool,
  mist: PropTypes.bool,
};

SunBeamsOverlay.propTypes = {
  className: PropTypes.string,
  beamCount: PropTypes.number,
  beamIntensity: PropTypes.number,
  angle: PropTypes.number,
  warmWash: PropTypes.number,
  showCore: PropTypes.bool,
  coreSize: PropTypes.number,
  coreInset: PropTypes.number,
};
