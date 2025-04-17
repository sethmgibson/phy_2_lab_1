// Function to calculate fit parameters for potential vs. inverse distance data
export function calculateFitParameters(fitType, tableData) {
  // Get the valid data points
  const dataPoints = [];
  const safeTableData = tableData || {};
  
  for (let i = 0; i <= 4; i++) {
    const r = safeTableData[`r${i}`];
    const v = safeTableData[`v${i}`];
    
    if (r && v) {
      const rValue = parseFloat(r);
      const vValue = parseFloat(v);
      
      if (!isNaN(rValue) && !isNaN(vValue) && rValue !== 0) {
        const inverseR = 1 / rValue;
        dataPoints.push({ x: inverseR, y: vValue });
      }
    }
  }
  
  // Need at least 2 points for a linear fit and 1 for proportional
  const minPoints = fitType === 'linear' ? 2 : 1;
  if (dataPoints.length < minPoints) {
    return null;
  }
  
  // Calculate parameters based on fit type
  if (fitType === 'proportional') {
    // For y = Ax, calculate A using least squares
    let sumXY = 0;
    let sumXSquared = 0;
    
    dataPoints.forEach(point => {
      sumXY += point.x * point.y;
      sumXSquared += point.x * point.x;
    });
    
    const A = sumXY / sumXSquared;
    
    // Calculate RMSE
    let sumSquaredErrors = 0;
    dataPoints.forEach(point => {
      const predicted = A * point.x;
      const error = point.y - predicted;
      sumSquaredErrors += error * error;
    });
    
    const rmse = Math.sqrt(sumSquaredErrors / dataPoints.length);
    
    return { 
      A: A.toFixed(4),
      rmse: rmse.toFixed(4) 
    };
  } else if (fitType === 'linear') {
    // For y = mx + b, calculate m and b using least squares
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXSquared = 0;
    const n = dataPoints.length;
    
    dataPoints.forEach(point => {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumXSquared += point.x * point.x;
    });
    
    const denominator = (n * sumXSquared) - (sumX * sumX);
    if (denominator === 0) return null; // Avoid division by zero
    
    const m = ((n * sumXY) - (sumX * sumY)) / denominator;
    const b = ((sumY * sumXSquared) - (sumX * sumXY)) / denominator;
    
    // Calculate RMSE
    let sumSquaredErrors = 0;
    dataPoints.forEach(point => {
      const predicted = m * point.x + b;
      const error = point.y - predicted;
      sumSquaredErrors += error * error;
    });
    
    const rmse = Math.sqrt(sumSquaredErrors / dataPoints.length);
    
    return { 
      m: m.toFixed(4), 
      b: b.toFixed(4),
      rmse: rmse.toFixed(4)
    };
  }
  
  return null;
} 