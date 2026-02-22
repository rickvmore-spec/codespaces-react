import React, { useState } from 'react';
import Header from './components/Header';
import MadLibForm from './components/MadLibForm';
import RaceRoute from './components/RaceRoute';
import { generateRace } from './utils/raceGenerator';
import './App.css';

function App() {
  const [race, setRace] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (formData) => {
    setIsGenerating(true);
    // Simulate a brief "planning" animation
    setTimeout(() => {
      const generatedRace = generateRace(formData);
      setRace(generatedRace);
      setIsGenerating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  const handleReset = () => {
    setRace(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      {!race && <Header />}
      <main className="app-main">
        {isGenerating && (
          <div className="generating-overlay">
            <div className="generating-content">
              <div className="generating-spinner" />
              <h2>Planning your race route...</h2>
              <p>Scouting locations, setting up roadblocks, hiding clues...</p>
            </div>
          </div>
        )}
        {!race && !isGenerating && <MadLibForm onGenerate={handleGenerate} />}
        {race && !isGenerating && <RaceRoute race={race} onReset={handleReset} />}
      </main>
    </div>
  );
}

export default App;
