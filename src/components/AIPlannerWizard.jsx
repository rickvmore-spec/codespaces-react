import React, { useState } from 'react';
import './AIPlannerWizard.css';

const VIBE_OPTIONS = [
  { value: 'casual', label: 'Casual & Fun', icon: '😎' },
  { value: 'fancy', label: 'Upscale & Fancy', icon: '🥂' },
  { value: 'outdoor', label: 'Outdoor Adventure', icon: '🌿' },
  { value: 'family', label: 'Family-Friendly', icon: '👨‍👩‍👧‍👦' },
  { value: 'dog-friendly', label: 'Dog-Friendly', icon: '🐕' },
  { value: 'nightlife', label: 'Nightlife & Party', icon: '🌙' },
];

const BUDGET_OPTIONS = [
  { value: 'low', label: 'Budget-Friendly', range: '$15-30/person', icon: '💵' },
  { value: 'medium', label: 'Mid-Range', range: '$30-75/person', icon: '💰' },
  { value: 'high', label: 'Premium', range: '$75-150+/person', icon: '💎' },
];

const INITIAL = {
  zipCode: '',
  date: '',
  startTime: '',
  groupSize: '',
  budget: '',
  vibe: '',
  dietaryRestrictions: '',
};

export default function AIPlannerWizard({ onPlanGenerated, onCancel }) {
  const [form, setForm] = useState(INITIAL);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const steps = [
    { key: 'when-where', label: 'When & Where', icon: '📍' },
    { key: 'group', label: 'Group & Budget', icon: '👥' },
    { key: 'vibe', label: 'Vibe & Extras', icon: '✨' },
  ];

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
    setApiError(null);
  };

  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.zipCode.trim()) e.zipCode = 'Required';
      else if (!/^\d{5}$/.test(form.zipCode.trim())) e.zipCode = 'Enter a 5-digit ZIP';
      if (!form.date) e.date = 'Pick a date';
      if (!form.startTime) e.startTime = 'Pick a start time';
    }
    if (s === 1) {
      if (!form.groupSize || parseInt(form.groupSize) < 2) e.groupSize = 'At least 2 people';
      if (!form.budget) e.budget = 'Select a budget';
    }
    if (s === 2) {
      if (!form.vibe) e.vibe = 'Pick a vibe';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validate(step)) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!validate(step)) return;
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch('/api/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      onPlanGenerated(data);
    } catch (err) {
      setApiError('Network error — is the API server running? (npm run dev:server)');
    } finally {
      setLoading(false);
    }
  };

  // Loading overlay
  if (loading) {
    return (
      <div className="aiw-container">
        <div className="aiw-card">
          <div className="aiw-loading">
            <div className="aiw-spinner" />
            <h2>Planning your adventure...</h2>
            <p>Our AI race director is scouting venues, mapping routes, and hiding clues in your area...</p>
            <div className="aiw-loading-steps">
              <span>📍 Resolving location</span>
              <span>🗺️ Finding venues</span>
              <span>🧠 Building itinerary</span>
              <span>🏁 Finalizing plan</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aiw-container">
      <div className="aiw-card">
        <div className="aiw-rainbow-bar" />
        <div className="aiw-header">
          <span className="aiw-badge">🤖 AI-POWERED</span>
          <h2>Smart Race Planner</h2>
          <p>Tell us the basics — our AI builds a complete Amazing Race event tailored to your city.</p>
        </div>

        {/* Progress */}
        <div className="aiw-progress">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`aiw-progress-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => i < step && setStep(i)}
            >
              <div className="aiw-progress-dot">{i < step ? '✓' : s.icon}</div>
              <span>{s.label}</span>
            </div>
          ))}
          <div className="aiw-progress-track">
            <div className="aiw-progress-fill" style={{ width: `${(step / (steps.length - 1)) * 100}%` }} />
          </div>
        </div>

        {apiError && (
          <div className="aiw-error-banner">
            <span>⚠️</span> {apiError}
          </div>
        )}

        {/* Step 0: When & Where */}
        {step === 0 && (
          <div className="aiw-step">
            <div className="aiw-field">
              <label>ZIP Code</label>
              <input
                type="text"
                className={errors.zipCode ? 'error' : ''}
                placeholder="e.g. 90210"
                value={form.zipCode}
                onChange={(e) => set('zipCode', e.target.value)}
                maxLength={5}
                autoFocus
              />
              {errors.zipCode && <span className="aiw-field-error">{errors.zipCode}</span>}
            </div>
            <div className="aiw-field-row">
              <div className="aiw-field">
                <label>Date</label>
                <input
                  type="date"
                  className={errors.date ? 'error' : ''}
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                />
                {errors.date && <span className="aiw-field-error">{errors.date}</span>}
              </div>
              <div className="aiw-field">
                <label>Start Time</label>
                <input
                  type="time"
                  className={errors.startTime ? 'error' : ''}
                  value={form.startTime}
                  onChange={(e) => set('startTime', e.target.value)}
                />
                {errors.startTime && <span className="aiw-field-error">{errors.startTime}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Group & Budget */}
        {step === 1 && (
          <div className="aiw-step">
            <div className="aiw-field">
              <label>Group Size</label>
              <input
                type="number"
                className={errors.groupSize ? 'error' : ''}
                placeholder="Number of people"
                value={form.groupSize}
                onChange={(e) => set('groupSize', e.target.value)}
                min={2}
                max={100}
              />
              {errors.groupSize && <span className="aiw-field-error">{errors.groupSize}</span>}
            </div>
            <div className="aiw-field">
              <label>Budget</label>
              {errors.budget && <span className="aiw-field-error">{errors.budget}</span>}
              <div className="aiw-budget-cards">
                {BUDGET_OPTIONS.map((b) => (
                  <button
                    key={b.value}
                    className={`aiw-budget-card ${form.budget === b.value ? 'selected' : ''}`}
                    onClick={() => set('budget', b.value)}
                  >
                    <span className="aiw-budget-icon">{b.icon}</span>
                    <span className="aiw-budget-label">{b.label}</span>
                    <span className="aiw-budget-range">{b.range}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vibe & Extras */}
        {step === 2 && (
          <div className="aiw-step">
            <div className="aiw-field">
              <label>Vibe</label>
              {errors.vibe && <span className="aiw-field-error">{errors.vibe}</span>}
              <div className="aiw-vibe-grid">
                {VIBE_OPTIONS.map((v) => (
                  <button
                    key={v.value}
                    className={`aiw-vibe-pill ${form.vibe === v.value ? 'selected' : ''}`}
                    onClick={() => set('vibe', v.value)}
                  >
                    <span>{v.icon}</span> {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="aiw-field">
              <label>Dietary Restrictions <span className="aiw-optional">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. vegetarian, nut allergy, halal"
                value={form.dietaryRestrictions}
                onChange={(e) => set('dietaryRestrictions', e.target.value)}
              />
            </div>
            {/* Summary */}
            <div className="aiw-summary">
              <h4>Your Race Brief</h4>
              <div className="aiw-summary-grid">
                <span>📍 ZIP {form.zipCode}</span>
                <span>📅 {form.date}</span>
                <span>⏰ {form.startTime}</span>
                <span>👥 {form.groupSize} people</span>
                <span>{BUDGET_OPTIONS.find((b) => b.value === form.budget)?.icon} {BUDGET_OPTIONS.find((b) => b.value === form.budget)?.label}</span>
                <span>{VIBE_OPTIONS.find((v) => v.value === form.vibe)?.icon} {VIBE_OPTIONS.find((v) => v.value === form.vibe)?.label}</span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="aiw-nav">
          {step > 0 ? (
            <button className="aiw-btn aiw-btn-back" onClick={back}>← Back</button>
          ) : (
            <button className="aiw-btn aiw-btn-back" onClick={onCancel}>← Cancel</button>
          )}
          <div className="aiw-nav-spacer" />
          {step < steps.length - 1 ? (
            <button className="aiw-btn aiw-btn-next" onClick={next}>Next →</button>
          ) : (
            <button className="aiw-btn aiw-btn-submit" onClick={submit}>
              🤖 Generate AI Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
