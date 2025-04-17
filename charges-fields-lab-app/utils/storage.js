import { IMAGE_CONFIG } from '../constants/ImageConfig';

// Create a reusable function for handling localStorage
export function prepareAnswersForStorage(currentAnswers) {
  // Create a copy of the answers for storage
  const answersForStorage = { ...currentAnswers };
  
  // Handle all images consistently
  Object.values(IMAGE_CONFIG).forEach(config => {
    const { key } = config;
    if (answersForStorage[key]) {
      // If the image is a File object (not yet converted to data URL)
      if (answersForStorage[key] instanceof File) {
        answersForStorage[key] = 'image_uploaded';
      }
      // If it's a data URL, keep it as is for storage
    }
  });
  
  // Ensure tableData is present
  if (!answersForStorage.tableData) {
    answersForStorage.tableData = {};
  }
  
  return answersForStorage;
}

// Convert File objects to Data URLs for proper storage
export function convertImagesToDataURLs(answers) {
  return new Promise((resolve) => {
    const newAnswers = { ...answers };
    const imageKeys = Object.values(IMAGE_CONFIG).map(config => config.key);
    const pendingConversions = [];
    
    // Convert each File object to a Data URL
    imageKeys.forEach(key => {
      if (newAnswers[key] instanceof File) {
        const file = newAnswers[key];
        const conversion = new Promise((resolveFile) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            try {
              newAnswers[key] = reader.result; // Store as data URL
              console.log(`Successfully converted image ${key} to data URL`);
            } catch (error) {
              console.error(`Error storing data URL for ${key}:`, error);
              newAnswers[key] = 'image_uploaded'; // Fallback marker
            }
            resolveFile();
          };
          reader.onerror = () => {
            console.error('Error reading file:', file.name);
            newAnswers[key] = 'image_uploaded'; // Fallback marker
            resolveFile();
          };
          reader.readAsDataURL(file);
        });
        
        pendingConversions.push(conversion);
      }
    });
    
    // Resolve once all images are converted
    if (pendingConversions.length > 0) {
      Promise.all(pendingConversions).then(() => resolve(newAnswers));
    } else {
      resolve(newAnswers); // No conversions needed
    }
  });
}

// Check if localStorage has enough space for the data
function hasEnoughLocalStorageSpace(data) {
  try {
    const serializedData = JSON.stringify(data);
    const dataSize = serializedData.length * 2; // Approximate size in bytes
    
    // Check if we have enough space (5MB is typical localStorage limit)
    const storageLimit = 5 * 1024 * 1024; // 5MB in bytes
    
    if (dataSize > storageLimit) {
      console.error(`Data size (${dataSize} bytes) exceeds storage limit (${storageLimit} bytes)`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking localStorage space:', error);
    return false;
  }
}

// Save answers to localStorage
export async function saveToLocalStorage(answers) {
  try {
    // First convert any File objects to data URLs
    const processedAnswers = await convertImagesToDataURLs(answers);
    
    // Then prepare for storage
    const answersForStorage = prepareAnswersForStorage(processedAnswers);
    
    // Check if we have enough space
    if (!hasEnoughLocalStorageSpace(answersForStorage)) {
      console.error('Not enough localStorage space to save data with images');
      
      // Try saving without the image data URLs, keeping only the markers
      const reducedAnswers = { ...answersForStorage };
      Object.values(IMAGE_CONFIG).forEach(config => {
        const { key } = config;
        if (reducedAnswers[key] && typeof reducedAnswers[key] === 'string' && 
            reducedAnswers[key].startsWith('data:image/')) {
          reducedAnswers[key] = 'image_uploaded';
        }
      });
      
      // Save the reduced version
      localStorage.setItem('charges_fields_answers', JSON.stringify(reducedAnswers));
      console.log('Saved answers without image data due to storage limitations');
      return true;
    }
    
    // Save to localStorage
    localStorage.setItem('charges_fields_answers', JSON.stringify(answersForStorage));
    console.log('Successfully saved answers with all image data');
    
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

// Load answers from localStorage
export function loadFromLocalStorage() {
  const savedAnswers = localStorage.getItem('charges_fields_answers');
  if (!savedAnswers) return null;
  
  try {
    const parsedAnswers = JSON.parse(savedAnswers);
    
    // Handle legacy data that might have sectionNumber instead of semester/session/year
    if (parsedAnswers.sectionNumber && !parsedAnswers.semester) {
      parsedAnswers.semester = '';
      parsedAnswers.session = '';
      parsedAnswers.year = '';
      delete parsedAnswers.sectionNumber;
    }
    
    // Process all image data
    Object.values(IMAGE_CONFIG).forEach(config => {
      const { key } = config;
      
      // If it's a data URL, keep it as is
      if (parsedAnswers[key] && typeof parsedAnswers[key] === 'string' && 
          parsedAnswers[key].startsWith('data:image/')) {
        console.log(`Found valid data URL for ${key}, preserving it`);
        // The data URL is already properly formatted, keep it
      } 
      // For image_uploaded flags, set to null so the UI allows re-uploading
      else if (parsedAnswers[key] === 'image_uploaded') {
        console.log(`Found image_uploaded marker for ${key}, clearing it to allow re-upload`);
        parsedAnswers[key] = null;
      }
    });
    
    // Ensure all captions exist
    Object.values(IMAGE_CONFIG).forEach(config => {
      const { captionKey } = config;
      if (parsedAnswers[captionKey] === undefined) {
        parsedAnswers[captionKey] = '';
      }
    });
    
    // Ensure tableData exists with all required fields
    if (!parsedAnswers.tableData) {
      parsedAnswers.tableData = {
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
      };
    }
    
    // Ensure charge doubling table data exists
    if (!parsedAnswers.chargeDoublingData) {
      parsedAnswers.chargeDoublingData = {
        qEMeas: '',
        qECalc: '',
        twoqEMeas: '',
        twoqECalc: ''
      };
    }
    
    // Ensure distance doubling table data exists
    if (!parsedAnswers.distanceDoublingData) {
      parsedAnswers.distanceDoublingData = {
        rEMeas: '',
        rECalc: '',
        tworEMeas: '',
        tworECalc: ''
      };
    }
    
    // Ensure potential distance table data exists
    if (!parsedAnswers.potentialDistanceData) {
      parsedAnswers.potentialDistanceData = {
        r0: '',
        v0: '',
        r1: '',
        v1: '',
        r2: '',
        v2: '',
        r3: '',
        v3: '',
        r4: '',
        v4: ''
      };
    }
    
    // Ensure all unit fields exist
    const unitFields = [
      'eMeasUnit', 'eCalcUnit', 
      'chargeDoublingChargeUnit', 'chargeDoublingEMeasUnit', 'chargeDoublingECalcUnit',
      'distanceDoublingDistanceUnit', 'distanceDoublingEMeasUnit', 'distanceDoublingECalcUnit',
      'potentialDistanceUnit', 'potentialUnit', 'inverseDistanceUnit'
    ];
    
    unitFields.forEach(field => {
      if (parsedAnswers[field] === undefined) {
        parsedAnswers[field] = '';
      }
    });
    
    return parsedAnswers;
  } catch (e) {
    console.error('Failed to parse saved answers', e);
    return null;
  }
} 