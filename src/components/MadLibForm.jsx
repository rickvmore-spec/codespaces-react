import React, { useState } from 'react';

const EVENT_TYPES = [
  { value: 'birthday', label: '🎂 Birthday', emoji: '🎂' },
  { value: 'anniversary', label: '💍 Anniversary', emoji: '💍' },
  { value: 'graduation', label: '🎓 Graduation', emoji: '🎓' },
  { value: 'retirement', label: '🏖️ Retirement', emoji: '🏖️' },
  { value: 'promotion', label: '🚀 Promotion', emoji: '🚀' },
  { value: 'other', label: '🎉 Other Celebration', emoji: '🎉' },
];

const ACTIVITY_LEVELS = [
  { value: 'relaxed', label: 'Relaxed', description: 'Easy-going activities, minimal physical effort', icon: '🐢' },
  { value: 'moderate', label: 'Moderate', description: 'Mix of relaxed and active challenges', icon: '🚶' },
  { value: 'active', label: 'Active', description: 'Get moving! Physical challenges included', icon: '🏃' },
  { value: 'extreme', label: 'Extreme', description: 'Full throttle — only for the adventurous!', icon: '🔥' },
];

const DURATIONS = [
  { value: '2hrs', label: '2 Hours', description: 'Quick race — 3 legs', icon: '⚡' },
  { value: '3hrs', label: '3 Hours', description: 'Classic race — 4 legs', icon: '🏁' },
  { value: 'half-day', label: 'Half Day', description: 'Extended race — 5 legs', icon: '☀️' },
  { value: 'full-day', label: 'Full Day', description: 'Epic marathon — 7 legs', icon: '🌅' },
];

const INITIAL_STATE = {
  zipCode: '',
  honoree: '',
  eventType: '',
  activityLevel: '',
  duration: '',
  specialIdeas: '',
};

