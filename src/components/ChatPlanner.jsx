import React, { useState, useRef, useEffect } from 'react';
import './ChatPlanner.css';

// ─── Interest categories (multi-select, embedded in chat) ───
const INTERESTS = [
  { id: 'hiking', label: 'Hiking & Trails', icon: '🥾' },
  { id: 'escape-rooms', label: 'Escape Rooms', icon: '🔐' },
  { id: 'beach', label: 'Beach & Water', icon: '🏖️' },
  { id: 'museums', label: 'Museums & Galleries', icon: '🏛️' },
  { id: 'shopping', label: 'Malls & Shopping', icon: '🛍️' },
  { id: 'food', label: 'Food & Dining', icon: '🍽️' },
  { id: 'sports', label: 'Sports & Fitness', icon: '⚽' },
  { id: 'nightlife', label: 'Nightlife & Bars', icon: '🌙' },
  { id: 'parks', label: 'Parks & Nature', icon: '🌳' },
  { id: 'games', label: 'Arcades & Games', icon: '🎮' },
  { id: 'arts', label: 'Live Arts & Music', icon: '🎭' },
  { id: 'adventure', label: 'Thrill & Adventure', icon: '⚡' },
  { id: 'wellness', label: 'Spa & Wellness', icon: '🧘' },
  { id: 'historic', label: 'Historic Sites', icon: '🏰' },
  { id: 'photography', label: 'Photo Spots', icon: '📸' },
  { id: 'crafts', label: 'DIY & Crafts', icon: '🎨' },
];

const BUDGET_OPTIONS = [
  { value: 'low', label: 'Budget ($15-30/pp)', icon: '💵' },
  { value: 'medium', label: 'Mid-Range ($30-75/pp)', icon: '💰' },
  { value: 'high', label: 'Premium ($75-150+/pp)', icon: '💎' },
];

// ─── Chat step definitions ───
// Steps: greeting → interests → zip → datetime → groupsize → budget → followup → extras → generate
const STEPS = [
  'greeting',
  'interests',
  'zip',
  'datetime',
  'groupsize',
  'budget',
  'followup',
  'extras',
  'generate',
];

function botMsg(text, extra) {
  return { role: 'bot', text, ts: Date.now(), ...extra };
}

function userMsg(text, extra) {
  return { role: 'user', text, ts: Date.now(), ...extra };
}

