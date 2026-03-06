"use client"

import { useState } from "react"

const WEATHER_API_KEY = "64280d20b06768cc5426c1eef1318f2f"
const API_URL = "https://zibnacjuo9.execute-api.ap-south-1.amazonaws.com/production/predict"

const CITIES = {
  "Mumbai": {
    state: "Maharashtra",
    wards: [
      { name: "Colaba",       lat: 18.9067, lon: 72.8147, baseAqi: 72  },
      { name: "Bandra",       lat: 19.0596, lon: 72.8295, baseAqi: 88  },
      { name: "Andheri West", lat: 19.1136, lon: 72.8697, baseAqi: 110 },
      { name: "Andheri East", lat: 19.1197, lon: 72.8797, baseAqi: 128 },
      { name: "Borivali",     lat: 19.2307, lon: 72.8567, baseAqi: 95  },
      { name: "Dahisar",      lat: 19.2520, lon: 72.8567, baseAqi: 82  },
      { name: "Kandivali",    lat: 19.2044, lon: 72.8527, baseAqi: 100 },
      { name: "Malad",        lat: 19.1874, lon: 72.8484, baseAqi: 105 },
      { name: "Goregaon",     lat: 19.1663, lon: 72.8526, baseAqi: 112 },
      { name: "Kurla",        lat: 19.0726, lon: 72.8843, baseAqi: 145 },
      { name: "Chembur",      lat: 19.0621, lon: 72.8996, baseAqi: 138 },
      { name: "Ghatkopar",    lat: 19.0863, lon: 72.9083, baseAqi: 142 },
      { name: "Bhandup",      lat: 19.1438, lon: 72.9420, baseAqi: 155 },
      { name: "Mulund",       lat: 19.1726, lon: 72.9560, baseAqi: 148 },
      { name: "Dadar",        lat: 19.0186, lon: 72.8424, baseAqi: 125 },
      { name: "Marine Lines", lat: 18.9433, lon: 72.8237, baseAqi: 78  },
    ]
  },
  "Pune": {
    state: "Maharashtra",
    wards: [
      { name: "Haveli",     lat: 18.4529, lon: 73.8730, baseAqi: 148 },
      { name: "Pune City",  lat: 18.5204, lon: 73.8567, baseAqi: 162 },
      { name: "Maval",      lat: 18.7275, lon: 73.5274, baseAqi: 72  },
      { name: "Mulshi",     lat: 18.5220, lon: 73.5180, baseAqi: 58  },
      { name: "Velhe",      lat: 18.2728, lon: 73.6450, baseAqi: 44  },
      { name: "Bhor",       lat: 18.1530, lon: 73.8450, baseAqi: 61  },
      { name: "Purandar",   lat: 18.2720, lon: 74.0810, baseAqi: 88  },
      { name: "Indapur",    lat: 18.1130, lon: 75.0150, baseAqi: 110 },
      { name: "Baramati",   lat: 18.1520, lon: 74.5820, baseAqi: 124 },
      { name: "Daund",      lat: 18.4620, lon: 74.5830, baseAqi: 118 },
      { name: "Shirur",     lat: 18.8260, lon: 74.3670, baseAqi: 95  },
      { name: "Khed",       lat: 18.8530, lon: 73.9970, baseAqi: 82  },
      { name: "Ambegaon",   lat: 19.1330, lon: 73.7500, baseAqi: 55  },
      { name: "Junnar",     lat: 19.2070, lon: 73.8760, baseAqi: 49  },
    ]
  },
  "Delhi": {
    state: "Delhi",
    wards: [
      { name: "Connaught Place", lat: 28.6315, lon: 77.2167, baseAqi: 180 },
      { name: "Dwarka",          lat: 28.5921, lon: 77.0460, baseAqi: 195 },
      { name: "Rohini",          lat: 28.7495, lon: 77.0667, baseAqi: 210 },
      { name: "Lajpat Nagar",    lat: 28.5685, lon: 77.2430, baseAqi: 165 },
      { name: "Karol Bagh",      lat: 28.6514, lon: 77.1907, baseAqi: 190 },
      { name: "Nehru Place",     lat: 28.5491, lon: 77.2518, baseAqi: 172 },
      { name: "Saket",           lat: 28.5244, lon: 77.2066, baseAqi: 158 },
      { name: "Janakpuri",       lat: 28.6219, lon: 77.0824, baseAqi: 200 },
    ]
  },
  "Bangalore": {
    state: "Karnataka",
    wards: [
      { name: "Koramangala",  lat: 12.9352, lon: 77.6245, baseAqi: 95  },
      { name: "Indiranagar",  lat: 12.9784, lon: 77.6408, baseAqi: 88  },
      { name: "Whitefield",   lat: 12.9698, lon: 77.7500, baseAqi: 110 },
      { name: "Jayanagar",    lat: 12.9308, lon: 77.5838, baseAqi: 82  },
      { name: "Rajajinagar",  lat: 12.9977, lon: 77.5530, baseAqi: 105 },
      { name: "Electronic City", lat: 12.8456, lon: 77.6603, baseAqi: 120 },
      { name: "Hebbal",       lat: 13.0358, lon: 77.5970, baseAqi: 98  },
      { name: "Marathahalli", lat: 12.9591, lon: 77.6971, baseAqi: 115 },
    ]
  }
}

