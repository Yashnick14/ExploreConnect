import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const GoogleTranslate = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(() => localStorage.getItem("googlang") || "en");

  const languages = useMemo(
    () => [
      { code: "en", label: "English", flag: "🇬🇧", cc: "GB" },
      { code: "ta", label: "தமிழ்", flag: "🇮🇳", cc: "IN" },
      { code: "si", label: "සිංහල", flag: "🇱🇰", cc: "LK" },
    ],
    []
  );

  const dispatchNativeChange = (el) => {
    const evt = document.createEvent("HTMLEvents");
    evt.initEvent("change", true, true);
    el.dispatchEvent(evt);
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const setGoogTransCookie = (lang) => {
    const value = `/auto/${lang}`;
    document.cookie = `googtrans=${value};path=/`;
    const host = window.location.hostname;
    const parts = host.split(".");
    if (parts.length >= 2 && !/^(localhost|127\.0\.0\.1)$/.test(host)) {
      const base = `.${parts.slice(-2).join(".")}`;
      document.cookie = `googtrans=${value};path=/;domain=${base}`;
    }
  };

  // Load & init widget
  useEffect(() => {
    const initWidget = () => {
      if (window.google?.translate?.TranslateElement) {
        const host = document.getElementById("google_translate_element");
        if (host && !host.dataset.inited) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,ta,si",
              autoDisplay: false,
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            "google_translate_element"
          );
          host.dataset.inited = "1";
        }
      }
    };

    window.googleTranslateElementInit = initWidget;

    if (document.getElementById("google-translate-script")) {
      initWidget();
      return;
    }

    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  // Persist & apply on route changes
  useEffect(() => {
    const saveAndApply = () => {
      const combo = document.querySelector(".goog-te-combo");
      if (!combo) return;

      const saved = localStorage.getItem("googlang") || "en";
      if (saved && combo.value !== saved) {
        combo.value = saved;
        dispatchNativeChange(combo);
      }
      setCurrent(saved);

      if (!combo.__bound) {
        combo.addEventListener("change", (e) => {
          const val = e.target.value || "en";
          localStorage.setItem("googlang", val);
          setCurrent(val);
          setGoogTransCookie(val);
        });
        combo.__bound = true;
      }
    };

    const obs = new MutationObserver(saveAndApply);
    obs.observe(document.body, { childList: true, subtree: true });
    saveAndApply();

    return () => obs.disconnect();
  }, [location.pathname]);

  // Apply language & reload
  const applyLanguage = (code) => {
    localStorage.setItem("googlang", code);
    setCurrent(code);
    setGoogTransCookie(code);

    const combo = document.querySelector(".goog-te-combo");
    if (combo) {
      combo.value = code;
      dispatchNativeChange(combo);
    }

    window.location.reload();
  };

  // ===== Banner Killer =====
    useEffect(() => {
    // Highest-priority runtime CSS (works even if global CSS hasn’t loaded yet)
    const style = document.createElement("style");
    style.textContent = `
        iframe.goog-te-banner-frame { display: none !important; }
        .goog-te-banner-frame { display: none !important; }
        .skiptranslate { display: none !important; }  /* container Google adds at top */
        body { top: 0 !important; }                   /* remove the push-down offset */
    `;
    document.head.appendChild(style);

    const killBanner = () => {
        // Remove the iframe if it already exists
        const iframe = document.querySelector("iframe.goog-te-banner-frame");
        if (iframe) iframe.remove();

        // Extra guard: hide any remaining banner container
        const banner = document.querySelector(".goog-te-banner-frame");
        if (banner) banner.remove();

        // Google sometimes wraps in a .skiptranslate at top of body
        const skip = document.querySelector(".skiptranslate");
        if (skip) (skip.style.display = "none");

        // Ensure no top offset remains
        document.body.style.top = "0px";
    };

    // run now and on further DOM injections
    killBanner();
    const mo = new MutationObserver(killBanner);
    mo.observe(document.documentElement, { childList: true, subtree: true });

    return () => {
        mo.disconnect();
        // keep the style tag so future navigations remain clean; remove if you prefer
        // document.head.removeChild(style);
    };
    }, []);


  const currentLang = languages.find((l) => l.code === current) || languages[0];

  return (
    <>
      {/* Keep Google's widget mounted (hidden) */}
      <div id="google_translate_element" className="sr-only" aria-hidden="true" />

      {/* Floating control */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative">
          {/* Toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-2 rounded-full px-3 py-2 shadow-lg border
                       bg-white/85 backdrop-blur border-slate-200 hover:bg-white transition
                       dark:bg-slate-900/80 dark:border-slate-700 dark:hover:bg-slate-900"
          >
            <span className="text-lg leading-none">{currentLang.flag}</span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {currentLang.label}
            </span>
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 text-slate-600 dark:text-slate-300 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            >
              <path fill="currentColor" d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          {/* Drop-up */}
          {open && (
            <div
              role="menu"
              className="absolute right-0 bottom-full mb-2 w-64 rounded-2xl shadow-xl border overflow-hidden
                         bg-white/95 border-slate-200 dark:bg-slate-900/95 dark:border-slate-700 z-50"
            >
              {languages.map((lng) => (
                <button
                  type="button"
                  key={lng.code}
                  onClick={() => applyLanguage(lng.code)}
                  role="menuitem"
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition
                              hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800
                              ${current === lng.code ? "bg-slate-50 dark:bg-slate-800" : ""}`}
                >
                  <span className="text-lg leading-none">{lng.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {lng.label}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {lng.cc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GoogleTranslate;
