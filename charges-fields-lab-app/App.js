import React, { useState, useEffect, useRef } from 'react';
import './styles.css';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Import components
import { TextInput, MeasurementField } from './components/FormComponents';
import { ImageUploader } from './components/ImageComponents';
import { ExperimentalSection, QuestionSection } from './components/SectionComponents';
import { ElectricFieldTable, DoublingExperimentTable, PotentialDistanceTable } from './components/TableComponents';
import { PotentialDistanceChart, PotentialInverseDistanceChart } from './components/ChartComponents';
import { TabNavigation, SimulationView, LayoutSelector } from './components/TabComponents';

// Import constants
import { IMAGE_CONFIG } from './constants/ImageConfig';
import { chargeDoublingRows, distanceDoublingRows } from './constants/TableDefinitons';

// Import utilities
import { calculateFitParameters } from './utils/fitCalculations';
import { prepareAnswersForStorage, saveToLocalStorage, loadFromLocalStorage } from './utils/storage';
import { handleImageUpload, handleRemoveImage } from './utils/imageHandlers';
import { generateComprehensivePDF } from './utils/pdfGenerator';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const appRef = useRef(null);
  const [activeTab, setActiveTab] = useState('simulation');
  const [layout, setLayout] = useState('tabs');
  const [answers, setAnswers] = useState({
    studentName: '',
    semester: '',
    session: '',
    year: '',
    taName: '',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    part1aImage: null,
    part1aCaption: '',
    chargeValue: '',
    chargeUnit: '',
    distanceValue: '',
    distanceUnit: '',
    // Table data
    eMeasUnit: '',
    eCalcUnit: '',
    tableData: {
      eMeasPlusX: '',
      eMeasMinusX: '',
      eMeasPlusY: '',
      eMeasMinusY: '',
      eMeasEAve: '',
      eCalcPlusX: '',
      eCalcMinusX: '',
      eCalcPlusY: '',
      eCalcMinusY: '',
      eCalcEAve: ''
    },
    sampleCalculation: '',
    percentErrorCalculation: '',
    qualitativeObservations: '',
    constantDistanceValue: '',
    constantDistanceUnit: '',
    // Charge doubling table data
    chargeDoublingChargeUnit: '',
    chargeDoublingEMeasUnit: '',
    chargeDoublingECalcUnit: '',
    chargeDoublingData: {
      qEMeas: '',
      qECalc: '',
      twoqEMeas: '',
      twoqECalc: ''
    },
    chargeDoublingObservations: '',
    // Distance doubling data
    constantChargeValue: '',
    constantChargeUnit: '',
    distanceDoublingDistanceUnit: '',
    distanceDoublingEMeasUnit: '',
    distanceDoublingECalcUnit: '',
    distanceDoublingData: {
      rEMeas: '',
      rECalc: '',
      tworEMeas: '',
      tworECalc: ''
    },
    distanceDoublingObservations: '',
    // Part 1B - Electric Potential data
    part1BChargeValue: '',
    part1BChargeUnit: '',
    potentialDistanceUnit: '',
    inverseDistanceUnit: '',
    potentialUnit: '',
    potentialDistanceData: {
      r0: '',
      v0: '',
      r1: '',
      v1: '',
      r2: '',
      v2: '',
      r3: '',
      v3: '',
      r4: '',
      v4: '',
    },
    part1BImage: null,
    part1BCaption: '',
    potentialDistanceResponse: '',
    // Data fitting options
    selectedFitType: '',  // 'proportional' or 'linear'
    fitParameters: null,   // Will store the calculated fit parameters
    inverseDistanceResponse: '',  // New response for the V vs 1/r question
    // Part 2A - Dipole
    part2AImage: null,
    part2ACaption: '',
    // Part 2B - Parallel stacked dipoles
    part2BImage: null,
    part2BCaption: '',
    // Discussion & Conclusion
    discussionConclusion: '',
    // Concept Check Questions
    ccq1: '', // Equipotential surfaces in dipole
    ccq2: '', // Electric field in dipole
    ccq3: '', // Equipotential surfaces in stacked dipoles
    ccq4: '', // Electric field in stacked dipoles
    ccq5: '', // Which geometry generates uniform field
    ccq6: '', // Device design question
    slopeValue: '',
    slopeUnit: '',
    kqValue: '',
    kqUnit: '',
    slopeErrorCalculation: '',
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [part1BImagePreview, setPart1BImagePreview] = useState(null);
  const [part2AImagePreview, setPart2AImagePreview] = useState(null);
  const [part2BImagePreview, setPart2BImagePreview] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfFilename, setPdfFilename] = useState('');
  const [simulationLoaded, setSimulationLoaded] = useState(false);

  // Prevent paste throughout the entire app
  useEffect(() => {
    const preventPaste = (e) => {
      // Allow paste in inputs and textareas
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Prevent copy and cut operations
    const preventCopy = (e) => {
      // Allow copy in inputs and textareas
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Prevent context menu to block right-click paste
    const preventContextMenu = (e) => {
      // Allow context menu in inputs and textareas
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // Prevent text selection via mousedown
    const preventSelection = (e) => {
      // Allow selection in inputs and textareas
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
      }
      
      // Clear any existing selection
      window.getSelection().removeAllRanges();
    };

    // Prevent keyboard shortcuts for paste, copy, cut
    const preventKeyboardShortcuts = (e) => {
      // Allow keyboard shortcuts in inputs and textareas
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
      }
      
      // Check for Ctrl+V or Command+V (paste)
      // Check for Ctrl+C or Command+C (copy)
      // Check for Ctrl+X or Command+X (cut)
      // Check for Ctrl+A or Command+A (select all)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'c' || e.key === 'x' || e.key === 'a')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Get the current ref element
    const appElement = appRef.current;
    
    if (appElement) {
      // Add event listeners to the app container
      appElement.addEventListener('paste', preventPaste, true);
      appElement.addEventListener('copy', preventCopy, true);
      appElement.addEventListener('cut', preventCopy, true);
      appElement.addEventListener('contextmenu', preventContextMenu, true);
      appElement.addEventListener('mousedown', preventSelection, true);
      document.addEventListener('keydown', preventKeyboardShortcuts, true);
      
      // Return cleanup function
      return () => {
        appElement.removeEventListener('paste', preventPaste, true);
        appElement.removeEventListener('copy', preventCopy, true);
        appElement.removeEventListener('cut', preventCopy, true);
        appElement.removeEventListener('contextmenu', preventContextMenu, true);
        appElement.removeEventListener('mousedown', preventSelection, true);
        document.removeEventListener('keydown', preventKeyboardShortcuts, true);
      };
    }
  }, []);

  // Load saved answers on initial mount only
  useEffect(() => {
    const savedAnswers = loadFromLocalStorage();
    if (savedAnswers) {
      setAnswers(savedAnswers);
      
      // Set preview for any images that are already saved as data URLs
      Object.values(IMAGE_CONFIG).forEach(config => {
        const { key } = config;
        if (savedAnswers[key] && typeof savedAnswers[key] === 'string' && 
            savedAnswers[key].startsWith('data:image/')) {
          
          // Set the correct preview based on which image it is
          if (key === 'part1aImage') {
            setImagePreview(savedAnswers[key]);
          } else if (key === 'part1BImage') {
            setPart1BImagePreview(savedAnswers[key]);
          } else if (key === 'part2AImage') {
            setPart2AImagePreview(savedAnswers[key]);
          } else if (key === 'part2BImage') {
            setPart2BImagePreview(savedAnswers[key]);
          }
        }
      });
    }
  }, []);
    
  // Set up auto-save interval separately - keeping this as a backup
  useEffect(() => {
    const saveInterval = setInterval(() => {
      // Get the current answers state inside the callback
      setAnswers(currentAnswers => {
        if (Object.values(currentAnswers).some(a => a)) {
          saveToLocalStorage(currentAnswers);
        }
        return currentAnswers; // Return unchanged state
      });
    }, 30000); // Changed from 5000 to 30000 (30 seconds) since we now save on every change
    
    return () => clearInterval(saveInterval);
  }, []);

  // Add useEffect to fix scrolling issues by overriding CSS styles
  useEffect(() => {
    // Override CSS styles that prevent scrolling
    document.body.style.overflow = 'auto';
    
    // Also fix the lab-app overflow if we're in tab view
    if (appRef.current && layout === 'tabs') {
      appRef.current.style.overflow = 'auto';
      appRef.current.style.height = '100%';
      appRef.current.style.position = 'static';
    }
    
    return () => {
      // Clean up
      document.body.style.overflow = '';
    };
  }, [layout, activeTab]);

  // Add useEffect to load simulation after a short delay
  useEffect(() => {
    // Set a timeout to load the simulation after the component has mounted and rendered
    const timer = setTimeout(() => {
      setSimulationLoaded(true);
    }, 1000); // 1 second delay
    
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (question, value) => {
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [question]: value
      };
      
      // Immediately save changes (now async)
      saveToLocalStorage(newAnswers).then(success => {
        if (success && window.parent !== window) {
          window.parent.postMessage({ 
            type: 'SAVE_PROGRESS', 
            data: prepareAnswersForStorage(newAnswers) 
          }, '*');
        }
      });
      
      return newAnswers;
    });
  };

  // Replace the individual table data handlers with a generic one
  const handleNestedDataChange = (objectKey, field, value) => {
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [objectKey]: {
          ...(prev[objectKey] || {}),
          [field]: value
        }
      };
      
      // Immediately save changes (now async)
      saveToLocalStorage(newAnswers).then(success => {
        if (success && window.parent !== window) {
          window.parent.postMessage({ 
            type: 'SAVE_PROGRESS', 
            data: prepareAnswersForStorage(newAnswers) 
          }, '*');
        }
      });
      
      return newAnswers;
    });
  };

  // Handler for changing fit type
  const handleFitTypeChange = (fitType) => {
    // Set the selected fit type and calculate parameters
    setAnswers(prev => {
      // Calculate parameters
      const parameters = calculateFitParameters(fitType, prev.potentialDistanceData);
      
      const newAnswers = {
        ...prev,
        selectedFitType: fitType,
        fitParameters: parameters
      };
      
      // Immediately save changes (now async)
      saveToLocalStorage(newAnswers).then(success => {
        if (success && window.parent !== window) {
          window.parent.postMessage({ 
            type: 'SAVE_PROGRESS', 
            data: prepareAnswersForStorage(newAnswers) 
          }, '*');
        }
      });
      
      return newAnswers;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save to localStorage (now async)
    saveToLocalStorage(answers).then(success => {
      if (success && window.parent !== window) {
        window.parent.postMessage({ 
          type: 'SUBMIT_ANSWERS', 
          data: prepareAnswersForStorage(answers) 
        }, '*');
      }
      setSubmitted(true);
    });
  };
  
  const handleSaveProgress = async () => {
    // Save to localStorage (now async)
    const success = await saveToLocalStorage(answers);
    
    // Send to parent if we're in an iframe
    if (success && window.parent !== window) {
      window.parent.postMessage({ 
        type: 'SAVE_PROGRESS', 
        data: prepareAnswersForStorage(answers) 
      }, '*');
    }
    
    alert('Progress saved!');
  };

  // New function to handle PDF generation
  const handleGeneratePDF = async () => {
    // First save any unsaved changes
    const saveSuccess = await saveToLocalStorage(answers);
    if (!saveSuccess) {
      alert('There was an error saving your progress before generating the PDF. Please try again.');
      return;
    }
    
    // Set state to show we're generating PDF
    setGeneratingPdf(true);
    setPdfGenerated(false);
    
    try {
      // Generate the PDF
      const filename = await generateComprehensivePDF(answers);
      
      // Update state if successful
      if (filename) {
        setPdfGenerated(true);
        setPdfFilename(filename);
        setTimeout(() => {
          setPdfGenerated(false);
        }, 5000); // Reset state after 5 seconds
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`There was an error generating the PDF: ${error.message || 'Unknown error'}. Please try again or contact support.`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Create a reusable function for rendering question sections
  const renderQuestionSection = (title, description, stateKey, rows = 8) => {
    return (
      <QuestionSection 
        title={title}
        description={description}
        value={answers[stateKey] || ''}
        onChange={(value) => handleChange(stateKey, value)}
        rows={rows}
      />
    );
  };

  // Create a reusable function for rendering experimental sections with text areas
  const renderExperimentalTextSection = (title, stateKey, rows = 6, placeholder = "Show your calculations here...") => {
    return (
      <ExperimentalSection title={title}>
        <textarea 
          value={answers[stateKey] || ''}
          onChange={(e) => handleChange(stateKey, e.target.value)}
          rows={rows}
          placeholder={placeholder}
          onPaste={(e) => e.preventDefault()}
        />
      </ExperimentalSection>
    );
  };

  // Create a reusable function for rendering concept check questions
  const renderConceptCheckQuestion = (question, stateKey, rows = 5) => {
    return (
      <div className="question-container">
        <p className="question-text">{question}</p>
        <textarea 
          value={answers[stateKey] || ''}
          onChange={(e) => handleChange(stateKey, e.target.value)}
          rows={rows}
          placeholder="Write your response here..."
          onPaste={(e) => e.preventDefault()}
        />
      </div>
    );
  };

  // Create a reusable function for rendering measurement fields
  const renderMeasurementField = (label, valueKey, unitKey) => {
    return (
      <MeasurementField 
        label={label}
        value={answers[valueKey]}
        unit={answers[unitKey]}
        onValueChange={(value) => handleChange(valueKey, value)}
        onUnitChange={(value) => handleChange(unitKey, value)}
      />
    );
  };

  // Create a generic ImageUploader component renderer
  const renderImageUploader = (config, title) => {
    const { key, captionKey, id, figureLabel, alt } = config;
    
    // Get the correct preview state and setter based on the key
    let previewState, previewSetter;
    
    if (key === 'part1aImage') {
      previewState = imagePreview;
      previewSetter = setImagePreview;
    } else if (key === 'part1BImage') {
      previewState = part1BImagePreview;
      previewSetter = setPart1BImagePreview;
    } else if (key === 'part2AImage') {
      previewState = part2AImagePreview;
      previewSetter = setPart2AImagePreview;
    } else if (key === 'part2BImage') {
      previewState = part2BImagePreview;
      previewSetter = setPart2BImagePreview;
    }
    
    // Use dedicated upload and remove handlers for this specific image
    const uploadHandler = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Size check - warn if image is too large
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
          alert('Warning: This image is quite large. Consider using a smaller image if you experience saving issues.');
        }
        
        // Create a preview URL for the image
        const previewUrl = URL.createObjectURL(file);
        previewSetter(previewUrl);
        
        // Store the file in answers state and trigger autosave
        setAnswers(prev => {
          const newAnswers = {
            ...prev,
            [key]: file
          };
          
          // Save the image immediately (async)
          saveToLocalStorage(newAnswers).then(success => {
            if (success && window.parent !== window) {
              window.parent.postMessage({ 
                type: 'SAVE_PROGRESS', 
                data: prepareAnswersForStorage(newAnswers) 
              }, '*');
            } else if (!success) {
              alert('There was a problem saving your image. It may be too large for storage.');
            }
          });
          
          return newAnswers;
        });
        
        // Clear the file input (to allow selecting the same file again if needed)
        e.target.value = null;
      }
    };
    
    const removeHandler = () => {
      // Clear the image preview
      if (previewState) {
        // Only revoke if it's an object URL, not a data URL
        if (typeof previewState === 'string' && !previewState.startsWith('data:')) {
          URL.revokeObjectURL(previewState);
        }
        previewSetter(null);
      }
      
      // Clear the image from state and trigger autosave
      setAnswers(prev => {
        const newAnswers = {
          ...prev,
          [key]: null
        };
        
        // Save the change immediately (async)
        saveToLocalStorage(newAnswers).then(success => {
          if (success && window.parent !== window) {
            window.parent.postMessage({ 
              type: 'SAVE_PROGRESS', 
              data: prepareAnswersForStorage(newAnswers) 
            }, '*');
          }
        });
        
        return newAnswers;
      });
    };
    
    return (
      <div className="image-upload-section">
        {title && <h3 className="calculation-heading">{title}</h3>}
        <label htmlFor={id} className="image-upload-label">
          Upload Screenshot
          <input 
            type="file" 
            id={id}
            accept="image/*"
            onChange={uploadHandler}
            onPaste={(e) => e.preventDefault()}
            style={{display: 'none'}}
          />
        </label>
        
        {previewState && (
          <div className="image-preview-container">
            <div className="image-preview">
              <button 
                type="button" 
                className="remove-image-btn" 
                onClick={removeHandler}
                aria-label="Remove image"
              >
                ×
              </button>
              <img src={previewState} alt={alt} />
            </div>
            
            <div className="figure-caption">
              <label htmlFor={captionKey}>{figureLabel}</label>
              <input 
                type="text"
                id={captionKey}
                value={answers[captionKey] || ''}
                onChange={(e) => handleChange(captionKey, e.target.value)}
                placeholder="Enter caption for this figure..."
                onPaste={(e) => e.preventDefault()}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Function to handle tab change
  const handleTabChange = (tab) => {
    // Always mark simulation as loaded for smooth transitions to side-by-side
    if (!simulationLoaded) {
      setSimulationLoaded(true);
    }
    setActiveTab(tab);
  };

  // Function to handle layout change
  const handleLayoutChange = (newLayout) => {
    // Ensure simulation is loaded when switching to side-by-side
    if (newLayout !== 'tabs' && !simulationLoaded) {
      setSimulationLoaded(true);
    }
    setLayout(newLayout);
  };

  return (
    <div 
      className={`lab-app ${layout !== 'tabs' ? 'side-by-side' : ''}`} 
      ref={appRef} 
      data-view={activeTab} 
      data-layout={layout}
      style={{
        position: layout === 'tabs' ? 'static' : 'relative',
        left: '0',
        right: '0',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: layout === 'tabs' ? 'auto' : '',
        height: layout === 'tabs' ? 'auto' : '100vh',
        minHeight: layout === 'tabs' ? '100vh' : ''
      }}
    >
      <div className="app-header">
        <div className="title-container">
          <h1>Charges & Fields Laboratory</h1>
        </div>
      </div>
      
      <LayoutSelector layout={layout} setLayout={handleLayoutChange} />
      
      {layout === 'tabs' && (
        <div className="tab-container" style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid #333',
          width: '100%'
        }}>
          <TabNavigation activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>
      )}
      
      <div className={`content-container ${layout !== 'tabs' ? 'side-by-side' : ''}`} style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        overflow: 'visible',
        height: layout === 'tabs' ? 'auto' : (layout !== 'tabs' ? 'calc(100vh - 120px)' : '')
      }}>
        {simulationLoaded && (
          <div 
            className={`simulation-content ${layout === 'tabs' ? 'tab-content' : ''}`} 
            style={{ 
              display: layout !== 'tabs' ? 'block' : (activeTab === 'simulation' ? 'block' : 'none'),
              visibility: layout !== 'tabs' ? 'visible' : (activeTab === 'simulation' ? 'visible' : 'hidden'),
              position: layout !== 'tabs' ? 'relative' : (activeTab === 'simulation' ? 'relative' : 'absolute'),
              order: layout === 'side-by-side-left' ? 0 : 2,
              flex: layout !== 'tabs' ? 1.5 : 'auto',
              width: layout === 'tabs' && activeTab !== 'simulation' ? '800px' : 'auto',
              height: layout === 'tabs' && activeTab !== 'simulation' ? '600px' : 'auto',
              top: layout === 'tabs' && activeTab !== 'simulation' ? '-9999px' : 'auto',
              left: layout === 'tabs' && activeTab !== 'simulation' ? '-9999px' : 'auto',
              pointerEvents: layout !== 'tabs' ? 'auto' : (activeTab === 'simulation' ? 'auto' : 'none')
            }}
          >
            <SimulationView />
          </div>
        )}
        
        <div 
          className={`lab-content ${layout === 'tabs' ? 'tab-content' : ''}`}
          style={{ 
            display: layout !== 'tabs' ? 'block' : (activeTab === 'lab' ? 'block' : 'none'),
            order: layout === 'side-by-side-right' ? 0 : 2,
            flex: layout !== 'tabs' ? 1 : 'auto',
            margin: layout === 'tabs' ? '0 auto' : '',
            maxWidth: layout === 'tabs' ? '800px' : '',
            overflowY: 'auto',
            height: 'auto',
            minHeight: '100%',
            position: 'relative',
            paddingTop: '20px',
            paddingBottom: '50px'
          }}
        >
          {submitted ? (
            <div className="submission-success">
              <h2>Lab Report Submitted!</h2>
              <p>Your answers have been recorded. Thank you for completing the laboratory exercise.</p>
              <button className="edit-btn" onClick={() => setSubmitted(false)}>Edit Answers</button>
              <button className="pdf-btn" onClick={handleGeneratePDF} disabled={generatingPdf}>
                {generatingPdf ? 'Generating PDF...' : 'Generate PDF Report'}
              </button>
              {pdfGenerated && (
                <div className="pdf-success">
                  <p>PDF Generated Successfully!</p>
                  <p>Filename: {pdfFilename}</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="student-info">
                <div className="info-field">
                  <label htmlFor="studentName">Student's name:</label>
                  <input
                    type="text"
                    id="studentName"
                    value={answers.studentName}
                    onChange={(e) => handleChange('studentName', e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                  />
                </div>
                <div className="semester-group">
                  <div className="info-field">
                    <label htmlFor="semester">Semester:</label>
                    <select
                      id="semester"
                      value={answers.semester}
                      onChange={(e) => handleChange('semester', e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Fall">Fall</option>
                    </select>
                  </div>
                  <div className="info-field">
                    <label htmlFor="session">Session:</label>
                    <select
                      id="session"
                      value={answers.session}
                      onChange={(e) => handleChange('session', e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>
                  <div className="info-field">
                    <label htmlFor="year">Year:</label>
                    <input
                      type="text"
                      id="year"
                      value={answers.year}
                      onChange={(e) => handleChange('year', e.target.value)}
                      placeholder="YYYY"
                      maxLength="4"
                      onPaste={(e) => e.preventDefault()}
                    />
                  </div>
                </div>
                <div className="info-field">
                  <label htmlFor="taName">TA's Name:</label>
                  <input
                    type="text"
                    id="taName"
                    value={answers.taName}
                    onChange={(e) => handleChange('taName', e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                  />
                </div>
              </div>
              
              <div className="question">
                <h2>OBJECTIVE (3 points)</h2>
                <p>Explain the goal of the experiment in your own words. Two or three sentences are sufficient.</p>
                <textarea 
                  value={answers.q1} 
                  onChange={(e) => handleChange('q1', e.target.value)}
                  rows={4}
                  placeholder="Type your answer here..."
                  onPaste={(e) => e.preventDefault()}
                />
              </div>
              
              <h2 className="section-heading">EXPERIMENTAL DATA (6 points) & DATA ANALYSIS & RESULTS (10 points)</h2>
              <h3 className="part-heading">PART 1A: Electric Field of a single point charge:</h3>
              
              <ul className="experiment-instructions">
                <li>Check boxes for "Grid" and "Values".</li>
                <li>Place charge(s) in a reasonable center position, and place four (yellow) sensors at equal distances directly above, below, right and left of the charge.</li>
                <li>Note: use the same values of q and r throughout Part 1A.</li>
              </ul>
              
              <div className="experimental-section">
                <h3 className="calculation-heading">Insert screenshot of the charge distribution with the four sensors (in +x, -x, +y, -y directions).</h3>
                {renderImageUploader(IMAGE_CONFIG.part1a)}
              </div>
              
              <div className="experimental-section measurement-section">
                <div className="measurement-inputs">
                  {renderMeasurementField(
                    "The value of the charge q =",
                    "chargeValue",
                    "chargeUnit"
                  )}
                  
                  {renderMeasurementField(
                    "The distance of each sensor from the point charge r =",
                    "distanceValue",
                    "distanceUnit"
                  )}
                </div>
              </div>
              
              <div className="experimental-section data-table-section">
                <ElectricFieldTable 
                  eMeasUnit={answers.eMeasUnit}
                  eCalcUnit={answers.eCalcUnit}
                  tableData={answers.tableData}
                  onUnitChange={handleChange}
                  onTableDataChange={(field, value) => handleNestedDataChange('tableData', field, value)}
                />
              </div>
              
              {renderExperimentalTextSection(
                "Show a sample calculation of one E<sub>calc</sub> value here:", 
                "sampleCalculation", 
                6, 
                "Show your calculation work here..."
              )}
              
              {renderExperimentalTextSection(
                "Calculate the % error between the average E<sub>meas</sub> and E<sub>calc</sub> values (consider E<sub>calc</sub> as the true value). Show your work.",
                "percentErrorCalculation", 
                6, 
                "Show your calculations here..."
              )}
              
              {renderQuestionSection(
                "Explain your observations qualitatively:", 
                "What happens to the magnitude of the electric field as you place the sensors closer or farther? What happens to the E-field direction at the different locations of the sensors? Is there any pattern/symmetry?",
                "qualitativeObservations"
              )}
              
              <h3 className="subsection-heading">Electric field while doubling the charge at constant distance.</h3>
              
              <ExperimentalSection>
                {renderMeasurementField(
                  "The distance of the sensor from the point charge r =",
                  "constantDistanceValue",
                  "constantDistanceUnit"
                )}
              </ExperimentalSection>
              
              <div className="experimental-section data-table-section">
                <DoublingExperimentTable 
                  rowHeaders={chargeDoublingRows}
                  columnUnit={{
                    label: 'Charge q',
                    value: answers.chargeDoublingChargeUnit,
                    field: 'chargeDoublingChargeUnit'
                  }}
                  eMeasUnit={{
                    value: answers.chargeDoublingEMeasUnit,
                    field: 'chargeDoublingEMeasUnit'
                  }}
                  eCalcUnit={{
                    value: answers.chargeDoublingECalcUnit,
                    field: 'chargeDoublingECalcUnit'
                  }}
                  tableData={answers.chargeDoublingData}
                  onUnitChange={handleChange}
                  onTableDataChange={(field, value) => handleNestedDataChange('chargeDoublingData', field, value)}
                />
              </div>
              
              {renderQuestionSection(
                "Explain your observations qualitatively and quantitatively:", 
                "",
                "chargeDoublingObservations"
              )}
              
              <h3 className="subsection-heading">Electric field while doubling the distance at constant charge.</h3>
              
              <ExperimentalSection>
                {renderMeasurementField(
                  "The value of the charge q =",
                  "constantChargeValue",
                  "constantChargeUnit"
                )}
              </ExperimentalSection>
              
              <div className="experimental-section data-table-section">
                <DoublingExperimentTable 
                  rowHeaders={distanceDoublingRows}
                  columnUnit={{
                    label: 'Distance r',
                    value: answers.distanceDoublingDistanceUnit,
                    field: 'distanceDoublingDistanceUnit'
                  }}
                  eMeasUnit={{
                    value: answers.distanceDoublingEMeasUnit,
                    field: 'distanceDoublingEMeasUnit'
                  }}
                  eCalcUnit={{
                    value: answers.distanceDoublingECalcUnit,
                    field: 'distanceDoublingECalcUnit'
                  }}
                  tableData={answers.distanceDoublingData}
                  onUnitChange={handleChange}
                  onTableDataChange={(field, value) => handleNestedDataChange('distanceDoublingData', field, value)}
                />
              </div>
              
              {renderQuestionSection(
                "Explain your observations qualitatively and quantitatively:", 
                "",
                "distanceDoublingObservations"
              )}
              
              {/* Part 1B - Electric Potential */}
              <h3 className="part-heading">PART 1B: Mapping the Electric Potential for a single point charge:</h3>
              
              <ExperimentalSection>
                <div className="measurement-field">
                  <label>V vs. r at different equipotentials with a charge of q =</label>
                  <div className="value-unit-inputs">
                    <input 
                      type="text"
                      value={answers.part1BChargeValue || ''}
                      onChange={(e) => handleChange('part1BChargeValue', e.target.value)}
                      placeholder="Value"
                      onPaste={(e) => e.preventDefault()}
                    />
                    <input 
                      type="text"
                      value={answers.part1BChargeUnit || ''}
                      onChange={(e) => handleChange('part1BChargeUnit', e.target.value)}
                      placeholder="Unit"
                      onPaste={(e) => e.preventDefault()}
                    />
                  </div>
                </div>
              </ExperimentalSection>
              
              {/* Equipotential map image upload section */}
              <ExperimentalSection>
                {renderImageUploader(
                  IMAGE_CONFIG.part1B, 
                  "Insert screenshot showing the equipotential map, then briefly describe it in the caption."
                )}
              </ExperimentalSection>
              
              <div className="experimental-section data-table-section">
                <PotentialDistanceTable 
                  distanceUnit={answers.potentialDistanceUnit || ''}
                  inverseDistanceUnit={answers.inverseDistanceUnit || ''}
                  potentialUnit={answers.potentialUnit || ''}
                  tableData={answers.potentialDistanceData || {}}
                  onUnitChange={handleChange}
                  onTableDataChange={(field, value) => handleNestedDataChange('potentialDistanceData', field, value)}
                />
              </div>
              
              <ExperimentalSection className="graph-section">
                <h3 className="calculation-heading">Graph of Electric Potential vs. Distance:</h3>
                <div className="dark-mode-graph">
                  <PotentialDistanceChart 
                    tableData={answers.potentialDistanceData} 
                    distanceUnit={answers.potentialDistanceUnit} 
                    potentialUnit={answers.potentialUnit} 
                  />
                </div>
              </ExperimentalSection>
              
              {renderQuestionSection(
                "Analyzing the Relationship Between Electric Potential and Distance:", 
                "How does the electric potential vary with distance from the source? Is the graph of V vs. r linear? How do you know?",
                "potentialDistanceResponse"
              )}
              
              <ExperimentalSection className="graph-section">
                <h3 className="calculation-heading">Graph of Electric Potential vs. Inverse Distance:</h3>
                <div className="dark-mode-graph">
                  <PotentialInverseDistanceChart 
                    tableData={answers.potentialDistanceData} 
                    inverseDistanceUnit={answers.inverseDistanceUnit} 
                    potentialUnit={answers.potentialUnit}
                    selectedFitType={answers.selectedFitType}
                    fitParameters={answers.fitParameters}
                  />
                </div>
                
                <div className="data-fitting-options">
                  <h4>Data Fitting Options:</h4>
                  <div className="fit-buttons">
                    <button 
                      type="button" 
                      className={`fit-btn ${answers.selectedFitType === 'proportional' ? 'active' : ''}`}
                      onClick={() => handleFitTypeChange('proportional')}
                    >
                      Proportional Fit (y = Ax)
                    </button>
                    <button 
                      type="button" 
                      className={`fit-btn ${answers.selectedFitType === 'linear' ? 'active' : ''}`}
                      onClick={() => handleFitTypeChange('linear')}
                    >
                      Linear Fit (y = mx + b)
                    </button>
                    <button 
                      type="button" 
                      className={`fit-btn ${!answers.selectedFitType ? 'active' : ''}`}
                      onClick={() => handleFitTypeChange('')}
                    >
                      No Fit
                    </button>
                  </div>
                  
                  {answers.fitParameters && (
                    <div className="fit-results">
                      <h4>Fit Parameters:</h4>
                      
                      {answers.selectedFitType === 'proportional' ? (
                        <div className="fit-parameters-display">
                          <div className="fit-equation">
                            y = A·x
                          </div>
                          <div className="parameter-table">
                            <div className="parameter-row">
                              <div className="parameter-name">A</div>
                              <div className="parameter-value">{answers.fitParameters.A}</div>
                              <div className="parameter-unit">
                                {answers.potentialUnit && answers.inverseDistanceUnit ? 
                                  `${answers.potentialUnit}·${answers.inverseDistanceUnit}` : ''}
                              </div>
                            </div>
                            <div className="parameter-row">
                              <div className="parameter-name">RMSE</div>
                              <div className="parameter-value">{answers.fitParameters.rmse}</div>
                              <div className="parameter-unit">
                                {answers.potentialUnit ? answers.potentialUnit : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : answers.selectedFitType === 'linear' ? (
                        <div className="fit-parameters-display">
                          <div className="fit-equation">
                            y = mx + b
                          </div>
                          <div className="parameter-table">
                            <div className="parameter-row">
                              <div className="parameter-name">m</div>
                              <div className="parameter-value">{answers.fitParameters.m}</div>
                              <div className="parameter-unit">
                                {answers.potentialUnit && answers.inverseDistanceUnit ? 
                                  `${answers.potentialUnit}·${answers.inverseDistanceUnit}` : ''}
                              </div>
                            </div>
                            <div className="parameter-row">
                              <div className="parameter-name">b</div>
                              <div className="parameter-value">{answers.fitParameters.b}</div>
                              <div className="parameter-unit">
                                {answers.potentialUnit ? answers.potentialUnit : ''}
                              </div>
                            </div>
                            <div className="parameter-row">
                              <div className="parameter-name">RMSE</div>
                              <div className="parameter-value">{answers.fitParameters.rmse}</div>
                              <div className="parameter-unit">
                                {answers.potentialUnit ? answers.potentialUnit : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </ExperimentalSection>
              
              {renderQuestionSection(
                "Analyzing the Relationship Between Electric Potential and Inverse Distance:", 
                "Is the graph of V vs. 1/r linear? How do you know?",
                "inverseDistanceResponse"
              )}
              
              {/* New slope and error calculation fields */}
              <ExperimentalSection>
                <div className="measurement-field">
                  <label>Slope: m =</label>
                  <div className="value-unit-inputs">
                    <input 
                      type="text"
                      value={answers.slopeValue || ''}
                      onChange={(e) => handleChange('slopeValue', e.target.value)}
                      placeholder="Value"
                      onPaste={(e) => e.preventDefault()}
                    />
                    <input 
                      type="text"
                      value={answers.slopeUnit || ''}
                      onChange={(e) => handleChange('slopeUnit', e.target.value)}
                      placeholder="Unit"
                      onPaste={(e) => e.preventDefault()}
                    />
                  </div>
                </div>
              </ExperimentalSection>
              
              {renderExperimentalTextSection(
                "Compute the quantity kq =", 
                "kqCalculation", 
                6, 
                "Show your calculation work here..."
              )}
              
              <ExperimentalSection>
                <div className="measurement-field">
                  <label>Computed kq =</label>
                  <div className="value-unit-inputs">
                    <input 
                      type="text"
                      value={answers.kqValue || ''}
                      onChange={(e) => handleChange('kqValue', e.target.value)}
                      placeholder="Value"
                      onPaste={(e) => e.preventDefault()}
                    />
                    <input 
                      type="text"
                      value={answers.kqUnit || ''}
                      onChange={(e) => handleChange('kqUnit', e.target.value)}
                      placeholder="Unit"
                      onPaste={(e) => e.preventDefault()}
                    />
                  </div>
                </div>
              </ExperimentalSection>
              
              {renderExperimentalTextSection(
                "% error between the slope m and kq (taking kq as the true value) =", 
                "slopeErrorCalculation", 
                6, 
                "Show your calculation work here..."
              )}
              
              {/* Part 2A - Dipole */}
              <h3 className="part-heading">PART 2A: Mapping the Electric Potential for two point charges (called a "dipole"):</h3>
              
              <ExperimentalSection>
                {renderImageUploader(
                  IMAGE_CONFIG.part2A, 
                  "Insert a screen capture of the plot showing the equipotential lines with the magnitude of the potentials given by the Set of Parameters."
                )}
              </ExperimentalSection>
              
              {/* Part 2B - Parallel stacked dipoles */}
              <h3 className="part-heading">PART 2B: Mapping the Electric Potential for parallel, stacked dipoles:</h3>
              
              <ExperimentalSection>
                {renderImageUploader(
                  IMAGE_CONFIG.part2B, 
                  "Insert a screen capture of the plot showing the equipotential lines with the magnitude of the potentials given by the Set of Parameters."
                )}
              </ExperimentalSection>
              
              {/* Discussion & Conclusion Section */}
              <h2 className="section-heading">DISCUSSION & CONCLUSION (10 points)</h2>
              
              <ExperimentalSection>
                <p className="instruction-text">
                  Write your discussion & conclusion below according to the guidelines given in the Lab Report Rubric, found in the Course Information module on Canvas.
                </p>
                <textarea 
                  className="large-textarea"
                  value={answers.discussionConclusion || ''}
                  onChange={(e) => handleChange('discussionConclusion', e.target.value)}
                  rows={12}
                  placeholder="Write your discussion and conclusion here..."
                  onPaste={(e) => e.preventDefault()}
                />
              </ExperimentalSection>
              
              {/* Concept Check Questions */}
              <h2 className="section-heading">Concept Check Questions</h2>
              <p className="instruction-text warning-text">
                If you are not confident with your answer, stop and reach out for help before moving on!
              </p>
              
              <ExperimentalSection title="In part 2A, for the dipole configuration:">
                {renderConceptCheckQuestion(
                  "Are the equipotential surfaces equally separated in the central region between the charges?",
                  "ccq1"
                )}
                
                {renderConceptCheckQuestion(
                  "Is the electric field uniform in the central region between the charges? What makes it uniform/non-uniform?",
                  "ccq2"
                )}
              </ExperimentalSection>
              
              <ExperimentalSection title="In part 2B, for the parallel, stacked dipoles configuration:">
                {renderConceptCheckQuestion(
                  "Are the equipotential surfaces equally separated in the central region between the charges? (Or at least, is the spacing more equal compared to the single dipole configuration?).",
                  "ccq3"
                )}
                
                {renderConceptCheckQuestion(
                  "Is the electric field uniform in the central region between the charges? What makes it uniform/non-uniform? (Or at least, is the field more uniform compared to the single dipole configuration?).",
                  "ccq4"
                )}
              </ExperimentalSection>
              
              <ExperimentalSection>
                {renderConceptCheckQuestion(
                  "Which charge geometry generates a more uniform electric field? Briefly explain your answer, and make sure to mention the distribution of charge and how it affects the equipotentials and electric field lines. Remember to consider the direction of causality (what causes what?).",
                  "ccq5"
                )}
              </ExperimentalSection>
              
              <ExperimentalSection>
                {renderConceptCheckQuestion(
                  "If you needed to design a device that can store a large amount of energy in the electric field, would it be more effective to use two point charges, or two lines of charge? Why?",
                  "ccq6"
                )}
              </ExperimentalSection>
              
              <div className="button-row">
                <button type="button" className="save-btn" onClick={handleSaveProgress}>
                  Save Progress
                </button>
                <button type="button" className="submit-btn" onClick={handleGeneratePDF} disabled={generatingPdf}>
                  {generatingPdf ? 'Generating PDF...' : 'Generate PDF Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 