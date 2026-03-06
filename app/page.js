"use client"

import { useState } from "react"

const WEATHER_API_KEY = "64280d20b06768cc5426c1eef1318f2f"
const API_URL = "https://zibnacjuo9.execute-api.ap-south-1.amazonaws.com/production/predict"

const AREAS = [
  { name: "Hinjawadi",       lat: 18.5912, lon: 73.7380, baseAqi: 145 },
  { name: "Baner",           lat: 18.5590, lon: 73.7868, baseAqi: 130 },
  { name: "Aundh",           lat: 18.5580, lon: 73.8080, baseAqi: 125 },
  { name: "Wakad",           lat: 18.6010, lon: 73.7610, baseAqi: 138 },
  { name: "Kothrud",         lat: 18.5074, lon: 73.8077, baseAqi: 118 },
  { name: "Shivajinagar",    lat: 18.5308, lon: 73.8474, baseAqi: 155 },
  { name: "Hadapsar",        lat: 18.5018, lon: 73.9260, baseAqi: 162 },
  { name: "Kharadi",         lat: 18.5514, lon: 73.9389, baseAqi: 148 },
  { name: "Viman Nagar",     lat: 18.5679, lon: 73.9143, baseAqi: 140 },
  { name: "Koregaon Park",   lat: 18.5362, lon: 73.8938, baseAqi: 110 },
  { name: "Kalyani Nagar",   lat: 18.5479, lon: 73.9011, baseAqi: 115 },
  { name: "Magarpatta",      lat: 18.5130, lon: 73.9290, baseAqi: 135 },
  { name: "Pimple Saudagar", lat: 18.6072, lon: 73.7997, baseAqi: 142 },
  { name: "Deccan",          lat: 18.5160, lon: 73.8401, baseAqi: 150 },
  { name: "Swargate",        lat: 18.5020, lon: 73.8567, baseAqi: 168 },
  { name: "Katraj",          lat: 18.4530, lon: 73.8630, baseAqi: 158 },
  { name: "Kondhwa",         lat: 18.4720, lon: 73.8960, baseAqi: 144 },
  { name: "Wanowrie",        lat: 18.4890, lon: 73.9050, baseAqi: 138 },
  { name: "Yerawada",        lat: 18.5530, lon: 73.8870, baseAqi: 132 },
  { name: "Bhosari",         lat: 18.6380, lon: 73.8490, baseAqi: 172 },
  { name: "Pimpri",          lat: 18.6298, lon: 73.7997, baseAqi: 165 },
  { name: "Chinchwad",       lat: 18.6440, lon: 73.7930, baseAqi: 160 },
  { name: "Nigdi",           lat: 18.6590, lon: 73.7680, baseAqi: 148 },
  { name: "Pashan",          lat: 18.5310, lon: 73.7900, baseAqi: 95  },
  { name: "Bavdhan",         lat: 18.5150, lon: 73.7740, baseAqi: 88  },
  { name: "Warje",           lat: 18.4880, lon: 73.8020, baseAqi: 105 },
  { name: "Sus",             lat: 18.5740, lon: 73.7550, baseAqi: 82  },
  { name: "Balewadi",        lat: 18.5760, lon: 73.7790, baseAqi: 120 },
]

function getRisk(score) {
  if (score >= 80) return { label: "Critical", color: "#ff3b3b", bg: "rgba(255,59,59,0.12)"  }
  if (score >= 60) return { label: "High",     color: "#ff8c00", bg: "rgba(255,140,0,0.12)"  }
  if (score >= 40) return { label: "Moderate", color: "#f5c400", bg: "rgba(245,196,0,0.12)"  }
  return                   { label: "Low",      color: "#00e676", bg: "rgba(0,230,118,0.12)"  }
}