export default function MadLibForm({ onGenerate }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});

  const steps = [
    { key: 'location', label: 'Location', icon: '📍' },
    { key: 'who', label: 'Who & What', icon: '👤' },
    { key: 'style', label: 'Race Style', icon: '🏁' },
    { key: 'extras', label: 'Final Details', icon: '✨' },
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
      else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode.trim())) newErrors.zipCode = 'Enter a valid 5-digit ZIP code';
    }
    if (step === 1) {
      if (!formData.honoree.trim()) newErrors.honoree = 'Tell us who this is for!';
      if (!formData.eventType) newErrors.eventType = 'Pick an event type';
    }
    if (step === 2) {
      if (!formData.activityLevel) newErrors.activityLevel = 'Choose an activity level';
      if (!formData.duration) newErrors.duration = 'Choose a race duration';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onGenerate(formData);
    }
  };

  const renderProgressBar = () => (
    <div className="form-progress">
      {steps.map((step, idx) => (
        <div
          key={step.key}
          className={`progress-step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
          onClick={() => idx < currentStep && setCurrentStep(idx)}
        >
          <div className="progress-dot">
            {idx < currentStep ? '✓' : step.icon}
          </div>
          <span className="progress-label">{step.label}</span>
        </div>
      ))}
      <div className="progress-line">
        <div className="progress-fill" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} />
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="form-step">
            <div className="step-header">
              <span className="step-icon">📍</span>
              <h2>Where is the race happening?</h2>
              <p className="step-description">We&apos;ll scout the best local venues and activities in your area.</p>
            </div>
            <div className="madlib-sentence">
              <span className="madlib-text">Our Amazing Race takes place in </span>
              <div className="input-wrapper">
                <input
                  type="text"
                  className={`madlib-input zip-input ${errors.zipCode ? 'error' : ''}`}
                  placeholder="ZIP Code"
                  value={formData.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  maxLength={10}
                  autoFocus
                />
                {errors.zipCode && <span className="error-text">{errors.zipCode}</span>}
              </div>
              <span className="madlib-text">!</span>
            </div>
            <div className="location-hint">
              <span className="hint-icon">💡</span>
              Enter your ZIP code and we&apos;ll find the best local adventures nearby.
            </div>
          </div>
        );

      case 1:
        return (
          <div className="form-step">
            <div className="step-header">
              <span className="step-icon">👤</span>
              <h2>Who are we celebrating?</h2>
              <p className="step-description">Tell us about the guest of honor and the occasion.</p>
            </div>
            <div className="madlib-sentence">
              <span className="madlib-text">This epic race is for </span>
              <div className="input-wrapper">
                <input
                  type="text"
                  className={`madlib-input name-input ${errors.honoree ? 'error' : ''}`}
                  placeholder="Name"
                  value={formData.honoree}
                  onChange={(e) => handleChange('honoree', e.target.value)}
                  autoFocus
                />
                {errors.honoree && <span className="error-text">{errors.honoree}</span>}
              </div>
              <span className="madlib-text">&apos;s amazing </span>
              <div className="input-wrapper">
                <div className={`pill-selector ${errors.eventType ? 'error' : ''}`}>
                  {EVENT_TYPES.map((et) => (
                    <button
                      key={et.value}
                      className={`pill ${formData.eventType === et.value ? 'selected' : ''}`}
                      onClick={() => handleChange('eventType', et.value)}
                    >
                      {et.label}
                    </button>
                  ))}
                </div>
                {errors.eventType && <span className="error-text">{errors.eventType}</span>}
              </div>
              <span className="madlib-text">!</span>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <div className="step-header">
              <span className="step-icon">🏁</span>
              <h2>Design the race!</h2>
              <p className="step-description">Choose the intensity and duration of the adventure.</p>
            </div>
            <div className="style-section">
              <h3>Activity Level</h3>
              {errors.activityLevel && <span className="error-text">{errors.activityLevel}</span>}
              <div className="card-selector">
                {ACTIVITY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    className={`style-card ${formData.activityLevel === level.value ? 'selected' : ''}`}
                    onClick={() => handleChange('activityLevel', level.value)}
                  >
                    <span className="card-icon">{level.icon}</span>
                    <span className="card-label">{level.label}</span>
                    <span className="card-desc">{level.description}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="style-section">
              <h3>Race Duration</h3>
              {errors.duration && <span className="error-text">{errors.duration}</span>}
              <div className="card-selector">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.value}
                    className={`style-card ${formData.duration === dur.value ? 'selected' : ''}`}
                    onClick={() => handleChange('duration', dur.value)}
                  >
                    <span className="card-icon">{dur.icon}</span>
                    <span className="card-label">{dur.label}</span>
                    <span className="card-desc">{dur.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <div className="step-header">
              <span className="step-icon">✨</span>
              <h2>Any special ideas?</h2>
              <p className="step-description">Tell us your vision — we&apos;ll make it part of the race!</p>
            </div>
            <div className="special-ideas-section">
              <textarea
                className="madlib-textarea"
                placeholder="E.g., &quot;They love sushi and hiking&quot; or &quot;Include a surprise proposal at the final pit stop&quot; or &quot;Make it 80s themed&quot;..."
                value={formData.specialIdeas}
                onChange={(e) => handleChange('specialIdeas', e.target.value)}
                rows={4}
              />
            </div>
            <div className="race-summary">
              <h3>📋 Race Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Location</span>
                  <span className="summary-value">ZIP: {formData.zipCode}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Celebrating</span>
                  <span className="summary-value">{formData.honoree}&apos;s {formData.eventType}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Intensity</span>
                  <span className="summary-value">{ACTIVITY_LEVELS.find((l) => l.value === formData.activityLevel)?.label}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Duration</span>
                  <span className="summary-value">{DURATIONS.find((d) => d.value === formData.duration)?.label}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="madlib-form-container">
      <div className="form-card">
        <div className="form-envelope-tab">
          <span>✉️</span> Route Info Card
        </div>
        {renderProgressBar()}
        {renderStep()}
        <div className="form-nav">
          {currentStep > 0 && (
            <button className="btn btn-back" onClick={handleBack}>
              ← Back
            </button>
          )}
          <div className="nav-spacer" />
          {currentStep < steps.length - 1 ? (
            <button className="btn btn-next" onClick={handleNext}>
              Next Checkpoint →
            </button>
          ) : (
            <button className="btn btn-generate" onClick={handleSubmit}>
              🏁 Generate My Race!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