export default function ChatPlanner({ onPlanGenerated, onCancel }) {
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState('greeting');
  const [input, setInput] = useState('');
  const [data, setData] = useState({
    interests: [],
    zipCode: '',
    date: '',
    startTime: '',
    groupSize: '',
    budget: '',
    followupAnswers: [],
    extras: '',
  });
  const [followupQuestions, setFollowupQuestions] = useState([]);
  const [followupIndex, setFollowupIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, step]);

  // Focus input when step changes
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [step]);

  // Boot: show greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        botMsg(
          "Hey there! I'm your Race Director. Let's plan an epic Amazing Race-style event!",
        ),
        botMsg(
          "First up — what kind of activities does your crew enjoy? Pick as many as you want, then hit Continue.",
          { type: 'interests' },
        ),
      ]);
      setStep('interests');
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // ─── Handlers ───

  const toggleInterest = (id) => {
    setData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const confirmInterests = () => {
    if (data.interests.length === 0) return;
    const names = data.interests.map((id) => INTERESTS.find((i) => i.id === id)?.label).join(', ');
    setMessages((prev) => [
      ...prev,
      userMsg(names, { type: 'interest-summary' }),
      botMsg("Great picks! Now — where's the race happening? Drop your ZIP code."),
    ]);
    setStep('zip');
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;

    switch (step) {
      case 'zip': {
        if (!/^\d{5}$/.test(val)) {
          setMessages((prev) => [...prev, userMsg(val), botMsg("Hmm, that doesn't look like a 5-digit ZIP. Try again!")]);
          setInput('');
          return;
        }
        setData((prev) => ({ ...prev, zipCode: val }));
        setMessages((prev) => [
          ...prev,
          userMsg(val),
          botMsg("Got it! When's the big day? And what time should the race kick off?", { type: 'datetime' }),
        ]);
        setInput('');
        setStep('datetime');
        break;
      }

      case 'groupsize': {
        const num = parseInt(val);
        if (isNaN(num) || num < 2) {
          setMessages((prev) => [...prev, userMsg(val), botMsg("Need at least 2 racers! How many people are coming?")]);
          setInput('');
          return;
        }
        setData((prev) => ({ ...prev, groupSize: val }));
        setMessages((prev) => [
          ...prev,
          userMsg(`${num} people`),
          botMsg("What's the budget vibe?", { type: 'budget' }),
        ]);
        setInput('');
        setStep('budget');
        break;
      }

      case 'followup': {
        const currentQ = followupQuestions[followupIndex];
        setData((prev) => ({
          ...prev,
          followupAnswers: [...prev.followupAnswers, { question: currentQ, answer: val }],
        }));
        const nextIdx = followupIndex + 1;
        if (nextIdx < followupQuestions.length) {
          setMessages((prev) => [
            ...prev,
            userMsg(val),
            botMsg(followupQuestions[nextIdx]),
          ]);
          setFollowupIndex(nextIdx);
        } else {
          setMessages((prev) => [
            ...prev,
            userMsg(val),
            botMsg("Last thing — any special requests? Surprises, themes, dietary needs, or anything else? (Type 'none' to skip)"),
          ]);
          setStep('extras');
        }
        setInput('');
        break;
      }

      case 'extras': {
        const extras = val.toLowerCase() === 'none' ? '' : val;
        setData((prev) => ({ ...prev, extras }));
        setMessages((prev) => [
          ...prev,
          userMsg(val),
          botMsg("Perfect! I've got everything I need. Generating your custom Amazing Race plan now..."),
        ]);
        setInput('');
        setStep('generate');
        generatePlan({ ...data, extras });
        break;
      }

      default:
        break;
    }
  };

  const handleDateTimeSubmit = (e) => {
    e.preventDefault();
    if (!data.date || !data.startTime) return;
    const display = `${data.date} at ${data.startTime}`;
    setMessages((prev) => [
      ...prev,
      userMsg(display),
      botMsg("How many people are joining the race?"),
    ]);
    setStep('groupsize');
  };

  const handleBudgetSelect = (value) => {
    const label = BUDGET_OPTIONS.find((b) => b.value === value)?.label;
    setData((prev) => ({ ...prev, budget: value }));
    setMessages((prev) => [
      ...prev,
      userMsg(label),
      botMsg("Thinking of some tailored questions based on your interests..."),
    ]);
    setStep('followup');
    fetchFollowupQuestions({ ...data, budget: value });
  };

  // ─── AI: Fetch smart follow-up questions based on interests ───
  const fetchFollowupQuestions = async (currentData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: currentData.interests, groupSize: currentData.groupSize }),
      });
      const result = await res.json();
      if (res.ok && result.questions?.length > 0) {
        setFollowupQuestions(result.questions);
        setFollowupIndex(0);
        setMessages((prev) => [
          ...prev.slice(0, -1), // remove "thinking" message
          botMsg("Based on your interests, I've got a few more questions to dial in the perfect experience:"),
          botMsg(result.questions[0]),
        ]);
      } else {
        // Fallback: skip to extras
        setFollowupQuestions([]);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          botMsg("Any special requests? Surprises, themes, dietary needs? (Type 'none' to skip)"),
        ]);
        setStep('extras');
      }
    } catch {
      // Fallback on error
      setFollowupQuestions([]);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        botMsg("Any special requests? Surprises, themes, dietary needs? (Type 'none' to skip)"),
      ]);
      setStep('extras');
    } finally {
      setLoading(false);
    }
  };

  // ─── Generate final plan ───
  const generatePlan = async (finalData) => {
    setLoading(true);
    setError(null);
    try {
      // Build a rich vibe string from interests + follow-up answers
      const interestNames = finalData.interests.map((id) => INTERESTS.find((i) => i.id === id)?.label).join(', ');
      const followupContext = finalData.followupAnswers.map((fa) => `Q: ${fa.question} A: ${fa.answer}`).join('\n');
      const vibe = `Interests: ${interestNames}. ${followupContext}${finalData.extras ? `\nSpecial requests: ${finalData.extras}` : ''}`;

      const res = await fetch('/api/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zipCode: finalData.zipCode,
          date: finalData.date,
          startTime: finalData.startTime,
          groupSize: finalData.groupSize,
          budget: finalData.budget,
          vibe,
          dietaryRestrictions: '',
        }),
      });

      const plan = await res.json();
      if (!res.ok) {
        setError(plan.error || 'Failed to generate plan.');
        setMessages((prev) => [...prev, botMsg(`Oops — ${plan.error || 'something went wrong'}. Try again?`)]);
        setStep('extras'); // allow retry
        return;
      }

      // Brief celebration, then hand off
      setMessages((prev) => [...prev, botMsg("Your race plan is ready! Take a look:")]);
      setTimeout(() => onPlanGenerated(plan), 800);
    } catch {
      setError('Network error — is the API server running?');
      setMessages((prev) => [...prev, botMsg("Network error — make sure the API server is running (npm run dev:server)")]);
      setStep('extras');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render helpers ───

  const renderInterestPicker = () => (
    <div className="chat-interests-grid">
      {INTERESTS.map((interest) => (
        <button
          key={interest.id}
          className={`chat-interest-chip ${data.interests.includes(interest.id) ? 'selected' : ''}`}
          onClick={() => toggleInterest(interest.id)}
        >
          <span className="chip-icon">{interest.icon}</span>
          <span className="chip-label">{interest.label}</span>
        </button>
      ))}
      <div className="chat-interests-action">
        <span className="chip-count">{data.interests.length} selected</span>
        <button
          className="chat-continue-btn"
          onClick={confirmInterests}
          disabled={data.interests.length === 0}
        >
          Continue →
        </button>
      </div>
    </div>
  );

  const renderDateTimePicker = () => (
    <form className="chat-datetime-form" onSubmit={handleDateTimeSubmit}>
      <div className="chat-dt-row">
        <div className="chat-dt-field">
          <label>Date</label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => setData((prev) => ({ ...prev, date: e.target.value }))}
          />
        </div>
        <div className="chat-dt-field">
          <label>Start Time</label>
          <input
            type="time"
            value={data.startTime}
            onChange={(e) => setData((prev) => ({ ...prev, startTime: e.target.value }))}
          />
        </div>
      </div>
      <button
        type="submit"
        className="chat-continue-btn"
        disabled={!data.date || !data.startTime}
      >
        Continue →
      </button>
    </form>
  );

  const renderBudgetPicker = () => (
    <div className="chat-budget-row">
      {BUDGET_OPTIONS.map((b) => (
        <button
          key={b.value}
          className="chat-budget-btn"
          onClick={() => handleBudgetSelect(b.value)}
        >
          <span>{b.icon}</span> {b.label}
        </button>
      ))}
    </div>
  );

  const renderMessage = (msg, idx) => {
    const isBot = msg.role === 'bot';
    return (
      <div key={idx} className={`chat-msg ${isBot ? 'bot' : 'user'}`}>
        {isBot && <div className="chat-avatar">🏁</div>}
        <div className={`chat-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
          <p>{msg.text}</p>
          {/* Render rich widgets inline */}
          {msg.type === 'interests' && step === 'interests' && renderInterestPicker()}
          {msg.type === 'datetime' && step === 'datetime' && renderDateTimePicker()}
          {msg.type === 'budget' && step === 'budget' && renderBudgetPicker()}
        </div>
        {!isBot && <div className="chat-avatar user-avatar">🏃</div>}
      </div>
    );
  };

  const showTextInput = ['zip', 'groupsize', 'followup', 'extras'].includes(step) && !loading;
  const placeholder = {
    zip: 'Enter your 5-digit ZIP code...',
    groupsize: 'How many people?',
    followup: 'Type your answer...',
    extras: 'Any special requests? (or type "none")',
  }[step] || 'Type a message...';

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="chat-back-btn" onClick={onCancel}>← Back</button>
        <div className="chat-header-info">
          <span className="chat-header-flag">🏁</span>
          <div>
            <h3>Race Director</h3>
            <span className="chat-header-status">
              {loading ? 'Thinking...' : 'Online'}
            </span>
          </div>
        </div>
        <div className="chat-header-badge">AI</div>
      </div>

      <div className="chat-messages">
        {messages.map(renderMessage)}
        {loading && (
          <div className="chat-msg bot">
            <div className="chat-avatar">🏁</div>
            <div className="chat-bubble bot-bubble">
              <div className="chat-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {showTextInput && (
        <form className="chat-input-bar" onSubmit={handleTextSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
          />
          <button type="submit" disabled={!input.trim() || loading}>
            Send
          </button>
        </form>
      )}

      {step === 'generate' && loading && (
        <div className="chat-generating-bar">
          <div className="chat-gen-spinner" />
          <span>Building your race plan...</span>
        </div>
      )}
    </div>
  );
}
