import React, { useState } from 'react';

function RaceElementCard({ element }) {
  const [expanded, setExpanded] = useState(false);

  const renderContent = () => {
    switch (element.type) {
      case 'clue':
        return (
          <div className="element-detail clue-detail">
            <p className="element-tagline">{element.tagline}</p>
            <div className="clue-envelope" onClick={() => setExpanded(!expanded)}>
              {expanded ? (
                <div className="clue-revealed">
                  <p>{element.selectedTemplate}</p>
                </div>
              ) : (
                <div className="clue-sealed">
                  <span className="envelope-icon">✉️</span>
                  <span>Tap to open clue envelope!</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="element-detail activity-detail">
            <div className="activity-header">
              <span className="activity-cat-icon">{element.categoryIcon}</span>
              <div>
                <h4>{element.name}</h4>
                <span className="activity-category">{element.categoryLabel}</span>
              </div>
            </div>
            <p>{element.description}</p>
            <div className="activity-meta">
              <span className="meta-tag">
                ⏱️ ~{element.duration} min
              </span>
              <span className={`meta-tag intensity-${element.intensity}`}>
                {element.intensity === 'low' ? '🟢' : element.intensity === 'medium' ? '🟡' : '🔴'} {element.intensity}
              </span>
            </div>
          </div>
        );

      case 'roadblock':
        return (
          <div className="element-detail roadblock-detail">
            <p className="element-tagline">{element.tagline}</p>
            <p className="element-desc">{element.description}</p>
            <div className="challenge-box">
              <span className="challenge-label">The Challenge:</span>
              <p>{element.selectedChallenge}</p>
            </div>
          </div>
        );

      case 'detour':
        return (
          <div className="element-detail detour-detail">
            <p className="element-tagline">{element.tagline}</p>
            <p className="element-desc">{element.description}</p>
            <div className="detour-options">
              <div className="detour-option option-a">
                <div className="option-header">OPTION A</div>
                <h4>{element.selectedPair.optionA.name}</h4>
                <p>{element.selectedPair.optionA.task}</p>
              </div>
              <div className="detour-vs">OR</div>
              <div className="detour-option option-b">
                <div className="option-header">OPTION B</div>
                <h4>{element.selectedPair.optionB.name}</h4>
                <p>{element.selectedPair.optionB.task}</p>
              </div>
            </div>
          </div>
        );

      case 'speedBump':
        return (
          <div className="element-detail speedbump-detail">
            <p className="element-tagline">{element.tagline}</p>
            {element.optional && <span className="optional-badge">OPTIONAL</span>}
            <div className="challenge-box">
              <p>{element.selectedBump}</p>
            </div>
          </div>
        );

      case 'forkInTheRoad':
        return (
          <div className="element-detail fork-detail">
            <p className="element-tagline">{element.tagline}</p>
            <p className="element-desc">{element.description}</p>
            <div className="fork-paths">
              <div className="fork-path path-a">
                <div className="path-header">🅰️ Path A</div>
                <p>{element.selectedFork.pathA}</p>
              </div>
              <div className="fork-path path-b">
                <div className="path-header">🅱️ Path B</div>
                <p>{element.selectedFork.pathB}</p>
              </div>
            </div>
          </div>
        );

      case 'pitStop':
        return (
          <div className="element-detail pitstop-detail">
            <p className="element-tagline">{element.tagline}</p>
            <div className="pitstop-celebration">
              <span className="celebration-icon">🎉</span>
              <p>{element.selectedCelebration}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`race-element-card element-${element.type}`}
      style={{ borderLeftColor: element.color || '#ccc' }}
    >
      <div className="element-badge" style={{ backgroundColor: element.color || '#666' }}>
        {element.icon || '📌'} {element.label || element.name || element.type.toUpperCase()}
      </div>
      {renderContent()}
    </div>
  );
}

function LegCard({ leg, isActive, onToggle }) {
  return (
    <div className={`leg-card ${isActive ? 'active' : ''}`}>
      <div className="leg-header" onClick={onToggle}>
        <div className="leg-number">LEG {leg.legNumber}</div>
        <div className="leg-info">
          <h3>{leg.name}</h3>
          <span className="leg-duration">~{leg.estimatedDuration} min</span>
        </div>
        <div className="leg-toggle">{isActive ? '▼' : '▶'}</div>
      </div>
      {isActive && (
        <div className="leg-content">
          <div className="leg-route-line">
            {leg.elements.map((element, idx) => (
              <div key={idx} className="route-stop">
                <div className="route-connector">
                  <div className="connector-line" />
                  <div className="connector-dot" style={{ backgroundColor: element.color || '#666' }} />
                </div>
                <RaceElementCard element={element} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RaceRoute({ race, onReset }) {
  const [activeLegs, setActiveLegs] = useState({ 0: true });

  const toggleLeg = (index) => {
    setActiveLegs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const expandAll = () => {
    const all = {};
    race.legs.forEach((_, idx) => { all[idx] = true; });
    setActiveLegs(all);
  };

  const collapseAll = () => {
    setActiveLegs({});
  };

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins} minutes`;
    if (mins === 0) return `${hrs} hour${hrs > 1 ? 's' : ''}`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="race-route-container">
      {/* Race Header */}
      <div className="race-header">
        <div className="race-banner">
          <div className="race-flag-icon">🏁</div>
          <h1 className="race-title">{race.raceName}</h1>
          <p className="race-tagline">{race.raceTagline}</p>
        </div>
        <div className="race-stats">
          <div className="stat">
            <span className="stat-value">{race.totalLegs}</span>
            <span className="stat-label">Legs</span>
          </div>
          <div className="stat">
            <span className="stat-value">{formatDuration(race.totalDuration)}</span>
            <span className="stat-label">Total Time</span>
          </div>
          <div className="stat">
            <span className="stat-value">{race.activityLevel}</span>
            <span className="stat-label">Intensity</span>
          </div>
          <div className="stat">
            <span className="stat-value">ZIP {race.zipCode}</span>
            <span className="stat-label">Location</span>
          </div>
        </div>
        {race.specialNotes && (
          <div className="special-notes-banner">
            <span>✨</span> {race.specialNotes}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="race-controls">
        <button className="btn btn-small" onClick={expandAll}>Expand All</button>
        <button className="btn btn-small" onClick={collapseAll}>Collapse All</button>
        <button className="btn btn-small btn-reset" onClick={onReset}>🔄 Plan New Race</button>
      </div>

      {/* Race Legs */}
      <div className="race-legs">
        <div className="start-banner">
          <span className="start-flag">🚩</span>
          <span>START — &quot;The world is waiting. Travel safe. GO!&quot;</span>
        </div>

        {race.legs.map((leg, idx) => (
          <LegCard
            key={idx}
            leg={leg}
            isActive={!!activeLegs[idx]}
            onToggle={() => toggleLeg(idx)}
          />
        ))}

        <div className="finish-banner">
          <span className="finish-flag">🏆</span>
          <div>
            <strong>FINISH LINE</strong>
            <p>&quot;{race.honoree}, you&apos;ve just completed The Amazing Race!&quot;</p>
          </div>
        </div>
      </div>

      {/* Printable summary */}
      <div className="race-footer">
        <div className="footer-tip">
          <h3>📋 Race Day Tips</h3>
          <ul>
            <li>Print this route and seal each leg in a separate envelope</li>
            <li>Assign a &quot;Phil Keoghan&quot; host at each Pit Stop</li>
            <li>Use a group chat for live updates and photo sharing</li>
            <li>Award prizes for 1st, 2nd, and 3rd place teams</li>
            <li>Record video recaps at each Pit Stop for a highlight reel</li>
          </ul>
        </div>
        <div className="paramount-footer">
          <p>Inspired by <strong>The Amazing Race</strong> on Paramount+</p>
          <p className="footer-stream">Stream full episodes and plan your next adventure</p>
        </div>
      </div>
    </div>
  );
}
