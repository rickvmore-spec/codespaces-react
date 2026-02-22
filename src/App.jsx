import React, { useState } from 'react';
import Header from './components/Header';
import MadLibForm from './components/MadLibForm';
import RaceRoute from './components/RaceRoute';
import AIPlannerWizard from './components/AIPlannerWizard';
import AIPlanDisplay from './components/AIPlanDisplay';
import ChatPlanner from './components/ChatPlanner';
import { generateRace } from './utils/raceGenerator';
import './App.css';

// Views: 'home' | 'aiWizard' | 'aiPlan' | 'race' | 'generating' | 'chatPlanner'
function App() {
  const [view, setView] = useState('home');
  const [race, setRace] = useState(null);
  const [aiPlan, setAiPlan] = useState(null);

  const handleGenerate = (formData) => {
    setView('generating');
    setTimeout(() => {
      const generatedRace = generateRace(formData);
      setRace(generatedRace);
      setView('race');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  const handleReset = () => {
    setRace(null);
    setAiPlan(null);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAIPlan = (plan) => {
    setAiPlan(plan);
    setView('aiPlan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      {view === 'home' && <Header />}
      <main className="app-main">
        {view === 'generating' && (
          <div className="generating-overlay">
            <div className="generating-content">
              <div className="generating-spinner" />
              <h2>Planning your race route...</h2>
              <p>Scouting locations, setting up roadblocks, hiding clues...</p>
            </div>
          </div>
        )}

        {view === 'home' && (
          <>
            <div className="mode-selector">
              <button
                className="mode-card"
                onClick={() => setView('chatPlanner')}
              >
                <span className="mode-icon">💬</span>
                <span className="mode-title">Chat with Race Director</span>
                <span className="mode-desc">
                  Tell our AI chatbot what you love — it'll ask smart follow-ups and build the perfect race
                </span>
                <span className="mode-tag">CONVERSATIONAL AI</span>
              </button>
              <button
                className="mode-card"
                onClick={() => setView('aiWizard')}
              >
                <span className="mode-icon">🤖</span>
                <span className="mode-title">AI Smart Planner</span>
                <span className="mode-desc">
                  Tell us the basics — our AI builds a complete event plan tailored to your city
                </span>
                <span className="mode-tag">POWERED BY OPENAI</span>
              </button>
            </div>
            <MadLibForm onGenerate={handleGenerate} />
          </>
        )}

        {view === 'race' && <RaceRoute race={race} onReset={handleReset} />}

        {view === 'aiWizard' && (
          <AIPlannerWizard
            onPlanGenerated={handleAIPlan}
            onCancel={() => setView('home')}
          />
        )}

        {view === 'aiPlan' && (
          <AIPlanDisplay plan={aiPlan} onReset={handleReset} />
        )}

        {view === 'chatPlanner' && (
          <ChatPlanner
            onPlanGenerated={handleAIPlan}
            onCancel={() => setView('home')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
