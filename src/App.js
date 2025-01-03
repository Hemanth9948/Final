import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import mount2 from './assets/mount2.png';
import mount1 from './assets/mount1.png';
import bush2 from './assets/bush2.png';
import bush1 from './assets/bush1.png';
import leaf2 from './assets/leaf2.png';
import leaf1 from './assets/leaf1.png';

function App() {
  const [inputText, setInputText] = useState('');
  const [t5Summary, setT5Summary] = useState('');
  
  // Refs for the elements to apply the parallax scroll effect
  const titleRef = useRef(null);
  const leaf1Ref = useRef(null);
  const leaf2Ref = useRef(null);
  const bush2Ref = useRef(null);
  const mount1Ref = useRef(null);
  const mount2Ref = useRef(null);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSummarizeClick = async () => {
    // Send the input text to the Flask backend
    const response = await fetch('/.netlify/functions/summarizer/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputText }),
    });

    const data = await response.json();
    setT5Summary(data.t5_summary);
  };

  useEffect(() => {
    const handleScroll = () => {
      const value = window.scrollY;
      // Parallax effect on scroll
      titleRef.current.style.marginTop = value * 1.1 + 'px';
      leaf1Ref.current.style.marginLeft = -value + 'px';
      leaf2Ref.current.style.marginLeft = value + 'px';
      bush2Ref.current.style.marginBottom = -value + 'px';
      mount1Ref.current.style.marginBottom = -value * 1.1 + 'px';
      mount2Ref.current.style.marginBottom = -value * 1.2 + 'px';
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // Cleanup on unmount
  }, []);

  return (
    <div className="App">
      <section className="home">
        <img src={mount2} className="mount2" alt="mountain 2" ref={mount2Ref} />
        <img src={mount1} className="mount1" alt="mountain 1" ref={mount1Ref} />
        <img src={bush2} className="bush2" alt="bush 2" ref={bush2Ref} />

        <h1 className="title" ref={titleRef}>Hybrid Text Summarization</h1>

        <img src={bush1} className="bush1" alt="bush 1" />
        <img src={leaf2} className="leaf2" alt="leaf 2" ref={leaf2Ref} />
        <img src={leaf1} className="leaf1" alt="leaf 1" ref={leaf1Ref} />
      </section>

      <section className="about">
        <div className="input-output">
          <div className="input-box">
            <h3>Input Text</h3>
            <textarea
              value={inputText}
              onChange={handleInputChange}
              placeholder="Enter text to summarize"
              rows="10"
              cols="50"
            />
          </div>

          <div className="output-box">
            <h3> Summarized Text</h3>
            <textarea
              value={t5Summary}
              readOnly
              placeholder=" summary will appear here"
              rows="10"
              cols="50"
            />
          </div>

          <button onClick={handleSummarizeClick}>Summarize</button>
        </div>
      </section>
    </div>
  );
}

export default App;
