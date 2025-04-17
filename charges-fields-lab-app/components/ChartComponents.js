import React from 'react';
import { Line } from 'react-chartjs-2';

// PotentialDistanceChart component for visualizing the data
export function PotentialDistanceChart({ tableData, distanceUnit, potentialUnit }) {
  // Ensure tableData is safe to use
  const safeTableData = tableData || {};
  
  // Parse the data from the table for the chart
  const chartData = {
    labels: [],
    datasets: [
      {
        label: 'Electric Potential vs. Distance',
        data: [],
        borderColor: '#63B3ED',
        backgroundColor: 'rgba(99, 179, 237, 0.2)',
        pointBackgroundColor: '#63B3ED',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#63B3ED',
        // Remove the line between points
        showLine: false,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };
  
  // Extract data points, sort by distance, then add to chart data
  const dataPoints = [];
  for (let i = 0; i <= 4; i++) {
    const r = safeTableData[`r${i}`];
    const v = safeTableData[`v${i}`];
    
    // Only add points where both r and v have values
    if (r && v) {
      const rValue = parseFloat(r);
      const vValue = parseFloat(v);
      
      // Only add valid number pairs
      if (!isNaN(rValue) && !isNaN(vValue)) {
        dataPoints.push({ r: rValue, v: vValue });
      }
    }
  }
  
  // Sort data points by r value (distance)
  dataPoints.sort((a, b) => a.r - b.r);
  
  // Populate the chart data
  chartData.labels = dataPoints.map(point => point.r);
  chartData.datasets[0].data = dataPoints.map(point => point.v);
  
  // Format axis titles with units if provided
  const xAxisTitle = `Distance${distanceUnit ? ` [${distanceUnit}]` : ''}`;
  const yAxisTitle = `Electric Potential${potentialUnit ? ` [${potentialUnit}]` : ''}`;
  
  // Chart options with dark mode styling
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: xAxisTitle,
          color: '#CCD4E0'
        },
        grid: {
          color: 'rgba(160, 174, 192, 0.1)'
        },
        ticks: {
          color: '#CCD4E0'
        },
        // Ensure autoscaling is enabled
        beginAtZero: false,
        suggestedMin: null,
        suggestedMax: null
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: yAxisTitle,
          color: '#CCD4E0'
        },
        grid: {
          color: 'rgba(160, 174, 192, 0.1)'
        },
        ticks: {
          color: '#CCD4E0'
        },
        // Ensure autoscaling is enabled
        beginAtZero: false,
        suggestedMin: null,
        suggestedMax: null
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#EAECEF'
        }
      },
      title: {
        display: true,
        text: 'Electric Potential vs. Distance',
        color: '#EAECEF',
        font: {
          size: 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        bodyColor: '#EAECEF',
        titleColor: '#EAECEF'
      }
    }
  };
  
  // Return chart only if there are valid data points
  return (
    <div className="chart-container">
      {dataPoints.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <div className="empty-chart-placeholder">
          <p>Enter distance and potential values in the table above to see the graph</p>
        </div>
      )}
    </div>
  );
}

