import React from 'react';

// TextInput component for single and multi-line text inputs
export function TextInput({ id, value, onChange, placeholder = "", rows = 1 }) {
  const handleChange = (e) => onChange(e.target.value);
  return rows > 1 ? (
    <textarea
      id={id}
      value={value || ''}
      onChange={handleChange}
      rows={rows}
      placeholder={placeholder}
      onPaste={(e) => e.preventDefault()}
    />
  ) : (
    <input
      type="text"
      id={id}
      value={value || ''}
      onChange={handleChange}
      placeholder={placeholder}
      onPaste={(e) => e.preventDefault()}
    />
  );
}

// MeasurementField component for value/unit pairs
export function MeasurementField({ label, value, unit, onValueChange, onUnitChange }) {
  return (
    <div className="measurement-field">
      <label>{label}</label>
      <div className="value-unit-inputs">
        <input 
          type="text"
          value={value || ''}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="Value"
          onPaste={(e) => e.preventDefault()}
        />
        <input 
          type="text"
          value={unit || ''}
          onChange={(e) => onUnitChange(e.target.value)}
          placeholder="Unit"
          onPaste={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
} 