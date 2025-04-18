import jsPDF from 'jspdf';
// Use the global html2canvas variable instead of importing it
// import html2canvas from 'html2canvas';

// Helper function to add text to PDF with proper line wrapping
const addWrappedText = (pdf, text, x, y, maxWidth) => {
  if (!text || text.trim() === '') {
    pdf.setTextColor(255, 0, 0);
    pdf.text("No answer", x, y);
    pdf.setTextColor(0, 0, 0);
    return y + 10;
  }
  
  const splitText = pdf.splitTextToSize(text, maxWidth);
  pdf.text(splitText, x, y);
  return y + splitText.length * 7 + 5;
};

// Helper function to check and add a new page if needed
const addPageIfNeeded = (pdf, currentY, minSpaceNeeded) => {
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  if (currentY + minSpaceNeeded > pdfHeight - 20) {
    pdf.addPage();
    return 20; // Return the new Y position at the top of the page
  }
  
  return currentY; // Return the current Y position if no new page needed
};

// Helper for applying light theme styling to an element
const applyLightTheme = (element) => {
  if (!element) return;
  element.style.backgroundColor = 'white';
  element.style.color = '#000000';
  
  // Apply light mode to all child elements
  const children = element.querySelectorAll('*');
  children.forEach(el => {
    el.style.backgroundColor = 'white';
    el.style.color = '#000000';
  });
  
  // Handle specific dark mode elements
  const darkModeElements = element.querySelectorAll('.dark-mode-graph, .chart-container, .dark-bg');
  darkModeElements.forEach(div => {
    div.style.backgroundColor = '#FFFFFF';
    div.style.color = '#000000';
    div.classList.remove('dark-mode-graph');
    div.classList.remove('dark-bg');
  });
};

// Helper for styling tables consistently
const styleTable = (table) => {
  if (!table) return;
  
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.border = '1px solid #000';
  table.style.backgroundColor = '#FFFFFF';
  table.style.color = '#000000';
  
  // Style table headers
  const headers = table.querySelectorAll('th');
  headers.forEach(header => {
    header.style.backgroundColor = '#f2f2f2';
    header.style.color = '#000000';
    header.style.border = '1px solid #000';
    header.style.padding = '8px';
    header.style.textAlign = 'left';
  });
  
  // Style table cells
  const cells = table.querySelectorAll('td');
  cells.forEach(cell => {
    cell.style.backgroundColor = '#FFFFFF';
    cell.style.color = '#000000';
    cell.style.border = '1px solid #000';
    cell.style.padding = '8px';
  });
};

// Helper to draw a chart axis
const drawChartAxis = (ctx, width, height) => {
  ctx.beginPath();
  ctx.moveTo(50, 250);
  ctx.lineTo(450, 250); // x-axis
  ctx.moveTo(50, 250);
  ctx.lineTo(50, 50);   // y-axis
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000000';
  ctx.stroke();
  
  // Add axis arrowheads
  // X-axis arrowhead
  ctx.beginPath();
  ctx.moveTo(450, 250);
  ctx.lineTo(445, 245);
  ctx.lineTo(445, 255);
  ctx.closePath();
  ctx.fillStyle = '#000000';
  ctx.fill();
  
  // Y-axis arrowhead
  ctx.beginPath();
  ctx.moveTo(50, 50);
  ctx.lineTo(45, 55);
  ctx.lineTo(55, 55);
  ctx.closePath();
  ctx.fillStyle = '#000000';
  ctx.fill();
};

// Helper to draw axis labels with backgrounds
const drawAxisLabel = (ctx, text, isXAxis, width, height) => {
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000000';
  
  const textWidth = ctx.measureText(text).width;
  
  if (isXAxis) {
    // Add background to x-axis label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(width/2 - textWidth/2 - 5, 260, textWidth + 10, 20);
    
    // Draw the x-axis label text
    ctx.fillStyle = '#000000';
    ctx.fillText(text, width/2, 275);
  } else {
    // Y-axis label with rotation and background
    ctx.save();
    ctx.translate(25, height/2);
    ctx.rotate(-Math.PI/2);
    
    // Add background to y-axis label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(-textWidth/2 - 5, -10, textWidth + 10, 20);
    
    // Draw the y-axis label text
    ctx.fillStyle = '#000000';
    ctx.fillText(text, 0, 5);
    
    ctx.restore();
  }
};