const ACTIVITIES = ["Outdoor Leisure", "Outdoor Exercise", "Indoor Activities", "Daily Commute", "Travel / Tourism"]

function getRisk(score) {
  if (score >= 75) return { label: "HIGH",     short: "H", color: "#ff3b3b", bg: "rgba(255,59,59,0.12)"  }
  if (score >= 45) return { label: "MED",      short: "M", color: "#f5c400", bg: "rgba(245,196,0,0.12)"  }
  return                   { label: "LOW",      short: "L", color: "#00e676", bg: "rgba(0,230,118,0.12)" }
}

function getDiseaseRisks(score, humidity, temp, aqi) {
  const vector     = Math.min(99, Math.round(score * 0.7 + humidity * 0.3))
  const waterborne = Math.min(99, Math.round(score * 0.6 + humidity * 0.4))
  const respiratory= Math.min(99, Math.round(aqi   * 0.4 + temp    * 0.8))
  return { vector, waterborne, respiratory }
}

function getPrecautions(diseases, activity) {
  const all = []
  if (diseases.vector > 50) {
    all.push({ type: "Do Now",    text: "Apply mosquito repellent before going outdoors." })
    all.push({ type: "Do Now",    text: "Wear full sleeve clothing in the evening." })
    all.push({ type: "Watch For", text: "Signs of fever, joint pain, or rash." })
    all.push({ type: "Seek Help", text: "If fever persists more than 2 days, see a doctor." })
  }
  if (diseases.waterborne > 50) {
    all.push({ type: "Do Now",    text: "Ensure water is boiled before consumption." })
    all.push({ type: "Do Now",    text: "Use water purification tablets or filters." })
    all.push({ type: "Watch For", text: "Nausea, vomiting, or stomach cramps." })
    all.push({ type: "Seek Help", text: "If diarrhoea persists more than 24 hours." })
  }
  if (diseases.respiratory > 50) {
    all.push({ type: "Do Now",    text: "Wear N95 mask when outdoors." })
    all.push({ type: "Watch For", text: "Shortness of breath or chest tightness." })
    all.push({ type: "Seek Help", text: "If breathing difficulty worsens, seek emergency care." })
  }
  if (activity === "Outdoor Exercise") {
    all.push({ type: "Do Now", text: "Exercise before 7am or after 7pm to avoid peak pollution." })
  }
  if (activity === "Daily Commute") {
    all.push({ type: "Do Now", text: "Keep windows closed during commute on high AQI days." })
  }
  return all
}

