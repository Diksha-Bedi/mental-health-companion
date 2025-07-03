import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ShareMoodForm = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const baseURL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("Please fill out both fields.");
      return;
    }

    try {
      await axios.post(`${baseURL}/submit-feedback`, {
        user: name,
        message: message
      });
      toast.success("✅ Mood submitted successfully!");
      setName('');
      setMessage('');
    } catch (err) {
      console.error(err);
      toast.error("❌ Submission failed. Please try again.");
    }
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>📝 Share Your Mood</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          style={styles.textarea}
          placeholder="How are you feeling today?"
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" style={styles.button}>Submit Mood</button>
      </form>
    </div>
  );
};

const styles = {
  wrapper: {
    maxWidth: '500px',
    margin: '3rem auto',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff'
  },
  heading: {
    textAlign: 'center',
    marginBottom: '1.5rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  input: {
    padding: '0.8rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc'
  },
  textarea: {
    padding: '0.8rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    resize: 'vertical'
  },
  button: {
    padding: '0.8rem',
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};

export default ShareMoodForm;