// Helper to create a replacement for form inputs
const createFormElementReplacement = (element, type) => {
  if (!element || !element.parentNode) return;
  
  let replacementElement;
  let hasValue = element.value && element.value.trim() !== '';
  
  if (type === 'textarea') {
    replacementElement = document.createElement('div');
    replacementElement.style.border = '1px solid #000';
    replacementElement.style.padding = '10px';
    replacementElement.style.minHeight = '50px';
    replacementElement.style.marginBottom = '10px';
    replacementElement.style.backgroundColor = '#f9f9f9';
    
    if (!hasValue) {
      replacementElement.textContent = 'No answer';
      replacementElement.style.color = 'red';
      replacementElement.style.fontWeight = 'bold';
    } else {
      replacementElement.textContent = element.value;
      replacementElement.style.color = '#000000';
    }
  } else if (type === 'input') {
    replacementElement = document.createElement('span');
    replacementElement.style.border = '1px solid #000';
    replacementElement.style.padding = '5px 10px';
    replacementElement.style.marginRight = '5px';
    replacementElement.style.backgroundColor = '#f9f9f9';
    replacementElement.style.display = 'inline-block';
    
    if (!hasValue) {
      replacementElement.textContent = 'No value';
      replacementElement.style.color = 'red';
      replacementElement.style.fontWeight = 'bold';
    } else {
      replacementElement.textContent = element.value;
      replacementElement.style.color = '#000000';
    }
  } else if (type === 'select') {
    replacementElement = document.createElement('span');
    replacementElement.style.border = '1px solid #000';
    replacementElement.style.padding = '5px 10px';
    replacementElement.style.backgroundColor = '#f9f9f9';
    replacementElement.style.display = 'inline-block';
    
    const selectedValue = element.options[element.selectedIndex]?.text || '';
    
    if (selectedValue === 'Select' || selectedValue === '') {
      replacementElement.textContent = 'No selection';
      replacementElement.style.color = 'red';
      replacementElement.style.fontWeight = 'bold';
    } else {
      replacementElement.textContent = selectedValue;
      replacementElement.style.color = '#000000';
    }
  }
  
  if (replacementElement) {
    element.parentNode.replaceChild(replacementElement, element);
  }
};

// Helper to draw data points on a canvas chart
const drawDataPoints = (ctx, xValues, yValues, xMin, xMax, yMin, yMax, color) => {
  if (xValues.length === 0) return;

  // Add some padding
  const xRange = Math.max(0.1, xMax - xMin);
  const yRange = Math.max(0.1, yMax - yMin);
  
  // Scaling functions
  const xScale = (x) => 50 + 400 * (x - xMin) / (xRange * 1.1);
  const yScale = (y) => 250 - 200 * (y - yMin) / (yRange * 1.1);
  
  // Plot points
  for (let i = 0; i < xValues.length; i++) {
    const xPos = xScale(xValues[i]);
    const yPos = yScale(yValues[i]);
    
    // Draw data point
    ctx.beginPath();
    ctx.arc(xPos, yPos, 5, 0, 2 * Math.PI);
    ctx.fillStyle = color || '#FF0000';
    ctx.fill();
  }
  
  return { xScale, yScale, xMin, xMax };
};

// Helper function to draw chart fit line
const drawFitLine = (ctx, fitType, params, scalingInfo) => {
  if (!fitType || !params) return;
  
  const { xScale, yScale, xMin, xMax } = scalingInfo;
  
  ctx.beginPath();
  
  if (fitType === 'proportional') {
    // Draw proportional fit line (y = Ax)
    const A = params.A || 0;
    
    // Start from the minimum x value
    let xStart = xMin;
    let yStart = A * xStart;
    ctx.moveTo(xScale(xStart), yScale(yStart));
    
    // Draw to the maximum x value
    let xEnd = xMax * 1.1;
    let yEnd = A * xEnd;
    ctx.lineTo(xScale(xEnd), yScale(yEnd));
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00AA00';
    ctx.stroke();
    
    // Add fit equation
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#000000';
    ctx.fillText(`y = Ax`, 300, 70);
    ctx.fillText(`A = ${A.toFixed(2)}`, 300, 90);
  } 
  else if (fitType === 'linear') {
    // Draw linear fit line (y = mx + b)
    const m = params.m || 0;
    const b = params.b || 0;
    
    // Start from the minimum x value
    let xStart = xMin;
    let yStart = m * xStart + b;
    ctx.moveTo(xScale(xStart), yScale(yStart));
    
    // Draw to the maximum x value
    let xEnd = xMax * 1.1;
    let yEnd = m * xEnd + b;
    ctx.lineTo(xScale(xEnd), yScale(yEnd));
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00AA00';
    ctx.stroke();
    
    // Add fit equation
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#000000';
    ctx.fillText(`y = mx + b`, 300, 70);
    ctx.fillText(`m = ${m.toFixed(2)}`, 300, 90);
    ctx.fillText(`b = ${b.toFixed(2)}`, 300, 110);
  }
};

