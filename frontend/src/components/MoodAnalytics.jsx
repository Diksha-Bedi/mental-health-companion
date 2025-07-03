import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import 'chartjs-adapter-date-fns';
import { saveAs } from 'file-saver';

ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend,
  ArcElement
);

const chartContainerStyle = {
  maxWidth: "700px",
  margin: "2rem auto",
  padding: "1rem"
};

const MoodAnalytics = () => {
  const [moodCounts, setMoodCounts] = useState({ positive: 0, negative: 0, neutral: 0 });
  const [trendData, setTrendData] = useState([]);
  const [moodLog, setMoodLog] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const fetchMoodLog = async () => {
    try {
      const baseURL = import.meta.env.VITE_BACKEND_URL || "https://mental-health-backend-g4mh.onrender.com";
      const res = await axios.get(`${baseURL}/mood-log`);
      const log = res.data;

      const moodCount = { positive: 0, negative: 0, neutral: 0 };
      const trend = [];

      log.forEach(entry => {
        if (moodCount[entry.mood] !== undefined) {
          moodCount[entry.mood]++;
        }

        trend.push({
          x: new Date(entry.timestamp),
          y: entry.mood
        });
      });

      setMoodCounts(moodCount);
      setTrendData(trend);
      setMoodLog(log);
    } catch (error) {
      console.error("Failed to fetch mood log:", error);
    }
  };

  useEffect(() => {
    fetchMoodLog();
  }, []);

  const total = moodCounts.positive + moodCounts.negative + moodCounts.neutral;

  const tooltipCallbacks = {
    callbacks: {
      label: function (context) {
        const mood = context.label || context.raw.y;
        const emoji =
          mood === "positive" || context.raw === 1 ? "😊" :
            mood === "negative" || context.raw === -1 ? "😔" : "😐";
        return `${emoji} ${mood}: ${context.raw.y ?? context.raw}`;
      }
    }
  };

  const barData = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [
      {
        label: "Mood Count",
        data: [moodCounts.positive, moodCounts.negative, moodCounts.neutral],
        backgroundColor: ["#28a745", "#dc3545", "#ffc107"],
        borderRadius: 8,
      },
    ],
  };

  const lineData = {
    datasets: [
      {
        label: "Mood Over Time",
        data: trendData.map(entry => ({
          x: entry.x,
          y: entry.y === "positive" ? 1 : entry.y === "neutral" ? 0 : -1
        })),
        backgroundColor: "#007bff",
        borderColor: "#007bff",
        tension: 0.3,
        fill: false,
        pointRadius: 4
      }
    ]
  };

  const pieData = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [
      {
        label: "Mood Percentage",
        data: total > 0 ? [
          ((moodCounts.positive / total) * 100).toFixed(1),
          ((moodCounts.negative / total) * 100).toFixed(1),
          ((moodCounts.neutral / total) * 100).toFixed(1),
        ] : [0, 0, 0],
        backgroundColor: ["#28a745", "#dc3545", "#ffc107"],
        borderWidth: 1,
      },
    ],
  };

  const lineOptions = {
    scales: {
      x: {
        type: 'time',
        time: { unit: 'minute' },
        title: { display: true, text: 'Timestamp' }
      },
      y: {
        ticks: {
          callback: (value) => {
            if (value === 1) return 'Positive';
            if (value === 0) return 'Neutral';
            if (value === -1) return 'Negative';
          },
          stepSize: 1
        },
        min: -1,
        max: 1,
        title: { display: true, text: 'Mood' }
      }
    },
    plugins: tooltipCallbacks
  };

  const handleFilter = () => {
    const results = moodLog.filter(entry =>
      entry.message.toLowerCase().includes(keyword.toLowerCase())
    );
    setFilteredResults(results);
  };

  const exportCSV = () => {
    if (!moodLog.length) return;
    const headers = ["timestamp", "message", "mood", "compound_score"];
    const csvRows = [
      headers.join(","),
      ...moodLog.map(entry =>
        headers.map(field => `"${(entry[field] || '').toString().replace(/"/g, '""')}"`).join(",")
      )
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'mood_log.csv');
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <div style={{
        width: "100%",
        maxWidth: "750px",
        margin: "2rem auto",
        padding: "1.5rem",
        backgroundColor: darkMode ? "rgba(34, 34, 34, 0.9)" : "rgba(255, 255, 255, 0.9)",
        color: darkMode ? "#fff" : "#000",
        borderRadius: "10px",
        boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        textAlign: "center",
        backdropFilter: "blur(4px)"
      }}>
        <h2>📊 Mood Analytics</h2>

        <div style={{ marginBottom: "1rem" }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: "0.5rem 1rem", borderRadius: "6px", backgroundColor: darkMode ? "#f8f9fa" : "#343a40", color: darkMode ? "#000" : "#fff", border: "none", cursor: "pointer" }}>
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
          <button onClick={fetchMoodLog} style={{ marginLeft: "1rem", padding: "0.5rem 1rem", borderRadius: "6px", backgroundColor: "#17a2b8", color: "#fff", border: "none", cursor: "pointer" }}>
            🔄 Refresh
          </button>
        </div>

        <h4>🧠 Recent Mood Summary: {
          moodCounts.positive > moodCounts.negative ? "😊 Mostly Positive"
            : moodCounts.negative > moodCounts.positive ? "😔 Mostly Negative"
              : "😐 Mixed"
        }</h4>
        <p style={{ fontSize: "1.2rem" }}>Positive: {moodCounts.positive} | Negative: {moodCounts.negative} | Neutral: {moodCounts.neutral}</p>

        <div style={chartContainerStyle}>
          <Bar data={barData} options={{ animation: { duration: 1500 }, plugins: tooltipCallbacks }} />
        </div>

        <h3 style={{ marginTop: "2rem" }}>📈 Mood Trend Over Time</h3>
        <div style={chartContainerStyle}>
          <Line data={lineData} options={{ ...lineOptions, animation: { duration: 1500 } }} />
        </div>

        <h3 style={{ marginTop: "2rem" }}>🧁 Mood Distribution</h3>
        <div style={{ ...chartContainerStyle, maxWidth: "500px" }}>
          <Pie data={pieData} options={{ animation: { duration: 1500 }, plugins: tooltipCallbacks }} />
        </div>

        <div style={{ marginTop: "2rem" }}>
          <h3>🔍 Filter Mood Entries by Keyword</h3>
          <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g., anxious, happy" style={{ padding: "0.5rem", width: "60%", marginRight: "1rem", borderRadius: "6px", border: "1px solid #ccc" }} />
          <button onClick={handleFilter} style={{ padding: "0.5rem 1rem", borderRadius: "6px", backgroundColor: "#007bff", color: "#fff", border: "none", cursor: "pointer" }}>Search</button>
        </div>

        {filteredResults.length > 0 && (
          <div style={{ marginTop: "1rem", textAlign: "left" }}>
            <h4>📄 Matching Entries:</h4>
            <ul>
              {filteredResults.map((entry, index) => (
                <li key={index} style={{ marginBottom: "0.5rem" }}>
                  <strong>{entry.timestamp}</strong> — <em>{entry.mood}</em>: {entry.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: "1.5rem" }}>
          <button onClick={exportCSV} style={{ padding: "0.6rem 1.2rem", borderRadius: "6px", backgroundColor: "#28a745", color: "#fff", border: "none", cursor: "pointer" }}>
            📥 Download Mood Log as CSV
          </button>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>📋 Mood History</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#eaeaea" }}>
                <th style={{ padding: "8px", border: "1px solid #ccc" }}>Timestamp</th>
                <th style={{ padding: "8px", border: "1px solid #ccc" }}>Mood</th>
                <th style={{ padding: "8px", border: "1px solid #ccc" }}>Message</th>
                <th style={{ padding: "8px", border: "1px solid #ccc" }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {moodLog.map((entry, idx) => {
                const emoji = entry.mood === "positive" ? "😊" : entry.mood === "negative" ? "😔" : "😐";
                const bgColor = entry.mood === "positive" ? "#d4edda" : entry.mood === "negative" ? "#f8d7da" : "#fff3cd";
                return (
                  <tr key={idx} style={{ backgroundColor: bgColor }}>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>{entry.timestamp}</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>{emoji} {entry.mood}</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>{entry.message}</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>{entry.compound_score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MoodAnalytics;
