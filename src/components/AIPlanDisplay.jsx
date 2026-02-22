import React from 'react';
import './AIPlanDisplay.css';

function TimelineCard({ item, index }) {
  const startTime = new Date(item.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(item.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="aip-timeline-card">
      <div className="aip-timeline-connector">
        <div className="aip-timeline-line" />
        <div className="aip-timeline-dot">
          <span>{index + 1}</span>
        </div>
      </div>
      <div className="aip-timeline-body">
        <div className="aip-timeline-time">
          {startTime} — {endTime}
        </div>
        <h4 className="aip-timeline-title">{item.title}</h4>
        <p className="aip-timeline-desc">{item.description}</p>
        <div className="aip-timeline-location">
          <span className="aip-loc-icon">📍</span>
          <div>
            <strong>{item.location.name}</strong>
            <span className="aip-loc-address">{item.location.address}</span>
          </div>
        </div>
        {item.booking_required && (
          <div className="aip-booking-tag">
            <span>📞</span> Booking recommended
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIPlanDisplay({ plan, onReset }) {
  if (!plan) return null;

  const meta = plan._meta;

  return (
    <div className="aip-container">
      {/* Header */}
      <div className="aip-header">
        <span className="aip-ai-badge">🤖 AI-GENERATED PLAN</span>
        <h1 className="aip-title">Your Amazing Race</h1>
        {meta?.location && (
          <p className="aip-location">
            📍 {meta.location.city}, {meta.location.state} — {meta.params.date} at {meta.params.startTime}
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="aip-section aip-summary-section">
        <div className="aip-summary-text">{plan.summary}</div>
      </div>

      {/* Budget */}
      <div className="aip-section aip-budget-section">
        <h3>💰 Budget Breakdown</h3>
        <div className="aip-budget-row">
          <div className="aip-budget-item">
            <span className="aip-budget-number">${plan.budget.estimated_total}</span>
            <span className="aip-budget-label">Estimated Total</span>
          </div>
          <div className="aip-budget-divider" />
          <div className="aip-budget-item">
            <span className="aip-budget-number">${plan.budget.per_person}</span>
            <span className="aip-budget-label">Per Person</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="aip-section aip-timeline-section">
        <h3>🗺️ Race Timeline</h3>
        <div className="aip-timeline">
          {plan.timeline.map((item, idx) => (
            <TimelineCard key={idx} item={item} index={idx} />
          ))}
        </div>
      </div>

      {/* Shopping List */}
      {plan.shopping_list?.length > 0 && (
        <div className="aip-section aip-shopping-section">
          <h3>🛒 Shopping List</h3>
          <ul className="aip-shopping-list">
            {plan.shopping_list.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Host Message */}
      {plan.host_message && (
        <div className="aip-section aip-host-section">
          <div className="aip-host-message">
            <span className="aip-host-icon">💬</span>
            <div>
              <h4>Message from the Race Director</h4>
              <p>{plan.host_message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="aip-actions">
        <button className="print-btn" onClick={() => window.print()}>
          🖨️ Print / Save PDF
        </button>
        <button className="aiw-btn aiw-btn-back" onClick={onReset}>
          🔄 Plan Another Race
        </button>
      </div>

      <div className="aip-footer">
        <p>Powered by AI — Inspired by <strong>The Amazing Race</strong> on Paramount+</p>
      </div>
    </div>
  );
}