// Helper to prepare chart data
const prepareChartData = (data, isInverse = false) => {
  const xValues = [];
  const yValues = [];
  
  // Extract valid numerical data points
  for (let i = 0; i <= 4; i++) {
    const r = parseFloat(data[`r${i}`]);
    const v = parseFloat(data[`v${i}`]);
    if (!isNaN(r) && !isNaN(v) && (isInverse ? r !== 0 : true)) {
      xValues.push(isInverse ? 1/r : r);
      yValues.push(v);
    }
  }
  
  return { xValues, yValues };
};

// Draw chart on canvas
const drawChart = (canvas, data, options) => {
  if (!canvas) return;
  
  const { title, isInverse, distanceUnit, inverseDistanceUnit, potentialUnit, fitType, fitParameters } = options;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Set dimensions
  canvas.style.display = 'block';
  canvas.style.width = '500px';
  canvas.style.height = '300px';
  canvas.width = 500;
  canvas.height = 300;
  canvas.style.border = '1px solid black';
  
  // Clear and set white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add title
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, canvas.width/2, 30);
  
  // Draw axes
  drawChartAxis(ctx, canvas.width, canvas.height);
  
  // Prepare data
  const { xValues, yValues } = prepareChartData(data, isInverse);
  
  if (xValues.length > 0) {
    // Find min/max values
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    
    // Draw the data points
    const color = isInverse ? '#0000FF' : '#FF0000';
    const scalingInfo = drawDataPoints(ctx, xValues, yValues, xMin, xMax, yMin, yMax, color);
    
    // Draw fit line if applicable
    if (fitType && fitParameters) {
      drawFitLine(ctx, fitType, fitParameters, scalingInfo);
    }
  }
  
  // Add axis labels
  const xLabel = isInverse 
    ? (inverseDistanceUnit ? `1/r (${inverseDistanceUnit})` : '1/r')
    : (distanceUnit ? `Distance (${distanceUnit})` : 'Distance');
    
  const yLabel = potentialUnit ? `Potential (${potentialUnit})` : 'Potential';
  
  drawAxisLabel(ctx, xLabel, true, canvas.width, canvas.height);
  drawAxisLabel(ctx, yLabel, false, canvas.width, canvas.height);
};

// Helper to capture chart images
const captureChartCanvas = async (canvas, index) => {
  if (!canvas) return null;
  
  try {
    // Use html2canvas to capture just this canvas
    const chartCanvas = await window.html2canvas(canvas, {
      backgroundColor: '#FFFFFF',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    });
    
    // Create a replacement div
    const replacementDiv = document.createElement('div');
    replacementDiv.style.width = '100%';
    replacementDiv.style.padding = '10px';
    replacementDiv.style.border = '1px solid #000';
    replacementDiv.style.backgroundColor = '#FFFFFF';
    replacementDiv.style.textAlign = 'center';
    
    // Add the canvas image
    const img = document.createElement('img');
    img.src = chartCanvas.toDataURL('image/png');
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.border = '1px solid #ddd';
    replacementDiv.appendChild(img);
    
    return replacementDiv;
  } catch (error) {
    console.error('Error capturing chart:', error);
    return null;
  }
};