// PotentialInverseDistanceChart component for visualizing potential vs 1/r
export function PotentialInverseDistanceChart({ tableData, inverseDistanceUnit, potentialUnit, selectedFitType, fitParameters }) {
  // Ensure tableData is safe to use
  const safeTableData = tableData || {};
  
  // Parse the data from the table for the chart
  const chartData = {
    labels: [],
    datasets: [
      {
        label: 'Electric Potential vs. Inverse Distance',
        data: [],
        borderColor: '#68D391', // Using a different color from the first graph
        backgroundColor: 'rgba(104, 211, 145, 0.2)',
        pointBackgroundColor: '#68D391',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#68D391',
        // Remove the line between points
        showLine: false,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };
  
  // Extract data points, calculate inverse distance, and add to chart data
  const dataPoints = [];
  for (let i = 0; i <= 4; i++) {
    const r = safeTableData[`r${i}`];
    const v = safeTableData[`v${i}`];
    
    // Only add points where both r and v have values
    if (r && v) {
      const rValue = parseFloat(r);
      const vValue = parseFloat(v);
      
      // Only add valid number pairs
      if (!isNaN(rValue) && !isNaN(vValue) && rValue !== 0) {
        // Calculate inverse distance (1/r)
        const inverseR = 1 / rValue;
        dataPoints.push({ inverseR: inverseR, v: vValue });
      }
    }
  }
  
  // Sort data points by inverse distance value
  dataPoints.sort((a, b) => a.inverseR - b.inverseR);
  
  // Populate the chart data
  chartData.labels = dataPoints.map(point => point.inverseR);
  chartData.datasets[0].data = dataPoints.map(point => point.v);
  
  // Add fit line if a fit type is selected and we have parameters
  if (selectedFitType && fitParameters && dataPoints.length > 0) {
    // Get min and max x values to draw the fit line
    let minX = Math.min(...dataPoints.map(point => point.inverseR));
    let maxX = Math.max(...dataPoints.map(point => point.inverseR));
    
    // Add some padding on both ends
    const padding = (maxX - minX) * 0.1;
    minX = Math.max(0, minX - padding); // Don't go below zero for 1/r
    maxX = maxX + padding;
    
    // Create fit line data
    const fitLineData = [];
    
    // Use 100 points for a smooth line
    const numPoints = 100;
    const step = (maxX - minX) / (numPoints - 1);
    
    for (let i = 0; i < numPoints; i++) {
      const x = minX + (i * step);
      let y;
      
      if (selectedFitType === 'proportional') {
        // y = Ax
        y = parseFloat(fitParameters.A) * x;
      } else if (selectedFitType === 'linear') {
        // y = mx + b
        y = (parseFloat(fitParameters.m) * x) + parseFloat(fitParameters.b);
      }
      
      fitLineData.push({ x, y });
    }
    
    // Add the fit line dataset
    chartData.datasets.push({
      label: selectedFitType === 'proportional' ? 'Proportional Fit (y = Ax)' : 'Linear Fit (y = mx + b)',
      data: fitLineData,
      borderColor: selectedFitType === 'proportional' ? '#F6AD55' : '#FC8181', // Orange for proportional, Red for linear
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [],
      pointRadius: 0, // No points for the line
      fill: false,
      tension: 0, // Straight line segments
      showLine: true
    });
  }
  
  // Format axis titles with units if provided
  const xAxisTitle = `Inverse Distance${inverseDistanceUnit ? ` [${inverseDistanceUnit}]` : ''}`;
  const yAxisTitle = `Electric Potential${potentialUnit ? ` [${potentialUnit}]` : ''}`;
  
  // Chart options with dark mode styling
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: xAxisTitle,
          color: '#CCD4E0'
        },
        grid: {
          color: 'rgba(160, 174, 192, 0.1)'
        },
        ticks: {
          color: '#CCD4E0'
        },
        // Ensure autoscaling is enabled
        beginAtZero: false,
        suggestedMin: null,
        suggestedMax: null
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: yAxisTitle,
          color: '#CCD4E0'
        },
        grid: {
          color: 'rgba(160, 174, 192, 0.1)'
        },
        ticks: {
          color: '#CCD4E0'
        },
        // Ensure autoscaling is enabled
        beginAtZero: false,
        suggestedMin: null,
        suggestedMax: null
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#EAECEF'
        }
      },
      title: {
        display: true,
        text: 'Electric Potential vs. Inverse Distance',
        color: '#EAECEF',
        font: {
          size: 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        bodyColor: '#EAECEF',
        titleColor: '#EAECEF'
      }
    }
  };
  
  // Return chart only if there are valid data points
  return (
    <div className="chart-container">
      {dataPoints.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <div className="empty-chart-placeholder">
          <p>Enter distance and potential values in the table above to see the graph</p>
        </div>
      )}
    </div>
  );
} 