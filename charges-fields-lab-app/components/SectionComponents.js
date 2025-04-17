import React from 'react';

// ExperimentalSection component
export function ExperimentalSection({ title, children, className = "" }) {
  return (
    <div className={`experimental-section ${className}`}>
      {title && (
        typeof title === 'string' 
          ? <h3 className="calculation-heading" dangerouslySetInnerHTML={{ __html: title }} />
          : <h3 className="calculation-heading">{title}</h3>
      )}
      {children}
    </div>
  );
}

// QuestionSection component
export function QuestionSection({ title, description, value, onChange, rows = 8 }) {
  return (
    <ExperimentalSection title={title}>
      {description && <p className="question-text">{description}</p>}
      <textarea 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder="Write your response here..."
        onPaste={(e) => e.preventDefault()}
      />
    </ExperimentalSection>
  );
} 