// Helper to create image placeholders
const createImagePlaceholder = (container, index, answers) => {
  // Find the original image
  const originalImg = container.querySelector('img');
  
  // Get the caption text if it exists
  const captionInput = container.querySelector('input[type="text"]');
  const captionText = captionInput ? (captionInput.value || 'No caption') : 'No caption';
  
  // Find the image preview
  const preview = container.querySelector('.image-preview');
  if (!preview) return;
  
  // Clear contents of the preview
  while (preview.firstChild) {
    preview.removeChild(preview.firstChild);
  }
  
  // Create a container div with light mode styling
  const imageContainer = document.createElement('div');
  imageContainer.style.border = '1px solid #000';
  imageContainer.style.padding = '10px';
  imageContainer.style.textAlign = 'center';
  imageContainer.style.backgroundColor = '#FFFFFF';
  imageContainer.style.color = '#000000';
  imageContainer.style.minHeight = '120px';
  imageContainer.style.display = 'flex';
  imageContainer.style.flexDirection = 'column';
  imageContainer.style.justifyContent = 'center';
  imageContainer.style.alignItems = 'center';
  
  // Find corresponding image in answers object
  let imageFile = null;
  let imageName = '';
  
  // Map index to the appropriate keys in the answers object
  if (index === 0) {
    imageFile = answers.part1aImage;
    imageName = 'Part 1A: Electric Field of a single point charge';
  } else if (index === 1) {
    imageFile = answers.part1BImage;
    imageName = 'Part 1B: Mapping the Electric Potential';
  } else if (index === 2) {
    imageFile = answers.part2AImage;
    imageName = 'Part 2A: Dipole configuration';
  } else if (index === 3) {
    imageFile = answers.part2BImage;
    imageName = 'Part 2B: Parallel stacked dipoles';
  }
  
  // Add image number and title
  const imageTitle = document.createElement('div');
  imageTitle.style.fontWeight = 'bold';
  imageTitle.style.marginBottom = '10px';
  imageTitle.style.color = '#000000';
  imageTitle.textContent = imageName;
  imageContainer.appendChild(imageTitle);
  
  // Check if image exists and has a valid source
  const hasValidImage = originalImg && originalImg.src && 
                     originalImg.src !== '' && 
                     !originalImg.src.endsWith('undefined') &&
                     !originalImg.src.endsWith('null') &&
                     originalImg.complete && 
                     originalImg.naturalHeight !== 0;
  
  // Try to display actual image if available
  if (hasValidImage) {
    try {
      // Create a new image element with the same source
      const newImg = document.createElement('img');
      newImg.src = originalImg.src;
      newImg.style.maxWidth = '100%';
      newImg.style.maxHeight = '300px';
      newImg.style.border = '1px solid #ddd';
      newImg.style.marginBottom = '10px';
      imageContainer.appendChild(newImg);
      
      // Add caption
      const caption = document.createElement('div');
      caption.style.color = '#000000';
      caption.style.marginTop = '5px';
      caption.style.fontStyle = 'italic';
      caption.textContent = captionText;
      imageContainer.appendChild(caption);
    } catch (err) {
      console.error('Error displaying image:', err);
      // Fall back to no screenshot if there's an error
      createNoScreenshotMessage(imageContainer, captionInput);
    }
  } else {
    // No image provided
    createNoScreenshotMessage(imageContainer, captionInput);
  }
  
  preview.appendChild(imageContainer);
};

// Helper function to create "No Screenshot" message
const createNoScreenshotMessage = (container, captionInput) => {
  // Create a prominent "No Screenshot" message
  const noImageText = document.createElement('div');
  noImageText.style.padding = '20px';
  noImageText.style.backgroundColor = '#fff0f0';
  noImageText.style.color = '#ff0000';
  noImageText.style.fontWeight = 'bold';
  noImageText.style.fontSize = '18px';
  noImageText.style.border = '2px dashed #ff0000';
  noImageText.style.borderRadius = '5px';
  noImageText.style.marginBottom = '15px';
  noImageText.textContent = 'NO SCREENSHOT';
  container.appendChild(noImageText);
  
  // Add caption if available
  const captionText = document.createElement('div');
  captionText.style.color = '#000000';
  captionText.style.marginTop = '10px';
  captionText.style.fontStyle = 'italic';
  captionText.textContent = `Caption: ${captionInput ? captionInput.value || 'No caption provided' : 'No caption provided'}`;
  container.appendChild(captionText);
};

