"use client"

import { useState, useEffect } from "react"

const WEATHER_API_KEY = "64280d20b06768cc5426c1eef1318f2f"
const API_URL = "https://zibnacjuo9.execute-api.ap-south-1.amazonaws.com/production/predict"

const TALUKAS = [
  { name: "Haveli",        lat: 18.4529, lon: 73.8730 },
  { name: "Pune City",     lat: 18.5204, lon: 73.8567 },
  { name: "Maval",         lat: 18.7275, lon: 73.5274 },
  { name: "Mulshi",        lat: 18.5220, lon: 73.5180 },
  { name: "Velhe",         lat: 18.2728, lon: 73.6450 },
  { name: "Bhor",          lat: 18.1530, lon: 73.8450 },
  { name: "Purandar",      lat: 18.2720, lon: 74.0810 },
  { name: "Indapur",       lat: 18.1130, lon: 75.0150 },
  { name: "Baramati",      lat: 18.1520, lon: 74.5820 },
  { name: "Daund",         lat: 18.4620, lon: 74.5830 },
  { name: "Shirur",        lat: 18.8260, lon: 74.3670 },
  { name: "Khed",          lat: 18.8530, lon: 73.9970 },
  { name: "Ambegaon",      lat: 19.1330, lon: 73.7500 },
  { name: "Junnar",        lat: 19.2070, lon: 73.8760 },
]

function getRisk(score) {
  if (score >= 80) return { label: "CRITICAL", color: "#ff2d2d", bg: "rgba(255,45,45,0.12)" }
  if (score >= 60) return { label: "HIGH",     color: "#ff7a00", bg: "rgba(255,122,0,0.12)" }
  if (score >= 40) return { label: "MODERATE", color: "#f5c400", bg: "rgba(245,196,0,0.12)" }
  return                   { label: "LOW",      color: "#00e676", bg: "rgba(0,230,118,0.12)" }
}

