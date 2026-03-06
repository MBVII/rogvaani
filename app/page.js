"use client"

import { useState, useEffect } from "react"

const WEATHER_API_KEY = "64280d20b06768cc5426c1eef1318f2f"
const API_URL = "https://zibnacjuo9.execute-api.ap-south-1.amazonaws.com/production/predict"

// All 24 Mumbai Wards with accurate coordinates
const WARDS = [
  { name: "Colaba",          lat: 18.9067, lon: 72.8147, baseAqi: 72  },
  { name: "Bandra",          lat: 19.0596, lon: 72.8295, baseAqi: 88  },
  { name: "Andheri West",    lat: 19.1136, lon: 72.8697, baseAqi: 110 },
  { name: "Andheri East",    lat: 19.1197, lon: 72.8797, baseAqi: 128 },
  { name: "Borivali",        lat: 19.2307, lon: 72.8567, baseAqi: 95  },
  { name: "Dahisar",         lat: 19.2520, lon: 72.8567, baseAqi: 82  },
  { name: "Kandivali",       lat: 19.2044, lon: 72.8527, baseAqi: 100 },
  { name: "Malad",           lat: 19.1874, lon: 72.8484, baseAqi: 105 },
  { name: "Goregaon",        lat: 19.1663, lon: 72.8526, baseAqi: 112 },
  { name: "Jogeshwari",      lat: 19.1386, lon: 72.8493, baseAqi: 118 },
  { name: "Kurla",           lat: 19.0726, lon: 72.8843, baseAqi: 145 },
  { name: "Chembur",         lat: 19.0621, lon: 72.8996, baseAqi: 138 },
  { name: "Chembur West",    lat: 19.0550, lon: 72.8950, baseAqi: 92  },
  { name: "Ghatkopar",       lat: 19.0863, lon: 72.9083, baseAqi: 142 },
  { name: "Bhandup",         lat: 19.1438, lon: 72.9420, baseAqi: 155 },
  { name: "Mulund",          lat: 19.1726, lon: 72.9560, baseAqi: 148 },
  { name: "Vikhroli",        lat: 19.1076, lon: 72.9258, baseAqi: 132 },
  { name: "Khar",            lat: 19.0728, lon: 72.8364, baseAqi: 85  },
  { name: "Santacruz",       lat: 19.0822, lon: 72.8412, baseAqi: 98  },
  { name: "Matunga",         lat: 19.0267, lon: 72.8636, baseAqi: 120 },
  { name: "Dadar",           lat: 19.0186, lon: 72.8424, baseAqi: 125 },
  { name: "Parel",           lat: 18.9950, lon: 72.8358, baseAqi: 130 },
  { name: "Grant Road",      lat: 18.9641, lon: 72.8190, baseAqi: 115 },
  { name: "Marine Lines",    lat: 18.9433, lon: 72.8237, baseAqi: 78  },
]

function getRisk(score) {
  if (score >= 80) return { label: "Critical", color: "#ff3b3b", bg: "rgba(255,59,59,0.10)", glow: "rgba(255,59,59,0.2)" }
  if (score >= 60) return { label: "High",     color: "#ff8c00", bg: "rgba(255,140,0,0.10)", glow: "rgba(255,140,0,0.2)" }
  if (score >= 40) return { label: "Moderate", color: "#f5c400", bg: "rgba(245,196,0,0.10)", glow: "rgba(245,196,0,0.2)" }
  return                   { label: "Low",      color: "#00e676", bg: "rgba(0,230,118,0.10)", glow: "rgba(0,230,118,0.2)" }
}