// Function to create a student info section
const createStudentInfoSection = (answers) => {
  const studentInfoDiv = document.createElement('div');
  studentInfoDiv.style.marginBottom = '30px';
  studentInfoDiv.style.padding = '15px';
  studentInfoDiv.style.border = '1px solid #ccc';
  studentInfoDiv.style.backgroundColor = '#f9f9f9';
  
  // Format student name
  const studentNameElem = document.createElement('p');
  studentNameElem.style.margin = '5px 0';
  studentNameElem.style.fontWeight = 'bold';
  studentNameElem.textContent = `Student: ${answers.studentName || 'Not provided'}`;
  studentInfoDiv.appendChild(studentNameElem);
  
  // Format semester, session, and year
  const semesterElem = document.createElement('p');
  semesterElem.style.margin = '5px 0';
  
  // Check if semester and session exist and format properly
  let semesterText = '';
  if (answers.semester && answers.semester !== 'Select' && answers.semester !== '') {
    semesterText += answers.semester;
  } else {
    semesterText += 'Not selected';
  }
  
  if (answers.session && answers.session !== 'Select' && answers.session !== '') {
    semesterText += ` ${answers.session}`;
  }
  
  if (answers.year && answers.year !== '') {
    semesterText += ` ${answers.year}`;
  }
  
  semesterElem.textContent = `Semester: ${semesterText}`;
  studentInfoDiv.appendChild(semesterElem);
  
  // Format TA's name
  const taElem = document.createElement('p');
  taElem.style.margin = '5px 0';
  taElem.textContent = `TA: ${answers.taName || 'Not provided'}`;
  studentInfoDiv.appendChild(taElem);
  
  return studentInfoDiv;
};

// Function to prepare the lab app for PDF conversion
const prepareLabAppForPdf = async (labApp, answers) => {
  // First, make a deep clone of the lab app to modify
  const clonedApp = labApp.cloneNode(true);
  
  // Create a temporary container for the clone
  const tempContainer = document.createElement('div');
  tempContainer.appendChild(clonedApp);
  document.body.appendChild(tempContainer);
  
  // Apply light mode styling
  applyLightTheme(clonedApp);
  
  // Remove buttons from the clone
  clonedApp.querySelectorAll('button').forEach(button => {
    if (button && button.parentNode) {
      button.style.display = 'none';
    }
  });
  
  // Handle image previews
  clonedApp.querySelectorAll('.image-preview-container').forEach((container, index) => {
    createImagePlaceholder(container, index, answers);
  });
  
  // Remove all "Upload Screenshot" buttons
  clonedApp.querySelectorAll('.image-upload-label').forEach(button => {
    if (button && button.parentNode) {
      button.parentNode.removeChild(button);
    } else if (button) {
      button.style.display = 'none';
    }
  });
  
  // Replace form elements with styled divs
  clonedApp.querySelectorAll('textarea').forEach(textarea => {
    createFormElementReplacement(textarea, 'textarea');
  });
  
  clonedApp.querySelectorAll('input[type="text"]').forEach(input => {
    createFormElementReplacement(input, 'input');
  });
  
  clonedApp.querySelectorAll('select').forEach(select => {
    createFormElementReplacement(select, 'select');
  });
  
  // Style all tables
  clonedApp.querySelectorAll('table').forEach(table => {
    styleTable(table);
  });
  
  // Process chart containers
  const chartContainers = clonedApp.querySelectorAll('.chart-container, .dark-mode-graph');
  const chartReplacementPromises = [];
  
  chartContainers.forEach(async (container, index) => {
    const canvas = container.querySelector('canvas');
    if (!canvas) return;
    
    // Redraw the chart with our helper function
    if (index === 0) { // First chart - potential vs distance
      drawChart(canvas, answers.potentialDistanceData, {
        title: 'Electric Potential vs. Distance',
        isInverse: false,
        distanceUnit: answers.potentialDistanceUnit,
        potentialUnit: answers.potentialUnit
      });
    } else if (index === 1) { // Second chart - potential vs inverse distance
      drawChart(canvas, answers.potentialDistanceData, {
        title: 'Electric Potential vs. Inverse Distance',
        isInverse: true,
        inverseDistanceUnit: answers.inverseDistanceUnit,
        potentialUnit: answers.potentialUnit,
        fitType: answers.selectedFitType,
        fitParameters: answers.fitParameters
      });
    }
    
    // Capture the chart and replace it with an image
    const replacementPromise = captureChartCanvas(canvas, index).then(replacementDiv => {
      if (replacementDiv && container.parentNode) {
        container.parentNode.replaceChild(replacementDiv, container);
      }
    });
    
    chartReplacementPromises.push(replacementPromise);
  });
  
  // Wait for all chart captures to complete
  await Promise.all(chartReplacementPromises);
  
  // Add timestamp at the top
  const timestampDiv = document.createElement('div');
  const now = new Date();
  timestampDiv.textContent = `Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
  timestampDiv.style.textAlign = 'right';
  timestampDiv.style.fontSize = '10px';
  timestampDiv.style.color = '#666';
  timestampDiv.style.marginBottom = '20px';
  clonedApp.insertBefore(timestampDiv, clonedApp.firstChild);
  
  // Add PDF title at the top
  const titleDiv = document.createElement('div');
  titleDiv.innerHTML = `<h1 style="text-align: center; color: #000000; margin-bottom: 20px;">Electric Field and Potential Lab Report</h1>`;
  clonedApp.insertBefore(titleDiv, clonedApp.firstChild);
  
  // Add a student info section after the title
  const studentInfoDiv = createStudentInfoSection(answers);
  clonedApp.insertBefore(studentInfoDiv, timestampDiv.nextSibling);
  
  // Remove the duplicate student info section
  const studentInfoSection = clonedApp.querySelector('.student-info');
  if (studentInfoSection && studentInfoSection.parentNode) {
    studentInfoSection.parentNode.removeChild(studentInfoSection);
  }
  
  return { clonedApp, tempContainer };
};

// Helper to create a simplified error PDF
const createErrorPdf = (error) => {
  const errorPdfWidth = 210; // Standard A4 width
  const errorPdfHeight = 297; // Standard A4 height
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [errorPdfWidth, errorPdfHeight]
  });
  
  pdf.setFont('helvetica');
  pdf.setTextColor(0, 0, 0);
  
  pdf.setFontSize(18);
  pdf.text('Electric Field and Potential Lab', errorPdfWidth/2, 20, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.text('Error Report', 20, 40);
  
  pdf.setFontSize(12);
  pdf.text('An error occurred while generating the PDF report.', 20, 50);
  
  // Add more detailed error info
  const errorMessage = error.message || 'Unknown error';
  pdf.text(`Error: ${errorMessage}`, 20, 60);
  
  // Add suggestions
  pdf.text('Possible solutions:', 20, 80);
  
  let yPos = 90;
  const suggestions = [
    'Try refreshing the page and generating the PDF again.',
    'Make sure all images are fully loaded before generating the PDF.',
    'If using a browser extension that blocks content, try disabling it temporarily.',
    'If the error persists, you can take screenshots of each section manually.'
  ];
  
  suggestions.forEach(suggestion => {
    pdf.text(`• ${suggestion}`, 25, yPos);
    yPos += 10;
  });
  
  pdf.text(`Time: ${new Date().toLocaleString()}`, errorPdfWidth - 15, errorPdfHeight - 10, { align: 'right' });
  
  const filename = `lab_report_error_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
  
  return filename;
};