export default function Home() {
  const [talukaData, setTalukaData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [activity, setActivity] = useState("Walking")
  const [progress, setProgress] = useState(0)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    setProgress(0)
    const results = []
    for (let i = 0; i < TALUKAS.length; i++) {
      const t = TALUKAS[i]
      try {
        const [weatherRes, aqiRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${t.lat}&lon=${t.lon}&appid=${WEATHER_API_KEY}&units=metric`),
          fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${t.lat}&lon=${t.lon}&appid=${WEATHER_API_KEY}`)
        ])
        const weather = await weatherRes.json()
        const aqi = await aqiRes.json()
        const temp = Math.round(weather.main?.temp ?? 30)
        const humidity = Math.round(weather.main?.humidity ?? 60)
        const aqiIndex = aqi.list?.[0]?.main?.aqi ?? 3
        const aqiValue = [0, 50, 100, 150, 200, 300][aqiIndex]
        const score = Math.min(100, Math.round((aqiValue * 0.4) + (temp * 1.2)))
        results.push({ ...t, temp, humidity, aqiValue, aqiIndex, score })
      } catch {
        results.push({ ...t, temp: 30, humidity: 60, aqiValue: 120, aqiIndex: 3, score: 58 })
      }
      setProgress(Math.round(((i + 1) / TALUKAS.length) * 100))
    }
    setTalukaData(results)
    setLoading(false)
  }

  async function fetchAdvice(taluka) {
    setSelected({ ...taluka, advice: null, loadingAdvice: true })
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: taluka.name, activity })
      })
      const data = await res.json()
      setSelected(prev => ({ ...prev, advice: data.advice, loadingAdvice: false }))
    } catch {
      setSelected(prev => ({ ...prev, advice: "Could not fetch AI advice. Check your API URL.", loadingAdvice: false }))
    }
  }

  const sorted = [...talukaData].sort((a, b) => b.score - a.score)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07090f; font-family: 'DM Mono', monospace; color: #e0e4f0; overflow-x: hidden; }

        .bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 5%, rgba(0,180,255,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 90% 90%, rgba(120,60,255,0.06) 0%, transparent 60%),
            #07090f;
        }
        .grid-bg {
          position: fixed; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .app { position: relative; z-index: 1; min-height: 100vh; padding: 40px 24px; max-width: 1200px; margin: 0 auto; }

        .header { margin-bottom: 40px; animation: fadeDown 0.7s ease both; }
        .tag { display: inline-block; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #00b4ff; border: 1px solid rgba(0,180,255,0.25); padding: 4px 12px; border-radius: 2px; margin-bottom: 12px; }
        h1 { font-family: 'Syne', sans-serif; font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; letter-spacing: -0.03em; color: #fff; line-height: 1; }
        h1 span { color: #00b4ff; }
        .subtitle { margin-top: 8px; font-size: 11px; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); text-transform: uppercase; }

        .controls { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; flex-wrap: wrap; animation: fadeUp 0.7s ease 0.1s both; }
        .controls label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.35); }
        select { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 2px; padding: 8px 14px; font-family: 'DM Mono', monospace; font-size: 12px; color: #fff; outline: none; appearance: none; cursor: pointer; }
        select option { background: #0d1117; }
        .refresh-btn { padding: 8px 16px; background: transparent; border: 1px solid rgba(0,180,255,0.3); border-radius: 2px; color: #00b4ff; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; }
        .refresh-btn:hover { background: rgba(0,180,255,0.08); }

        .legend { display: flex; gap: 20px; margin-bottom: 32px; flex-wrap: wrap; animation: fadeUp 0.7s ease 0.15s both; }
        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.4); }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }

        .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; }
        .loading-bar-bg { width: 300px; height: 2px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
        .loading-bar-fill { height: 100%; background: #00b4ff; transition: width 0.3s ease; border-radius: 2px; }
        .loading-text { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.3); }

        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; animation: fadeUp 0.7s ease 0.2s both; }

        .taluka-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 3px; padding: 20px; cursor: pointer; transition: transform 0.2s, border-color 0.2s, background 0.2s; position: relative; overflow: hidden; }
        .taluka-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); }
        .taluka-card.active { border-color: #00b4ff; background: rgba(0,180,255,0.05); }

        .card-rank { position: absolute; top: 12px; right: 12px; font-size: 9px; letter-spacing: 0.1em; color: rgba(255,255,255,0.2); }
        .card-name { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 16px; }
        .card-score { font-family: 'Syne', sans-serif; font-size: 40px; font-weight: 800; line-height: 1; margin-bottom: 8px; }
        .card-badge { display: inline-block; font-size: 9px; letter-spacing: 0.15em; padding: 3px 8px; border-radius: 2px; margin-bottom: 14px; }
        .card-bar-bg { width: 100%; height: 2px; background: rgba(255,255,255,0.08); border-radius: 2px; margin-bottom: 14px; }
        .card-bar-fill { height: 100%; border-radius: 2px; }
        .card-stats { display: flex; gap: 12px; }
        .stat { font-size: 10px; color: rgba(255,255,255,0.3); }
        .stat span { color: rgba(255,255,255,0.6); }

        .panel { position: fixed; right: 0; top: 0; bottom: 0; width: 380px; background: rgba(10,12,20,0.97); border-left: 1px solid rgba(255,255,255,0.08); z-index: 100; padding: 40px 32px; overflow-y: auto; transform: translateX(100%); transition: transform 0.35s cubic-bezier(0.16,1,0.3,1); backdrop-filter: blur(20px); }
        .panel.open { transform: translateX(0); }
        .panel-close { position: absolute; top: 20px; right: 20px; background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); width: 32px; height: 32px; border-radius: 2px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .panel-close:hover { border-color: rgba(255,255,255,0.3); color: #fff; }
        .panel-tag { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #00b4ff; margin-bottom: 8px; }
        .panel-name { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 24px; }
        .panel-score { font-family: 'Syne', sans-serif; font-size: 72px; font-weight: 800; line-height: 1; margin-bottom: 8px; }
        .panel-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.06); margin: 24px 0; }
        .panel-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .panel-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 2px; padding: 14px; }
        .panel-stat-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 6px; }
        .panel-stat-value { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: #fff; }
        .panel-advice-label { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 10px; }
        .panel-advice { font-size: 12px; line-height: 1.9; color: rgba(255,255,255,0.6); }
        .panel-fetch-btn { width: 100%; padding: 14px; background: #00b4ff; color: #000; border: none; border-radius: 2px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; margin-top: 16px; }
        .panel-fetch-btn:hover { background: #33c3ff; }
        .panel-fetch-btn:disabled { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.3); cursor: not-allowed; }

        .dots { display: flex; gap: 4px; align-items: center; margin-top: 12px; }
        .dot { width: 5px; height: 5px; background: rgba(255,255,255,0.3); border-radius: 50%; animation: bounce 0.6s ease infinite alternate; }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }

        .overlay { position: fixed; inset: 0; z-index: 90; background: rgba(0,0,0,0.5); opacity: 0; pointer-events: none; transition: opacity 0.3s; }
        .overlay.open { opacity: 1; pointer-events: all; }

        @keyframes fadeDown { from { opacity:0; transform:translateY(-16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes bounce { from { transform:translateY(0) } to { transform:translateY(-4px) } }

        @media (max-width: 600px) { .panel { width: 100%; } .cards-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="bg" />
      <div className="grid-bg" />

      <div className="app">
        <div className="header">
          <div className="tag">Live Environmental Intelligence</div>
          <h1>Rog<span>Vaani</span></h1>
          <p className="subtitle">Pune District Health Risk Monitor — All Talukas</p>
        </div>

        <div className="controls">
          <label>Activity:</label>
          <select value={activity} onChange={e => setActivity(e.target.value)}>
            <option>Walking</option>
            <option>Cycling</option>
            <option>Outdoor Exercise</option>
            <option>Indoor</option>
          </select>
          <button className="refresh-btn" onClick={fetchAll} disabled={loading}>
            {loading ? "Loading..." : "↻ Refresh Data"}
          </button>
        </div>

        <div className="legend">
          {[["#00e676","LOW"],["#f5c400","MODERATE"],["#ff7a00","HIGH"],["#ff2d2d","CRITICAL"]].map(([color, label]) => (
            <div className="legend-item" key={label}>
              <div className="legend-dot" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="loading-screen">
            <div className="loading-text">Fetching live data for all talukas... {progress}%</div>
            <div className="loading-bar-bg">
              <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="cards-grid">
            {sorted.map((t, i) => {
              const risk = getRisk(t.score)
              return (
                <div
                  key={t.name}
                  className={`taluka-card ${selected?.name === t.name ? "active" : ""}`}
                  onClick={() => fetchAdvice(t)}
                >
                  <div className="card-rank">#{i + 1}</div>
                  <div className="card-name">{t.name}</div>
                  <div className="card-score" style={{ color: risk.color }}>{t.score}</div>
                  <div className="card-badge" style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.color}33` }}>
                    {risk.label}
                  </div>
                  <div className="card-bar-bg">
                    <div className="card-bar-fill" style={{ width: `${t.score}%`, background: risk.color }} />
                  </div>
                  <div className="card-stats">
                    <div className="stat">AQI <span>{t.aqiValue}</span></div>
                    <div className="stat">Temp <span>{t.temp}°C</span></div>
                    <div className="stat">Hum <span>{t.humidity}%</span></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className={`overlay ${selected ? "open" : ""}`} onClick={() => setSelected(null)} />

      <div className={`panel ${selected ? "open" : ""}`}>
        {selected && (() => {
          const risk = getRisk(selected.score)
          return (
            <>
              <button className="panel-close" onClick={() => setSelected(null)}>✕</button>
              <div className="panel-tag">Taluka Analysis</div>
              <div className="panel-name">{selected.name}</div>
              <div className="panel-score" style={{ color: risk.color }}>{selected.score}</div>
              <div style={{ display:"inline-block", fontSize:11, letterSpacing:"0.15em", padding:"5px 12px", borderRadius:2, background:risk.bg, color:risk.color, border:`1px solid ${risk.color}44`, marginBottom:24 }}>
                {risk.label} RISK
              </div>
              <div className="panel-stats-grid">
                <div className="panel-stat">
                  <div className="panel-stat-label">AQI Value</div>
                  <div className="panel-stat-value">{selected.aqiValue}</div>
                </div>
                <div className="panel-stat">
                  <div className="panel-stat-label">Temperature</div>
                  <div className="panel-stat-value">{selected.temp}°C</div>
                </div>
                <div className="panel-stat">
                  <div className="panel-stat-label">Humidity</div>
                  <div className="panel-stat-value">{selected.humidity}%</div>
                </div>
                <div className="panel-stat">
                  <div className="panel-stat-label">Activity</div>
                  <div className="panel-stat-value" style={{ fontSize:13, paddingTop:4 }}>{activity}</div>
                </div>
              </div>
              <div className="panel-divider" />
              <div className="panel-advice-label">AI Health Advice</div>
              {selected.loadingAdvice ? (
                <div className="dots"><div className="dot"/><div className="dot"/><div className="dot"/></div>
              ) : selected.advice ? (
                <div className="panel-advice">{selected.advice}</div>
              ) : (
                <button className="panel-fetch-btn" onClick={() => fetchAdvice(selected)}>Get AI Advice →</button>
              )}
            </>
          )
        })()}
      </div>
    </>
  )
}
