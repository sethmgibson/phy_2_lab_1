import React, { useState, useRef, useEffect } from 'react';

export const LayoutSelector = ({ layout, setLayout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get display text for current layout
  const getLayoutDisplayText = () => {
    switch(layout) {
      case 'tabs':
        return 'Tab View';
      case 'side-by-side-left':
        return 'Side-by-Side (Sim Left)';
      case 'side-by-side-right':
        return 'Side-by-Side (Sim Right)';
      default:
        return 'Select Layout';
    }
  };

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="layout-dropdown" ref={dropdownRef}>
      <button 
        className="layout-dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{getLayoutDisplayText()}</span>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`} 
          width="10" 
          height="6" 
          viewBox="0 0 10 6" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className="layout-dropdown-menu">
          <button 
            className={`layout-option ${layout === 'tabs' ? 'active' : ''}`}
            onClick={() => {
              setLayout('tabs');
              setIsOpen(false);
            }}
          >
            Tab View
          </button>
          <button 
            className={`layout-option ${layout === 'side-by-side-left' ? 'active' : ''}`}
            onClick={() => {
              setLayout('side-by-side-left');
              setIsOpen(false);
            }}
          >
            Side-by-Side (Sim Left)
          </button>
          <button 
            className={`layout-option ${layout === 'side-by-side-right' ? 'active' : ''}`}
            onClick={() => {
              setLayout('side-by-side-right');
              setIsOpen(false);
            }}
          >
            Side-by-Side (Sim Right)
          </button>
        </div>
      )}
    </div>
  );
};

export const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tab-navigation">
      <button 
        className={`tab-button ${activeTab === 'lab' ? 'active' : ''}`}
        onClick={() => setActiveTab('lab')}
      >
        Lab Questions
      </button>
      <button 
        className={`tab-button ${activeTab === 'simulation' ? 'active' : ''}`}
        onClick={() => setActiveTab('simulation')}
      >
        PhET Simulation
      </button>
    </div>
  );
};

export const SimulationView = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="simulation-container">
      {isLoading && (
        <div className="loading-simulation">
          <div className="loading-spinner"></div>
          <p>Loading Simulation...</p>
        </div>
      )}
      <iframe 
        src="https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields_en.html"
        title="Charges and Fields PhET Simulation"
        className="simulation-frame"
        style={{ opacity: isLoading ? 0 : 1 }}
        onLoad={() => setIsLoading(false)}
        allow="fullscreen"
      />
    </div>
  );
}; 