// Main PDF generation function
export async function generateComprehensivePDF(answers) {
  try {
    const standardWidth = 210; // A4 width in mm
    
    // Get the lab app element
    const labApp = document.querySelector('.lab-app');
    if (!labApp) {
      throw new Error('Could not find lab app element');
    }
    
    // Prepare the app for PDF conversion
    const { clonedApp, tempContainer } = await prepareLabAppForPdf(labApp, answers);
    
    // Allow time for rendering
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Render entire app to canvas
    console.log('Capturing app as canvas...');
    const canvasOptions = {
      scale: 1.5,
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      backgroundColor: '#FFFFFF',
      imageTimeout: 3000,
      ignoreElements: (element) => {
        return element.tagName === 'BUTTON' || 
               (element.tagName === 'INPUT' && element.type === 'file') || 
               element.classList.contains('remove-image-btn');
      }
    };
    
    const canvas = await window.html2canvas(clonedApp, canvasOptions);
    
    // Calculate dimensions for the PDF
    const imgWidth = standardWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create the PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [standardWidth, imgHeight + 10]
    });
    
    // Add the captured image to the PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    
    // Add timestamp at the bottom
    const now = new Date();
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 
             standardWidth - 10, imgHeight - 3, { align: 'right' });
    
    // Clean up
    if (tempContainer && document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
    
    // Save the PDF
    const filename = `lab_report_${answers.studentName || 'unnamed'}_${now.toISOString().slice(0, 10)}.pdf`;
    pdf.save(filename);
    
    return filename;
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    try {
      return createErrorPdf(error);
    } catch (e) {
      console.error('Error creating error report PDF:', e);
      alert('Could not generate PDF due to security restrictions. Please try again in a different browser or contact support.');
      return null;
    }
  }
}

// For backward compatibility - removed redundancy
export const generatePDF = generateComprehensivePDF;
export const generateDirectPDF = generateComprehensivePDF; 