export default function Home() {
  const [wardData, setWardData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [activity, setActivity] = useState("Walking")
  const [progress, setProgress] = useState(0)
  const [forecast, setForecast] = useState(null)
  const [loadingForecast, setLoadingForecast] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    setProgress(0)
    const results = []

    for (let i = 0; i < WARDS.length; i++) {
      const t = WARDS[i]
      let temp = 28 + Math.round(Math.random() * 8)
      let humidity = 55 + Math.round(Math.random() * 25)
      let aqiValue = t.baseAqi + Math.round((Math.random() - 0.5) * 20)

      try {
        const [weatherRes, aqiRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${t.lat}&lon=${t.lon}&appid=${WEATHER_API_KEY}&units=metric`),
          fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${t.lat}&lon=${t.lon}&appid=${WEATHER_API_KEY}`)
        ])
        const weather = await weatherRes.json()
        const aqi = await aqiRes.json()
        if (weather.main?.temp) temp = Math.round(weather.main.temp)
        if (weather.main?.humidity) humidity = Math.round(weather.main.humidity)
        const aqiIndex = aqi.list?.[0]?.main?.aqi
        if (aqiIndex) aqiValue = [0, 50, 100, 150, 200, 300][aqiIndex]
      } catch (_) {}

      const score = Math.min(99, Math.max(20, Math.round((aqiValue * 0.35) + (temp * 1.1))))
      results.push({ ...t, temp, humidity, aqiValue, score })
      setProgress(Math.round(((i + 1) / WARDS.length) * 100))
    }

    setWardData(results.sort((a, b) => b.score - a.score))
    setLoading(false)
  }

  async function fetchAdvice(ward) {
    setSelected({ ...ward, advice: null, loadingAdvice: true })
    setForecast(null)
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: ward.name + ", Mumbai", activity })
      })
      const data = await res.json()
      setSelected(prev => ({ ...prev, advice: data.advice, loadingAdvice: false }))
    } catch {
      setSelected(prev => ({ ...prev, advice: "Unable to fetch AI advice.", loadingAdvice: false }))
    }
  }

  async function fetchForecast(ward) {
    setLoadingForecast(true)
    setForecast(null)
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: ward.name + ", Mumbai", activity, mode: "forecast" })
      })
      const data = await res.json()
      setForecast(data.forecast)
    } catch {
      setForecast([])
    }
    setLoadingForecast(false)
  }

  const sorted = wardData

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0a0c14; --surface: rgba(255,255,255,0.03);
          --border: rgba(255,255,255,0.07); --accent: #00b4ff;
          --text: #c8d0e0; --muted: rgba(255,255,255,0.25);
        }
        body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); min-height: 100vh; }

        .bg-glow { position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse 60% 40% at 15% 0%, rgba(0,180,255,0.055) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 85% 100%, rgba(100,50,255,0.05) 0%, transparent 60%); }

        .page { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 48px 28px 80px; }

        .header { margin-bottom: 40px; animation: fadeDown 0.6s ease both; }
        .eyebrow { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--accent); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .eyebrow::before { content: ''; display: block; width: 20px; height: 1px; background: var(--accent); }
        h1 { font-family: 'Syne', sans-serif; font-size: clamp(2.8rem, 6vw, 5rem); font-weight: 800; letter-spacing: -0.04em; color: #fff; line-height: 0.95; }
        h1 em { color: var(--accent); font-style: normal; }
        .tagline { margin-top: 14px; font-size: 13px; font-weight: 300; color: var(--muted); letter-spacing: 0.04em; }

        .toolbar { display: flex; align-items: center; gap: 16px; margin-bottom: 36px; flex-wrap: wrap; animation: fadeUp 0.6s ease 0.1s both; }
        .toolbar-label { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
        .activity-select { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 9px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #fff; outline: none; appearance: none; cursor: pointer; }
        .activity-select option { background: #141820; }
        .refresh-btn { padding: 9px 18px; background: transparent; border: 1px solid rgba(0,180,255,0.3); border-radius: 6px; color: var(--accent); font-family: 'DM Sans', sans-serif; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .refresh-btn:hover { background: rgba(0,180,255,0.07); }
        .refresh-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .legend { display: flex; gap: 24px; margin-bottom: 36px; flex-wrap: wrap; }
        .legend-item { display: flex; align-items: center; gap: 7px; font-size: 11px; letter-spacing: 0.06em; color: var(--muted); }
        .legend-pip { width: 7px; height: 7px; border-radius: 50%; }

        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 36px; animation: fadeUp 0.6s ease 0.2s both; }
        @media (max-width: 700px) { .stats-row { grid-template-columns: repeat(2,1fr); } }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px 20px; }
        .stat-card-label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
        .stat-card-value { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #fff; }
        .stat-card-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

        .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; gap: 18px; }
        .load-bar-bg { width: 280px; height: 2px; background: rgba(255,255,255,0.07); border-radius: 2px; overflow: hidden; }
        .load-bar { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.3s ease; }
        .load-label { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }

        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; animation: fadeUp 0.6s ease 0.25s both; }

        .t-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 22px 20px 18px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; position: relative; overflow: hidden; }
        .t-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--card-color, transparent); opacity: 0.7; transition: opacity 0.2s; }
        .t-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.12); }
        .t-card:hover::before { opacity: 1; }
        .t-card.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent), 0 12px 40px rgba(0,180,255,0.1); }

        .t-rank { position: absolute; top: 14px; right: 14px; font-size: 10px; color: var(--muted); }
        .t-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 18px; }
        .t-score { font-family: 'Syne', sans-serif; font-size: 52px; font-weight: 800; line-height: 1; margin-bottom: 10px; }
        .t-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; margin-bottom: 16px; }
        .t-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .t-bar-bg { width: 100%; height: 3px; background: rgba(255,255,255,0.07); border-radius: 3px; margin-bottom: 16px; overflow: hidden; }
        .t-bar { height: 100%; border-radius: 3px; }
        .t-meta { display: flex; gap: 10px; flex-wrap: wrap; }
        .t-meta-item { font-size: 10px; color: var(--muted); }
        .t-meta-item b { color: rgba(255,255,255,0.55); font-weight: 500; }

        .panel-overlay { position: fixed; inset: 0; z-index: 90; background: rgba(0,0,0,0.6); opacity: 0; pointer-events: none; transition: opacity 0.3s; backdrop-filter: blur(2px); }
        .panel-overlay.open { opacity: 1; pointer-events: all; }

        .panel { position: fixed; right: 0; top: 0; bottom: 0; width: 420px; background: #0e1018; border-left: 1px solid var(--border); z-index: 100; overflow: hidden; transform: translateX(105%); transition: transform 0.38s cubic-bezier(0.16,1,0.3,1); display: flex; flex-direction: column; }
        .panel.open { transform: translateX(0); }

        .panel-header { padding: 32px 28px 24px; border-bottom: 1px solid var(--border); position: relative; }
        .panel-close { position: absolute; top: 20px; right: 20px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); width: 30px; height: 30px; border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .panel-close:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
        .panel-eyebrow { font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; }
        .panel-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #fff; }
        .panel-subtitle { font-size: 11px; color: var(--muted); margin-top: 4px; }

        .panel-body { flex: 1; overflow-y: auto; padding: 24px 28px 32px; }

        .panel-score { font-family: 'Syne', sans-serif; font-size: 80px; font-weight: 800; line-height: 1; margin-bottom: 8px; }
        .panel-badge { display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 5px 12px; border-radius: 20px; margin-bottom: 20px; }
        .panel-bar-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.07); border-radius: 4px; margin-bottom: 28px; overflow: hidden; }
        .panel-bar { height: 100%; border-radius: 4px; transition: width 1s cubic-bezier(0.16,1,0.3,1); }

        .panel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
        .panel-stat { background: rgba(255,255,255,0.025); border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; }
        .panel-stat-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 5px; }
        .panel-stat-val { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #fff; }

        .divider { width: 100%; height: 1px; background: var(--border); margin: 4px 0 20px; }
        .section-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; }

        .advice-text { font-size: 13px; line-height: 1.85; color: rgba(255,255,255,0.55); font-weight: 300; margin-bottom: 20px; }

        .forecast-btn { width: 100%; padding: 12px; background: transparent; border: 1px solid rgba(0,180,255,0.3); border-radius: 8px; color: var(--accent); font-family: 'DM Sans', sans-serif; font-size: 12px; cursor: pointer; transition: all 0.2s; margin-bottom: 16px; }
        .forecast-btn:hover { background: rgba(0,180,255,0.07); }

        .forecast-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 20px; }
        .forecast-day { background: rgba(255,255,255,0.025); border: 1px solid var(--border); border-radius: 8px; padding: 10px 6px; text-align: center; }
        .forecast-day-name { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
        .forecast-day-score { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; }
        .forecast-day-aqi { font-size: 9px; color: var(--muted); margin-top: 4px; }
        .forecast-tag { font-size: 8px; letter-spacing: 0.05em; padding: 2px 5px; border-radius: 3px; margin-top: 5px; display: inline-block; }

        .get-advice-btn { width: 100%; padding: 14px; background: var(--accent); color: #000; border: none; border-radius: 8px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s; }
        .get-advice-btn:hover { opacity: 0.9; }
        .get-advice-btn:disabled { background: rgba(255,255,255,0.08); color: var(--muted); cursor: not-allowed; }

        .dots { display: flex; gap: 5px; margin: 8px 0; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: var(--muted); animation: bounce 0.5s ease infinite alternate; }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }

        @keyframes fadeDown { from { opacity:0; transform:translateY(-14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(14px)  } to { opacity:1; transform:translateY(0) } }
        @keyframes bounce   { from { transform:translateY(0) } to { transform:translateY(-4px) } }

        @media (max-width: 600px) { .panel { width: 100%; } .cards-grid { grid-template-columns: 1fr 1fr; } .forecast-grid { grid-template-columns: repeat(4,1fr); } }
      `}</style>

      <div className="bg-glow" />

      <div className="page">
        <div className="header">
          <div className="eyebrow">AI Health Intelligence · Mumbai</div>
          <h1>Rog<em>Vaani</em></h1>
          <p className="tagline">Live Environmental Health Risk Monitor — All 24 Mumbai Wards</p>
        </div>

        <div className="toolbar">
          <span className="toolbar-label">Activity</span>
          <select className="activity-select" value={activity} onChange={e => setActivity(e.target.value)}>
            <option>Walking</option>
            <option>Cycling</option>
            <option>Outdoor Exercise</option>
            <option>Indoor</option>
          </select>
          <button className="refresh-btn" onClick={fetchAll} disabled={loading}>↻ Refresh Live Data</button>
        </div>

        <div className="legend">
          {[["#00e676","Low — Safe"],["#f5c400","Moderate — Caution"],["#ff8c00","High — Risky"],["#ff3b3b","Critical — Danger"]].map(([c,l]) => (
            <div className="legend-item" key={l}><div className="legend-pip" style={{ background: c }} />{l}</div>
          ))}
        </div>

        {!loading && wardData.length > 0 && (() => {
          const avg = Math.round(wardData.reduce((s,t) => s + t.score, 0) / wardData.length)
          const critical = wardData.filter(t => t.score >= 80).length
          const safe = wardData.filter(t => t.score < 40).length
          const highest = wardData[0]
          return (
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-card-label">Avg Risk Score</div>
                <div className="stat-card-value" style={{ color: getRisk(avg).color }}>{avg}</div>
                <div className="stat-card-sub">across all wards</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">Critical Zones</div>
                <div className="stat-card-value" style={{ color: "#ff3b3b" }}>{critical}</div>
                <div className="stat-card-sub">score ≥ 80</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">Safe Zones</div>
                <div className="stat-card-value" style={{ color: "#00e676" }}>{safe}</div>
                <div className="stat-card-sub">score &lt; 40</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">Highest Risk</div>
                <div className="stat-card-value" style={{ color: getRisk(highest.score).color, fontSize: 20, paddingTop: 4 }}>{highest.name}</div>
                <div className="stat-card-sub">score {highest.score}</div>
              </div>
            </div>
          )
        })()}

        {loading ? (
          <div className="loading-wrap">
            <div className="load-label">Fetching live data · {progress}%</div>
            <div className="load-bar-bg"><div className="load-bar" style={{ width: `${progress}%` }} /></div>
          </div>
        ) : (
          <div className="cards-grid">
            {sorted.map((t, i) => {
              const risk = getRisk(t.score)
              return (
                <div key={t.name} className={`t-card ${selected?.name === t.name ? "active" : ""}`} style={{ "--card-color": risk.color }} onClick={() => fetchAdvice(t)}>
                  <div className="t-rank">#{i + 1}</div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-score" style={{ color: risk.color }}>{t.score}</div>
                  <div className="t-badge" style={{ background: risk.bg, color: risk.color }}>
                    <span className="t-badge-dot" />{risk.label}
                  </div>
                  <div className="t-bar-bg"><div className="t-bar" style={{ width: `${t.score}%`, background: risk.color }} /></div>
                  <div className="t-meta">
                    <div className="t-meta-item">AQI <b>{t.aqiValue}</b></div>
                    <div className="t-meta-item">Temp <b>{t.temp}°C</b></div>
                    <div className="t-meta-item">Hum <b>{t.humidity}%</b></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className={`panel-overlay ${selected ? "open" : ""}`} onClick={() => setSelected(null)} />

      <div className={`panel ${selected ? "open" : ""}`}>
        {selected && (() => {
          const risk = getRisk(selected.score)
          const safestDay = forecast ? forecast.reduce((a, b) => a.riskScore < b.riskScore ? a : b) : null
          const highestDay = forecast ? forecast.reduce((a, b) => a.riskScore > b.riskScore ? a : b) : null
          return (
            <>
              <div className="panel-header">
                <button className="panel-close" onClick={() => setSelected(null)}>✕</button>
                <div className="panel-eyebrow">Ward Health Report · Mumbai</div>
                <div className="panel-title">{selected.name}</div>
                <div className="panel-subtitle">Activity: {activity}</div>
              </div>
              <div className="panel-body">
                <div className="panel-score" style={{ color: risk.color }}>{selected.score}</div>
                <div className="panel-badge" style={{ background: risk.bg, color: risk.color }}>{risk.label} Risk</div>
                <div className="panel-bar-bg">
                  <div className="panel-bar" style={{ width: `${selected.score}%`, background: risk.color }} />
                </div>

                <div className="panel-grid">
                  <div className="panel-stat">
                    <div className="panel-stat-label">AQI</div>
                    <div className="panel-stat-val">{selected.aqiValue}</div>
                  </div>
                  <div className="panel-stat">
                    <div className="panel-stat-label">Temperature</div>
                    <div className="panel-stat-val">{selected.temp}°C</div>
                  </div>
                  <div className="panel-stat">
                    <div className="panel-stat-label">Humidity</div>
                    <div className="panel-stat-val">{selected.humidity}%</div>
                  </div>
                  <div className="panel-stat">
                    <div className="panel-stat-label">Activity</div>
                    <div className="panel-stat-val" style={{ fontSize: 13, paddingTop: 5 }}>{activity}</div>
                  </div>
                </div>

                <div className="divider" />

                {/* 7-DAY FORECAST */}
                <div className="section-label">7-Day Risk Forecast</div>
                {!forecast && !loadingForecast && (
                  <button className="forecast-btn" onClick={() => fetchForecast(selected)}>
                    📈 Generate ML Forecast →
                  </button>
                )}
                {loadingForecast && <div className="dots"><div className="dot"/><div className="dot"/><div className="dot"/></div>}
                {forecast && forecast.length > 0 && (
                  <div className="forecast-grid">
                    {forecast.map((d) => {
                      const r = getRisk(d.riskScore)
                      const isSafest = d.date === safestDay?.date
                      const isHighest = d.date === highestDay?.date
                      return (
                        <div key={d.date} className="forecast-day" style={{ borderColor: isSafest ? "#00e676" : isHighest ? "#ff3b3b" : "rgba(255,255,255,0.07)" }}>
                          <div className="forecast-day-name">{d.day}</div>
                          <div className="forecast-day-score" style={{ color: r.color }}>{d.riskScore}</div>
                          <div className="forecast-day-aqi">AQI {d.aqi}</div>
                          {isSafest && <div className="forecast-tag" style={{ background: "rgba(0,230,118,0.15)", color: "#00e676" }}>SAFEST</div>}
                          {isHighest && <div className="forecast-tag" style={{ background: "rgba(255,59,59,0.15)", color: "#ff3b3b" }}>HIGHEST</div>}
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="divider" />

                {/* AI ADVICE */}
                <div className="section-label">AI Health Advice</div>
                {selected.loadingAdvice ? (
                  <div className="dots"><div className="dot"/><div className="dot"/><div className="dot"/></div>
                ) : selected.advice ? (
                  <div className="advice-text">{selected.advice}</div>
                ) : (
                  <button className="get-advice-btn" onClick={() => fetchAdvice(selected)}>Get AI Advice →</button>
                )}
              </div>
            </>
          )
        })()}
      </div>
    </>
  )
}