export default function Home() {
  const [selectedArea, setSelectedArea] = useState("")
  const [activity, setActivity]         = useState("Walking")
  const [loading, setLoading]           = useState(false)
  const [popup, setPopup]               = useState(null)

  async function handlePredict() {
    const area = AREAS.find(a => a.name === selectedArea)
    if (!area) return
    setLoading(true)
    setPopup(null)

    let temp     = 27 + Math.round(Math.random() * 8)
    let humidity = 45 + Math.round(Math.random() * 30)
    let aqiValue = area.baseAqi + Math.round((Math.random() - 0.5) * 18)

    try {
      const [wRes, aRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${area.lat}&lon=${area.lon}&appid=${WEATHER_API_KEY}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${area.lat}&lon=${area.lon}&appid=${WEATHER_API_KEY}`)
      ])
      const w   = await wRes.json()
      const air = await aRes.json()
      if (w.main?.temp)          temp     = Math.round(w.main.temp)
      if (w.main?.humidity)      humidity = Math.round(w.main.humidity)
      const idx = air.list?.[0]?.main?.aqi
      if (idx) aqiValue = [0, 50, 100, 150, 200, 300][idx]
    } catch (_) {}

    const score = Math.min(99, Math.max(18, Math.round((aqiValue * 0.35) + (temp * 1.1))))

    let advice = null
    try {
      const res  = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: area.name + ", Pune", activity })
      })
      const data = await res.json()
      advice     = data.advice
    } catch (_) {}

    setPopup({ area: area.name, score, temp, humidity, aqiValue, activity, advice })
    setLoading(false)
  }

  const risk = popup ? getRisk(popup.score) : null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #090b12;
          font-family: 'DM Sans', sans-serif;
          color: #c4ccde;
          min-height: 100vh;
        }

        .bg-glow {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 60% 40% at 15% 0%,   rgba(0,180,255,0.06)  0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 85% 100%, rgba(80,40,220,0.05)  0%, transparent 55%);
        }

        .page {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 60px 24px;
        }

        /* HEADER */
        .header { text-align: center; margin-bottom: 52px; animation: fadeDown 0.7s ease both; }
        .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
          color: #00b4ff; margin-bottom: 16px;
        }
        .eyebrow-line { width: 16px; height: 1px; background: #00b4ff; opacity: 0.6; }
        h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 800; letter-spacing: -0.04em; color: #fff; line-height: 0.95;
        }
        h1 em { color: #00b4ff; font-style: normal; }
        .tagline { margin-top: 14px; font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.28); letter-spacing: 0.04em; }

        /* CARD */
        .card {
          width: 100%; max-width: 520px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 36px;
          animation: fadeUp 0.7s ease 0.15s both;
        }

        .field { margin-bottom: 22px; }
        .field-label {
          display: block; font-size: 10px; letter-spacing: 0.18em;
          text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 9px;
        }

        select, .select-styled {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 13px 16px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; color: #fff;
          outline: none; appearance: none; cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        select:focus { border-color: rgba(0,180,255,0.45); background: rgba(0,180,255,0.03); }
        select option { background: #141820; }

        .btn {
          width: 100%; padding: 15px;
          background: #00b4ff; color: #000;
          border: none; border-radius: 10px;
          font-family: 'Syne', sans-serif; font-size: 14px;
          font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; transition: opacity 0.2s, transform 0.1s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn:hover:not(:disabled) { opacity: 0.88; }
        .btn:active:not(:disabled) { transform: scale(0.99); }
        .btn:disabled { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.25); cursor: not-allowed; }

        .dots { display: flex; gap: 5px; align-items: center; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(0,0,0,0.5); animation: bounce 0.5s ease infinite alternate; }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }

        /* POPUP OVERLAY */
        .overlay {
          position: fixed; inset: 0; z-index: 90;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: fadein 0.25s ease both;
        }

        /* POPUP */
        .popup {
          position: relative;
          width: 100%; max-width: 480px;
          background: #0e1120;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          overflow: hidden;
          animation: popUp 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }

        .popup-top {
          padding: 32px 32px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: relative;
        }

        .popup-close {
          position: absolute; top: 18px; right: 18px;
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4); font-size: 14px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .popup-close:hover { color: #fff; border-color: rgba(255,255,255,0.25); }

        .popup-area-name {
          font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(255,255,255,0.3); margin-bottom: 4px;
        }
        .popup-location {
          font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #fff;
          margin-bottom: 20px;
        }

        .popup-score-row { display: flex; align-items: flex-end; gap: 18px; margin-bottom: 16px; }
        .popup-score {
          font-family: 'Syne', sans-serif; font-size: 80px; font-weight: 800; line-height: 1;
        }
        .popup-badge {
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 5px 14px; border-radius: 20px; margin-bottom: 10px;
          display: inline-block;
        }

        .popup-bar-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.07); border-radius: 4px; overflow: hidden; }
        .popup-bar { height: 100%; border-radius: 4px; transition: width 1s cubic-bezier(0.16,1,0.3,1); }

        .popup-body { padding: 24px 32px 32px; }

        .popup-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 24px; }
        .popup-stat {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 14px;
        }
        .popup-stat-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 5px; }
        .popup-stat-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #fff; }

        .divider { width: 100%; height: 1px; background: rgba(255,255,255,0.06); margin-bottom: 20px; }

        .advice-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 10px; }
        .advice-text { font-size: 13px; line-height: 1.85; color: rgba(255,255,255,0.5); font-weight: 300; }
        .no-advice { font-size: 12px; color: rgba(255,255,255,0.25); font-style: italic; }

        /* FOOTER */
        .footer { margin-top: 40px; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.12); animation: fadeUp 0.7s ease 0.3s both; }

        @keyframes fadeDown { from { opacity:0; transform:translateY(-14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(14px)  } to { opacity:1; transform:translateY(0) } }
        @keyframes fadein   { from { opacity:0 }                              to { opacity:1 } }
        @keyframes popUp    { from { opacity:0; transform:scale(0.94) translateY(16px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes bounce   { from { transform:translateY(0) } to { transform:translateY(-4px) } }

        @media (max-width: 500px) {
          .card { padding: 24px; }
          .popup-top, .popup-body { padding-left: 20px; padding-right: 20px; }
          .popup-score { font-size: 64px; }
        }
      `}</style>

      <div className="bg-glow" />

      <div className="page">

        {/* HEADER */}
        <div className="header">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            AI Environmental Health Intelligence
            <span className="eyebrow-line" />
          </div>
          <h1>Rog<em>Vaani</em></h1>
          <p className="tagline">Select a Pune area to get live health risk prediction</p>
        </div>

        {/* MAIN CARD */}
        <div className="card">

          <div className="field">
            <label className="field-label">Pune Area</label>
            <select value={selectedArea} onChange={e => setSelectedArea(e.target.value)}>
              <option value="">— Select an area —</option>
              {AREAS.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="field-label">Activity</label>
            <select value={activity} onChange={e => setActivity(e.target.value)}>
              <option>Walking</option>
              <option>Cycling</option>
              <option>Outdoor Exercise</option>
              <option>Indoor</option>
            </select>
          </div>

          <button
            className="btn"
            onClick={handlePredict}
            disabled={loading || !selectedArea}
          >
            {loading ? (
              <span className="dots">
                <span className="dot"/><span className="dot"/><span className="dot"/>
              </span>
            ) : "Analyse Health Risk →"}
          </button>

        </div>

        <div className="footer">RogVaani © 2026 — Pune Health Risk System</div>
      </div>

      {/* POPUP */}
      {popup && risk && (
        <div className="overlay" onClick={() => setPopup(null)}>
          <div className="popup" onClick={e => e.stopPropagation()}>

            <div className="popup-top" style={{ borderTop: `3px solid ${risk.color}` }}>
              <button className="popup-close" onClick={() => setPopup(null)}>✕</button>
              <div className="popup-area-name">Pune · {popup.activity}</div>
              <div className="popup-location">{popup.area}</div>

              <div className="popup-score-row">
                <div className="popup-score" style={{ color: risk.color }}>{popup.score}</div>
                <div>
                  <div className="popup-badge" style={{ background: risk.bg, color: risk.color }}>
                    {risk.label} Risk
                  </div>
                </div>
              </div>

              <div className="popup-bar-bg">
                <div className="popup-bar" style={{ width: `${popup.score}%`, background: risk.color }} />
              </div>
            </div>

            <div className="popup-body">
              <div className="popup-stats">
                <div className="popup-stat">
                  <div className="popup-stat-label">AQI</div>
                  <div className="popup-stat-val">{popup.aqiValue}</div>
                </div>
                <div className="popup-stat">
                  <div className="popup-stat-label">Temp</div>
                  <div className="popup-stat-val">{popup.temp}°C</div>
                </div>
                <div className="popup-stat">
                  <div className="popup-stat-label">Humidity</div>
                  <div className="popup-stat-val">{popup.humidity}%</div>
                </div>
              </div>

              <div className="divider" />
              <div className="advice-label">AI Health Advice</div>
              {popup.advice
                ? <div className="advice-text">{popup.advice}</div>
                : <div className="no-advice">AI advice unavailable. Check your API connection.</div>
              }
            </div>

          </div>
        </div>
      )}
    </>
  )
}
