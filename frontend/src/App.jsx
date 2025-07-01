import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import MoodAnalytics from './components/MoodAnalytics';

const App = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const res = await axios.post('http://127.0.0.1:5000/analyze-sentiment', {
        message: message
      });
      setResponse(res.data);
    } catch (err) {
      console.error('Error:', err);
      setResponse({ error: 'Server error. Please try again later.' });
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Mental Health Companion Bot</h1>

        <div style={styles.chatBox}>
          <textarea
            style={styles.textArea}
            rows="4"
            placeholder="How are you feeling today?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button style={styles.button} onClick={handleSend}>Analyze</button>

          {response && (
            <div style={styles.result}>
              <h3>Detected Mood: {response.mood}</h3>
              <pre>{JSON.stringify(response.scores, null, 2)}</pre>

              <div style={{ marginTop: "1rem" }}>
                <h4>📝 Journaling Prompt:</h4>
                <p>
                  {response.mood === "positive" && "What made you feel good today?"}
                  {response.mood === "negative" && "What’s bothering you, and how can you work through it?"}
                  {response.mood === "neutral" && "Reflect on one thing you’re grateful for."}
                </p>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <h4>🎧 Music / Meditation Suggestion:</h4>
                <p>
                  {response.mood === "positive" && (
                    <a href="https://www.youtube.com/watch?v=JgDNFQ2RaLQ" target="_blank" rel="noopener noreferrer">
                      Listen to something joyful!
                    </a>
                  )}
                  {response.mood === "negative" && (
                    <a href="https://www.youtube.com/watch?v=5jca-sWgemI" target="_blank" rel="noopener noreferrer">
                      Try this relaxing meditation.
                    </a>
                  )}
                  {response.mood === "neutral" && (
                    <a href="https://www.youtube.com/watch?v=mZQH8CPQ-wo" target="_blank" rel="noopener noreferrer">
                      Lo-fi beats to relax or focus 🎧
                    </a>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Mood Analytics is outside the chat box and centered full-width */}
      <div style={{ maxWidth: '900px', margin: '2rem auto' }}>
  <MoodAnalytics />
</div>

    </div>
  );
};

const styles = {
  pageWrapper: {
    fontFamily: 'Arial, sans-serif',
    padding: '2rem',
    width: '100%',
    boxSizing: 'border-box'
  },
  container: {
    maxWidth: '600px',
    margin: 'auto',
    textAlign: 'center'
  },
  title: {
    fontSize: '1.8rem',
    marginBottom: '1.5rem'
  },
  chatBox: {
    backgroundColor: '#f5f5f5',
    padding: '1.5rem',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  },
  textArea: {
    width: '100%',
    padding: '1rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginBottom: '1rem'
  },
  button: {
    padding: '0.8rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer'
  },
  result: {
    marginTop: '1.5rem',
    textAlign: 'left'
  }
};

export default App;
