"use client"

import { useState } from "react"

export default function Home() {
  const [location, setLocation] = useState("")
  const [activity, setActivity] = useState("Outdoor Exercise")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function predict() {
    if (!location) return
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch("https://zibnacjuo9.execute-api.ap-south-1.amazonaws.com/production/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, activity })
      })
      const data = await response.json()
      setResult(data)
    } catch (e) {
      setResult({ score: null, advice: "Failed to connect. Please try again." })
    }
    setLoading(false)
  }

  const getRiskLevel = (score) => {
    if (score >= 80) return { label: "CRITICAL", color: "#ff2d2d" }
    if (score >= 60) return { label: "HIGH", color: "#ff7a00" }
    if (score >= 40) return { label: "MODERATE", color: "#f5c400" }
    return { label: "LOW", color: "#00e676" }
  }

  const risk = result?.score != null ? getRiskLevel(result.score) : null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #060810;
          min-height: 100vh;
          font-family: 'DM Mono', monospace;
          color: #e8eaf0;
          overflow-x: hidden;
        }

        .bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(0,180,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(100,60,255,0.08) 0%, transparent 60%),
            #060810;
        }

        .grid-lines {
          position: fixed;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .wrapper {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
        }

        .header {
          text-align: center;
          margin-bottom: 60px;
          animation: fadeDown 0.8s ease both;
        }

        .tag {
          display: inline-block;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #00b4ff;
          border: 1px solid rgba(0,180,255,0.3);
          padding: 5px 14px;
          border-radius: 2px;
          margin-bottom: 20px;
        }

        h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.5rem, 6vw, 5rem);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.03em;
          color: #fff;
        }

        h1 span {
          color: #00b4ff;
        }

        .subtitle {
          margin-top: 16px;
          font-size: 12px;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
        }

        .card {
          width: 100%;
          max-width: 560px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          padding: 40px;
          animation: fadeUp 0.8s ease 0.2s both;
          backdrop-filter: blur(10px);
        }

        .field {
          margin-bottom: 28px;
        }

        label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 10px;
        }

        input, select {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 2px;
          padding: 14px 16px;
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          color: #fff;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          appearance: none;
        }

        input::placeholder { color: rgba(255,255,255,0.2); }

        input:focus, select:focus {
          border-color: rgba(0,180,255,0.5);
          background: rgba(0,180,255,0.04);
        }

        select option { background: #0d1117; }

        .btn {
          width: 100%;
          padding: 16px;
          background: #00b4ff;
          color: #000;
          border: none;
          border-radius: 2px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          position: relative;
          overflow: hidden;
        }

        .btn:hover { background: #33c3ff; }
        .btn:active { transform: scale(0.99); }
        .btn:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); cursor: not-allowed; }

        .loader {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .dot {
          width: 6px; height: 6px;
          background: rgba(0,0,0,0.6);
          border-radius: 50%;
          animation: bounce 0.6s ease infinite alternate;
        }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }

        .result {
          margin-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: 32px;
          animation: fadeUp 0.5s ease both;
        }

        .score-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .score-num {
          font-family: 'Syne', sans-serif;
          font-size: 72px;
          font-weight: 800;
          line-height: 1;
          color: #fff;
        }

        .risk-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          padding: 6px 12px;
          border-radius: 2px;
          margin-bottom: 8px;
        }

        .bar-bg {
          width: 100%;
          height: 3px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          margin-bottom: 24px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 1s cubic-bezier(0.16,1,0.3,1);
        }

        .advice-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 10px;
        }

        .advice-text {
          font-size: 13px;
          line-height: 1.8;
          color: rgba(255,255,255,0.7);
        }

        .footer {
          margin-top: 48px;
          font-size: 10px;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.15);
          text-align: center;
          animation: fadeUp 0.8s ease 0.4s both;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-4px); }
        }
      `}</style>

      <div className="bg" />
      <div className="grid-lines" />

      <div className="wrapper">
        <div className="header">
          <div className="tag">AI Health Intelligence</div>
          <h1>Rog<span>Vaani</span></h1>
          <p className="subtitle">Predictive Environmental Health Risk System</p>
        </div>

        <div className="card">
          <div className="field">
            <label>Location</label>
            <input
              placeholder="Enter your city"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Activity</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)}>
              <option>Outdoor Exercise</option>
              <option>Cycling</option>
              <option>Walking</option>
              <option>Indoor</option>
            </select>
          </div>

          <button className="btn" onClick={predict} disabled={loading || !location}>
            {loading ? (
              <span className="loader">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </span>
            ) : "Analyse Risk →"}
          </button>

          {result && (
            <div className="result">
              {result.score != null ? (
                <>
                  <div className="score-row">
                    <div className="score-num">{result.score}</div>
                    <div>
                      <div
                        className="risk-badge"
                        style={{
                          background: risk.color + "22",
                          color: risk.color,
                          border: `1px solid ${risk.color}44`
                        }}
                      >
                        {risk.label} RISK
                      </div>
                    </div>
                  </div>

                  <div className="bar-bg">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${result.score}%`,
                        background: risk.color
                      }}
                    />
                  </div>

                  <div className="advice-label">AI Analysis</div>
                  <div className="advice-text">{result.advice}</div>
                </>
              ) : (
                <div className="advice-text">{result.advice}</div>
              )}
            </div>
          )}
        </div>

        <div className="footer">
          ROGVAANI © 2026 — AI-POWERED HEALTH RISK PREDICTION
        </div>
      </div>
    </>
  )
}