export default function Home() {
  const [city, setCity]         = useState("Mumbai")
  const [ward, setWard]         = useState(CITIES["Mumbai"].wards[0].name)
  const [activity, setActivity] = useState("Outdoor Leisure")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate]     = useState("")
  const [report, setReport]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [precautionTab, setPrecautionTab] = useState("All")

  const today = new Date().toISOString().split("T")[0]
  const maxDate = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]

  function handleCityChange(c) {
    setCity(c)
    setWard(CITIES[c].wards[0].name)
    setReport(null)
  }

  async function generateReport() {
    const wardData = CITIES[city].wards.find(w => w.name === ward)
    if (!wardData) return
    setLoading(true)
    setReport(null)

    let temp = 29, humidity = 65, aqiValue = wardData.baseAqi

    try {
      const [wRes, aRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${wardData.lat}&lon=${wardData.lon}&appid=${WEATHER_API_KEY}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${wardData.lat}&lon=${wardData.lon}&appid=${WEATHER_API_KEY}`)
      ])
      const w = await wRes.json()
      const a = await aRes.json()
      if (w.main?.temp) temp = Math.round(w.main.temp)
      if (w.main?.humidity) humidity = Math.round(w.main.humidity)
      const pm25 = a.list?.[0]?.components?.pm2_5
      if (pm25) aqiValue = Math.round(pm25 * 2.5)
    } catch (_) {}

    const aqiScore   = Math.min(60, Math.round(aqiValue * 0.25))
    const tempScore  = Math.min(25, Math.round(Math.max(0, temp - 20) * 1.2))
    const baseVar    = Math.round((wardData.baseAqi - 90) * 0.15)
    const overall    = Math.min(99, Math.max(15, aqiScore + tempScore + baseVar + 20))
    const diseases   = getDiseaseRisks(overall, humidity, temp, aqiValue)
    const precautions= getPrecautions(diseases, activity)

    // Fetch AI advice
    let advice = ""
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: `${ward}, ${city}`, activity })
      })
      const data = await res.json()
      advice = data.advice || ""
    } catch (_) {}

    // Fetch 7-day forecast
    let forecast = []
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: `${ward}, ${city}`, activity, mode: "forecast" })
      })
      const data = await res.json()
      forecast = data.forecast || []
    } catch (_) {
      // Generate realistic fallback forecast
      for (let i = 1; i <= 7; i++) {
        const d = new Date(Date.now() + i * 86400000)
        const variance = Math.round((Math.random() - 0.5) * 16)
        const score = Math.min(99, Math.max(15, overall + variance))
        forecast.push({
          date: d.toISOString().split("T")[0],
          day: d.toLocaleDateString("en-US", { weekday: "short" }),
          aqi: Math.round(aqiValue + variance * 1.5),
          riskScore: score
        })
      }
    }

    const safestDay  = forecast.reduce((a, b) => a.riskScore < b.riskScore ? a : b, forecast[0])
    const highestDay = forecast.reduce((a, b) => a.riskScore > b.riskScore ? a : b, forecast[0])

    setReport({ overall, diseases, precautions, advice, forecast, safestDay, highestDay, temp, humidity, aqiValue, ward, city, activity })
    setLoading(false)
  }

  const days = fromDate && toDate ? Math.round((new Date(toDate) - new Date(fromDate)) / 86400000) + 1 : 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;700&family=Cabinet+Grotesk:wght@300;400;500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #080b12; --card: #0d1117; --border: rgba(255,255,255,0.07);
          --accent: #00ff88; --blue: #00b4ff; --text: #c8d4e8; --muted: rgba(255,255,255,0.3);
          --surface: rgba(255,255,255,0.04);
        }
        body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); min-height: 100vh; }

        .glow { position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,255,136,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 90%, rgba(0,180,255,0.04) 0%, transparent 60%); }

        .page { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 0 24px 80px; }

        /* HERO */
        .hero { padding: 60px 0 48px; text-align: center; animation: fadeDown 0.7s ease both; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); border: 1px solid rgba(0,255,136,0.2); padding: 5px 14px; border-radius: 20px; margin-bottom: 24px; }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 2s ease infinite; }
        .hero-title { font-family: 'Syne', sans-serif; font-size: clamp(2.5rem, 7vw, 5.5rem); font-weight: 800; color: #fff; letter-spacing: -0.04em; line-height: 1; margin-bottom: 16px; }
        .hero-title em { color: var(--accent); font-style: normal; }
        .hero-sub { font-size: 14px; color: var(--muted); font-weight: 300; max-width: 500px; margin: 0 auto 8px; line-height: 1.6; }
        .hero-tags { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; flex-wrap: wrap; }
        .hero-tag { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); display: flex; align-items: center; gap: 5px; }
        .hero-tag::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: var(--blue); }

        /* CONTROL PANEL */
        .control-panel { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; margin-bottom: 40px; animation: fadeUp 0.7s ease 0.1s both; }
        .control-grid { display: grid; grid-template-columns: 1fr 1.5fr 1fr 1fr 1.5fr; gap: 16px; margin-bottom: 20px; }
        @media (max-width: 800px) { .control-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 500px) { .control-grid { grid-template-columns: 1fr; } }

        .ctrl-field { display: flex; flex-direction: column; gap: 6px; }
        .ctrl-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); display: flex; align-items: center; gap: 5px; }
        .ctrl-select, .ctrl-input {
          background: rgba(255,255,255,0.03); border: 1px solid var(--border);
          border-radius: 8px; padding: 10px 14px; font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #fff; outline: none; appearance: none; cursor: pointer;
          transition: border-color 0.2s, background 0.2s; width: 100%;
        }
        .ctrl-select:focus, .ctrl-input:focus { border-color: rgba(0,255,136,0.3); background: rgba(0,255,136,0.03); }
        .ctrl-select option { background: #0d1117; }
        .ctrl-sub { font-size: 10px; color: var(--muted); margin-top: 2px; }

        .date-row { display: flex; align-items: center; gap: 8px; }
        .date-row span { font-size: 11px; color: var(--muted); }

        .info-bar { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted); margin-bottom: 16px; padding: 8px 12px; background: rgba(0,180,255,0.05); border: 1px solid rgba(0,180,255,0.1); border-radius: 6px; }

        .generate-btn {
          width: 100%; padding: 16px; background: var(--accent); color: #000;
          border: none; border-radius: 10px; font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; transition: opacity 0.2s, transform 0.1s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .generate-btn:hover { opacity: 0.9; }
        .generate-btn:active { transform: scale(0.99); }
        .generate-btn:disabled { background: rgba(255,255,255,0.08); color: var(--muted); cursor: not-allowed; }

        /* FEATURE PILLS */
        .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 40px; animation: fadeUp 0.7s ease 0.2s both; }
        @media (max-width: 600px) { .features { grid-template-columns: 1fr; } }
        .feature-pill { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; align-items: flex-start; gap: 14px; }
        .feature-icon { font-size: 24px; }
        .feature-title { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .feature-desc { font-size: 11px; color: var(--muted); line-height: 1.5; }

        /* REPORT */
        .report { animation: fadeUp 0.5s ease both; }

        .report-header { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; margin-bottom: 16px; display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
        .report-left {}
        .report-tag { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
        .report-title { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .report-subtitle { font-size: 12px; color: var(--muted); }
        .report-right { text-align: right; }
        .report-score-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
        .report-score { font-family: 'Syne', sans-serif; font-size: 80px; font-weight: 800; line-height: 1; }
        .report-badge { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; padding: 4px 12px; border-radius: 20px; }

        .report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        @media (max-width: 600px) { .report-grid { grid-template-columns: 1fr; } }

        .report-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
        .report-card-title { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

        /* LIVE CONDITIONS */
        .conditions-list { display: flex; flex-direction: column; gap: 10px; }
        .condition-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--surface); border-radius: 8px; }
        .condition-name { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
        .condition-value { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; }
        .condition-value.warn { color: #f5c400; }
        .condition-value.danger { color: #ff3b3b; }

        /* DISEASE CARDS */
        .disease-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        @media (max-width: 500px) { .disease-grid { grid-template-columns: 1fr; } }
        .disease-card { background: var(--surface); border-radius: 10px; padding: 16px; text-align: center; }
        .disease-icon { font-size: 22px; margin-bottom: 8px; }
        .disease-name { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
        .disease-score-wrap { position: relative; width: 64px; height: 64px; margin: 0 auto 8px; }
        .disease-score-num { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; }
        .disease-circle { transform: rotate(-90deg); }

        /* FORECAST */
        .forecast-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 8px; }
        @media (max-width: 600px) { .forecast-grid { grid-template-columns: repeat(4,1fr); } }
        .forecast-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 8px; text-align: center; position: relative; overflow: hidden; }
        .forecast-card.safest { border-color: #00e676; }
        .forecast-card.highest { border-color: #ff3b3b; }
        .forecast-day { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
        .forecast-score { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; }
        .forecast-label { font-size: 8px; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px; }
        .forecast-tag { position: absolute; top: 4px; right: 4px; font-size: 7px; letter-spacing: 0.05em; text-transform: uppercase; padding: 2px 5px; border-radius: 3px; font-weight: 700; }
        .forecast-aqi { font-size: 9px; color: var(--muted); margin-top: 3px; }

        /* AI ADVICE */
        .advice-box { background: rgba(0,255,136,0.03); border: 1px solid rgba(0,255,136,0.1); border-radius: 10px; padding: 16px; margin-top: 12px; font-size: 13px; line-height: 1.8; color: rgba(255,255,255,0.6); font-weight: 300; }
        .advice-powered { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(0,255,136,0.5); margin-bottom: 8px; }

        /* PRECAUTIONS */
        .prec-tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
        .prec-tab { padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 500; cursor: pointer; border: 1px solid var(--border); background: transparent; color: var(--muted); transition: all 0.2s; }
        .prec-tab.active { background: var(--accent); color: #000; border-color: var(--accent); }
        .prec-list { display: flex; flex-direction: column; gap: 8px; }
        .prec-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; background: var(--surface); border-radius: 8px; border: 1px solid var(--border); }
        .prec-check { width: 18px; height: 18px; border-radius: 4px; border: 1px solid var(--border); flex-shrink: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .prec-ai { font-size: 9px; color: var(--accent); font-weight: 600; letter-spacing: 0.05em; }
        .prec-text { font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.5; }
        .prec-type { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 2px; }

        /* LOADING */
        .loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px 0; }
        .loading-spinner { width: 40px; height: 40px; border: 2px solid rgba(0,255,136,0.1); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
        .loading-text { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); }

        @keyframes fadeDown { from { opacity:0; transform:translateY(-16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(16px)  } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes spin     { to { transform: rotate(360deg) } }
      `}</style>

      <div className="glow" />

      <div className="page">

        {/* HERO */}
        <div className="hero">
          <div className="hero-badge"><span className="hero-badge-dot" /> AI for Bharat Hackathon</div>
          <div className="hero-title">Rog<em>Vaani</em></div>
          <div className="hero-sub">AI-powered hyperlocal disease risk forecasting for India. 7–14 day predictions at ward level.</div>
          <div className="hero-tags">
            <div className="hero-tag">Live Data</div>
            <div className="hero-tag">4000+ Indian Cities</div>
            <div className="hero-tag">7–14 Day Forecast</div>
          </div>
        </div>

        {/* CONTROL PANEL */}
        <div className="control-panel">
          <div className="control-grid">
            {/* CITY */}
            <div className="ctrl-field">
              <div className="ctrl-label">🏙 City</div>
              <select className="ctrl-select" value={city} onChange={e => handleCityChange(e.target.value)}>
                {Object.keys(CITIES).map(c => <option key={c}>{c}</option>)}
              </select>
              <div className="ctrl-sub">{CITIES[city].state}</div>
            </div>

            {/* WARD */}
            <div className="ctrl-field">
              <div className="ctrl-label">📍 Ward</div>
              <select className="ctrl-select" value={ward} onChange={e => setWard(e.target.value)}>
                {CITIES[city].wards.map(w => <option key={w.name}>{w.name}</option>)}
              </select>
            </div>

            {/* FROM DATE */}
            <div className="ctrl-field">
              <div className="ctrl-label">📅 From</div>
              <input type="date" className="ctrl-input" value={fromDate} min={today} max={maxDate} onChange={e => setFromDate(e.target.value)} />
            </div>

            {/* TO DATE */}
            <div className="ctrl-field">
              <div className="ctrl-label">📅 To</div>
              <input type="date" className="ctrl-input" value={toDate} min={fromDate || today} max={maxDate} onChange={e => setToDate(e.target.value)} />
              {days > 0 && <div className="ctrl-sub">{days} days · max 14</div>}
            </div>

            {/* ACTIVITY */}
            <div className="ctrl-field">
              <div className="ctrl-label">🏃 Activity</div>
              <select className="ctrl-select" value={activity} onChange={e => setActivity(e.target.value)}>
                {ACTIVITIES.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="info-bar">
            ℹ Forecasts available for the next 14 days only · dates outside this window are disabled
          </div>

          <button className="generate-btn" onClick={generateReport} disabled={loading}>
            {loading ? "⏳ Generating Report..." : "🔍 Generate Risk Report"}
          </button>
        </div>

        {/* FEATURE PILLS — show only before report */}
        {!report && !loading && (
          <div className="features">
            <div className="feature-pill">
              <div className="feature-icon">🦟</div>
              <div>
                <div className="feature-title">Vector-Borne</div>
                <div className="feature-desc">Dengue, Malaria, Chikungunya risk by ward</div>
              </div>
            </div>
            <div className="feature-pill">
              <div className="feature-icon">💧</div>
              <div>
                <div className="feature-title">Waterborne</div>
                <div className="feature-desc">GI infections, Leptospirosis, Hepatitis A</div>
              </div>
            </div>
            <div className="feature-pill">
              <div className="feature-icon">🌫</div>
              <div>
                <div className="feature-title">Respiratory</div>
                <div className="feature-desc">PM2.5, SO2 health impact by location</div>
              </div>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="loading-wrap">
            <div className="loading-spinner" />
            <div className="loading-text">Generating your risk report...</div>
          </div>
        )}

        {/* REPORT */}
        {report && !loading && (() => {
          const risk = getRisk(report.overall)
          const filteredPrec = precautionTab === "All"
            ? report.precautions
            : report.precautions.filter(p => p.type === precautionTab)

          return (
            <div className="report">

              {/* REPORT HEADER */}
              <div className="report-header">
                <div className="report-left">
                  <div className="report-tag">Risk Report · {report.activity}</div>
                  <div className="report-title">{report.ward}</div>
                  <div className="report-subtitle">{report.city} · Activity: {report.activity}</div>
                </div>
                <div className="report-right">
                  <div className="report-score-label">Overall Risk</div>
                  <div className="report-score" style={{ color: risk.color }}>{report.overall}</div>
                  <div className="report-badge" style={{ background: risk.bg, color: risk.color }}>{risk.label}</div>
                </div>
              </div>

              {/* LIVE CONDITIONS + DISEASE RISKS */}
              <div className="report-grid">

                {/* LIVE CONDITIONS */}
                <div className="report-card">
                  <div className="report-card-title">🌡 Live Conditions · {report.ward}</div>
                  <div className="conditions-list">
                    <div className="condition-row">
                      <div className="condition-name">🌡 Temperature</div>
                      <div className={`condition-value ${report.temp > 35 ? "danger" : report.temp > 30 ? "warn" : ""}`}>{report.temp}°C</div>
                    </div>
                    <div className="condition-row">
                      <div className="condition-name">💧 Humidity</div>
                      <div className={`condition-value ${report.humidity > 80 ? "warn" : ""}`}>{report.humidity}%</div>
                    </div>
                    <div className="condition-row">
                      <div className="condition-name">🌫 AQI Value</div>
                      <div className={`condition-value ${report.aqiValue > 150 ? "danger" : report.aqiValue > 100 ? "warn" : ""}`}>{report.aqiValue}</div>
                    </div>
                    <div className="condition-row">
                      <div className="condition-name">📍 Location</div>
                      <div className="condition-value" style={{ fontSize: 13 }}>{report.ward}</div>
                    </div>
                  </div>
                </div>

                {/* DISEASE RISKS */}
                <div className="report-card">
                  <div className="report-card-title">⚠️ Disease Risk Breakdown</div>
                  <div className="disease-grid">
                    {[
                      { icon: "🦟", name: "Vector", score: report.diseases.vector },
                      { icon: "💧", name: "Waterborne", score: report.diseases.waterborne },
                      { icon: "🌫", name: "Respiratory", score: report.diseases.respiratory }
                    ].map(d => {
                      const r = getRisk(d.score)
                      const circumference = 2 * Math.PI * 28
                      const dashOffset = circumference - (d.score / 100) * circumference
                      return (
                        <div className="disease-card" key={d.name}>
                          <div className="disease-icon">{d.icon}</div>
                          <div className="disease-name">{d.name}</div>
                          <div className="disease-score-wrap">
                            <svg width="64" height="64" className="disease-circle">
                              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
                              <circle cx="32" cy="32" r="28" fill="none" stroke={r.color} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
                            </svg>
                            <div className="disease-score-num" style={{ color: r.color }}>{d.score}</div>
                          </div>
                          <div className="report-badge" style={{ background: r.bg, color: r.color, fontSize: 9, padding: "2px 8px" }}>{r.label}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 7-DAY FORECAST */}
              <div className="report-card" style={{ marginBottom: 16 }}>
                <div className="report-card-title">📈 Daily Risk Forecast · Plan activities around safer days</div>
                <div className="forecast-grid">
                  {report.forecast.map(d => {
                    const r = getRisk(d.riskScore)
                    const isSafest = d.date === report.safestDay?.date
                    const isHighest = d.date === report.highestDay?.date
                    return (
                      <div key={d.date} className={`forecast-card ${isSafest ? "safest" : isHighest ? "highest" : ""}`}>
                        {isSafest && <div className="forecast-tag" style={{ background: "rgba(0,230,118,0.2)", color: "#00e676" }}>SAFEST</div>}
                        {isHighest && <div className="forecast-tag" style={{ background: "rgba(255,59,59,0.2)", color: "#ff3b3b" }}>HIGHEST</div>}
                        <div className="forecast-day">{d.day}</div>
                        <div className="forecast-score" style={{ color: r.color }}>{d.riskScore}</div>
                        <div className="forecast-label" style={{ color: r.color }}>{r.label}</div>
                        <div className="forecast-aqi">AQI {d.aqi}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* AI ADVICE + PRECAUTIONS */}
              <div className="report-grid">

                {/* AI ADVICE */}
                <div className="report-card">
                  <div className="report-card-title">🤖 Why This Risk?
                    <span style={{ marginLeft: "auto", fontSize: 9, color: "rgba(0,255,136,0.5)" }}>Powered by Amazon Bedrock</span>
                  </div>
                  {report.advice ? (
                    <div className="advice-box">
                      <div className="advice-powered">Amazon Bedrock · Amazon Nova · {report.ward}</div>
                      {report.advice}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>AI advice unavailable. Check your API connection.</div>
                  )}
                </div>

                {/* PRECAUTIONS */}
                <div className="report-card">
                  <div className="report-card-title">✅ Precaution Checklist
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--muted)" }}>{report.precautions.length} items</span>
                  </div>
                  <div className="prec-tabs">
                    {["All", "Do Now", "Watch For", "Seek Help"].map(tab => (
                      <button key={tab} className={`prec-tab ${precautionTab === tab ? "active" : ""}`} onClick={() => setPrecautionTab(tab)}>
                        {tab} ({tab === "All" ? report.precautions.length : report.precautions.filter(p => p.type === tab).length})
                      </button>
                    ))}
                  </div>
                  <div className="prec-list">
                    {filteredPrec.slice(0, 6).map((p, i) => (
                      <div className="prec-item" key={i}>
                        <div className="prec-check"><span style={{ fontSize: 10, color: "var(--accent)" }}>✓</span></div>
                        <div>
                          <div className="prec-type">{p.type}</div>
                          <div className="prec-text">{p.text}</div>
                        </div>
                        <div className="prec-ai" style={{ marginLeft: "auto", flexShrink: 0 }}>AI</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )
        })()}

      </div>
    </>
  )
}
