"use client";

import { useEffect, useRef, useState } from "react";

const MAX_COINS = 200;
const COINS_STORAGE_KEY = "peeboard-coins";
const MONTH_STORAGE_KEY = "peeboard-month";
const DOT_STEP = 10;
const DOT_STOPS = Array.from(
  { length: MAX_COINS / DOT_STEP },
  (_, index) => ({
    coins: (index + 1) * DOT_STEP,
    position: 0.05 + index * (0.9 / (MAX_COINS / DOT_STEP - 1)),
  }),
);

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthOffset = 0) {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + monthOffset);
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function AnimatedDigit({ value }: { value: string }) {
  const currentRef = useRef(value);
  const animationIdRef = useRef(0);
  const [current, setCurrent] = useState(value);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [animationId, setAnimationId] = useState(0);

  useEffect(() => {
    if (value === currentRef.current) return;

    const previous = currentRef.current;
    currentRef.current = value;
    animationIdRef.current += 1;
    setOutgoing(previous);
    setCurrent(value);
    setIsChanging(true);
    setAnimationId(animationIdRef.current);

    const timer = window.setTimeout(() => {
      setOutgoing(null);
      setIsChanging(false);
    }, 420);

    return () => window.clearTimeout(timer);
  }, [value]);

  return (
    <span className="count-digit" aria-hidden="true">
      {outgoing !== null && (
        <span key={`old-${animationId}`} className="digit-old">
          {outgoing}
        </span>
      )}
      <span
        key={`new-${animationId}`}
        className={isChanging ? "digit-new is-changing" : "digit-new"}
      >
        {current}
      </span>
    </span>
  );
}

export default function Home() {
  const [coins, setCoins] = useState(0);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const currentMonth = getCurrentMonthKey();
    const savedMonth = window.localStorage.getItem(MONTH_STORAGE_KEY);
    const savedCoins = Number(window.localStorage.getItem(COINS_STORAGE_KEY));

    if (savedMonth !== currentMonth) {
      window.localStorage.setItem(MONTH_STORAGE_KEY, currentMonth);
      window.localStorage.setItem(COINS_STORAGE_KEY, "0");
      setCoins(0);
    } else if (Number.isFinite(savedCoins)) {
      setCoins(Math.min(MAX_COINS, Math.max(0, savedCoins)));
    }

    setStorageReady(true);
  }, []);

  useEffect(() => {
    const preventSafariZoom = (event: Event) => event.preventDefault();
    const gestureOptions = { passive: false } as AddEventListenerOptions;

    document.addEventListener("gesturestart", preventSafariZoom, gestureOptions);
    document.addEventListener("gesturechange", preventSafariZoom, gestureOptions);
    document.addEventListener("gestureend", preventSafariZoom, gestureOptions);
    document.addEventListener("dblclick", preventSafariZoom, gestureOptions);

    return () => {
      document.removeEventListener("gesturestart", preventSafariZoom, gestureOptions);
      document.removeEventListener("gesturechange", preventSafariZoom, gestureOptions);
      document.removeEventListener("gestureend", preventSafariZoom, gestureOptions);
      document.removeEventListener("dblclick", preventSafariZoom, gestureOptions);
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    window.localStorage.setItem(COINS_STORAGE_KEY, String(coins));
    window.localStorage.setItem(MONTH_STORAGE_KEY, getCurrentMonthKey());
  }, [coins, storageReady]);

  const progress = Math.min(coins / MAX_COINS, 1);
  const remaining = MAX_COINS - coins;
  const nextMonthLabel = getMonthLabel(1);
  const fillOffset = 48 - progress * 56;
  const markerOffset = 28 - progress * 56;
  const fillWidth = `calc(${progress * 100}% ${fillOffset >= 0 ? "+" : "-"} ${Math.abs(fillOffset)}px)`;
  const markerPosition = `calc(${progress * 100}% ${markerOffset >= 0 ? "+" : "-"} ${Math.abs(markerOffset)}px)`;

  function addCoin() {
    if (coins >= MAX_COINS) return;
    setCoins((current) => Math.min(MAX_COINS, current + 1));
  }

  function removeCoin() {
    if (coins <= 0) return;
    setCoins((current) => Math.max(0, current - 1));
  }

  return (
    <main className="app-shell">
      <div className="glow glow-one" />
      <div className="glow glow-two" />

      <section className="hero" aria-label="Bảng tiến độ nhận xu">
        <div className="topbar">
          <div className="brand-mark" aria-label="PeeBoard">
            <span>PeeB</span>
            <img src="/logo.svg?v=4" alt="" draggable={false} />
            <span>ard</span>
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-copy">
            <h1 className="count-value" aria-label={`${coins}`}>
              {String(coins).split("").map((digit, index, digits) => {
                const place = digits.length - index - 1;
                return <AnimatedDigit key={place} value={digit} />;
              })}
            </h1>
            <span className="remaining-pill">
              {remaining === 0
                ? `Reset lượt mới 00:00 01/${nextMonthLabel}`
                : `Còn ${remaining} lượt nhận xu livestream`}
            </span>
          </div>

          <div className="progress-meter" aria-label={`Đã hoàn thành ${Math.round(progress * 100)} phần trăm`}>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: fillWidth }} />
              {DOT_STOPS.map((stop) => (
                <span
                  key={stop.coins}
                  className="progress-dot"
                  style={{
                    left: `calc(${stop.position * 100}% + ${6 - stop.position * 12}px)`,
                    opacity: coins >= stop.coins ? 0.82 : 0,
                  }}
                />
              ))}
            </div>
            <div className="meter-marker" style={{ left: markerPosition, top: "50%" }}>
              <span className="marker-face">
                <img src="/logo.svg?v=4" alt="" draggable={false} />
              </span>
            </div>
          </div>

          <section className="action-card">
            <button className="remove-button" onClick={removeCoin} type="button" aria-label="Giảm 1 lượt nhận">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2v14" />
                <path d="m19 9-7 7-7-7" />
                <circle cx="12" cy="21" r="1" />
              </svg>
            </button>
            <button className="add-button" onClick={addCoin} type="button" disabled={coins >= MAX_COINS}>
              <span>{coins >= MAX_COINS ? "Hết lượt nhận" : "+1 lượt nhận"}</span>
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}
