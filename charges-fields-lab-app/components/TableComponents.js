import React from 'react';

// Electric Field Table component
export function ElectricFieldTable({ 
  eMeasUnit, 
  eCalcUnit, 
  tableData, 
  onUnitChange, 
  onTableDataChange 
}) {
  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Position</th>
            <th>+x (right)</th>
            <th>-x (left)</th>
            <th>+y (upward)</th>
            <th>-y (downward)</th>
            <th>E<sub>ave</sub></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="row-header">
              <div className="cell-with-unit">
                <span>E<sub>meas</sub></span>
                <input 
                  type="text"
                  className="unit-input"
                  value={eMeasUnit}
                  onChange={(e) => onUnitChange('eMeasUnit', e.target.value)}
                  placeholder="unit"
                  onPaste={(e) => e.preventDefault()}
                />
              </div>
            </td>
            <td>
              <input 
                type="text"
                value={tableData.eMeasPlusX}
                onChange={(e) => onTableDataChange('eMeasPlusX', e.target.value)}
                onPaste={(e) => e.preventDefault()}
              />
            </td>
            <td>
              <input 
                type="text"
                value={tableData.eMeasMinusX}
                onChange={(e) => onTableDataChange('eMeasMinusX', e.target.value)}
                onPaste={(e) => e.preventDefault()}
              />
            </td>
            <td>
              <input 
                type="text"
                value={tableData.eMeasPlusY}
                onChange={(e) => onTableDataChange('eMeasPlusY', e.target.value)}
                onPaste={(e) => e.preventDefault()}
              />
            </td>
            <td>
              <input 
                type="text"
                value={tableData.eMeasMinusY}
                onChange={(e) => onTableDataChange('eMeasMinusY', e.target.value)}
                onPaste={(e) => e.preventDefault()}
              />
            </td>
            <td>
              <input 
                type="text"
                value={tableData.eMeasEAve}
                onChange={(e) => onTableDataChange('eMeasEAve', e.target.value)}
                onPaste={(e) => e.preventDefault()}
              />
            </td>
          </tr>
          <tr>
            <td className="row-header">
              <div className="cell-with-unit">
                <span>E<sub>calc</sub></span>
                <input 
                  type="text"
                  className="unit-input"
                  value={eCalcUnit}
                  onChange={(e) => onUnitChange('eCalcUnit', e.target.value)}
                  placeholder="unit"
                  onPaste={(e) => e.preventDefault()}
                />
              </div>
            </td>
            <td>
              <input 
                type="text"
                value={tableData.eCalcPlusX}
                onChange={(e) => onTableDataChange('eCalcPlusX', e.target.value)}
                onPaste={(e) => e.preventDefault()}
              />
            </td>
            <td>
              <input 
                type="text"
                value={tableData.eCalcMinusX}
                onChange={(e) => onTableDataChange('eCalcMinusX', e.target.value)}
                onPaste={(e) => e.preventDefault()}
              />
            </td>
            <td>
              <input 
                type="text"
                value={tableData.eCalcPlusY}
                onChange={(e) => onTableDataChange('eCalcPlusY', e.target.value)}
                onPaste={(e) => e.preventDefault()}
              />
            </td>
            <td>
              <input 
                type="text"
                value={tableData.eCalcMinusY}
                onChange={(e) => onTableDataChange('eCalcMinusY', e.target.value)}
                onPaste={(e) => e.preventDefault()}
              />
            </td>
            <td>
              <input 
                type="text"
                value={tableData.eCalcEAve}
                onChange={(e) => onTableDataChange('eCalcEAve', e.target.value)}
                onPaste={(e) => e.preventDefault()}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <p className="table-explanation">
        Where E<sub>meas</sub> are the values measured with the sensors in the simulation and E<sub>calc</sub> are the values calculated using equation (3).
      </p>
    </div>
  );
}

// Generic 3-column table component for doubling experiments
export function DoublingExperimentTable({ 
  rowHeaders, 
  columnUnit, 
  eMeasUnit, 
  eCalcUnit, 
  tableData, 
  onUnitChange, 
  onTableDataChange 
}) {
  return (
    <div className="data-table-container">
      <table className="data-table charge-doubling-table">
        <thead>
          <tr>
            <th>
              <div className="cell-with-unit">
                <span>{columnUnit.label}</span>
                <input 
                  type="text"
                  className="unit-input"
                  value={columnUnit.value}
                  onChange={(e) => onUnitChange(columnUnit.field, e.target.value)}
                  placeholder="unit"
                  onPaste={(e) => e.preventDefault()}
                />
              </div>
            </th>
            <th>
              <div className="cell-with-unit">
                <span>E<sub>meas</sub></span>
                <input 
                  type="text"
                  className="unit-input"
                  value={eMeasUnit.value}
                  onChange={(e) => onUnitChange(eMeasUnit.field, e.target.value)}
                  placeholder="unit"
                  onPaste={(e) => e.preventDefault()}
                />
              </div>
            </th>
            <th>
              <div className="cell-with-unit">
                <span>E<sub>calc</sub></span>
                <input 
                  type="text"
                  className="unit-input"
                  value={eCalcUnit.value}
                  onChange={(e) => onUnitChange(eCalcUnit.field, e.target.value)}
                  placeholder="unit"
                  onPaste={(e) => e.preventDefault()}
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {rowHeaders.map((row, index) => (
            <tr key={index}>
              <td className="row-header">{row.label}</td>
              <td>
                <input 
                  type="text"
                  value={tableData[row.measField]}
                  onChange={(e) => onTableDataChange(row.measField, e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                />
              </td>
              <td>
                <input 
                  type="text"
                  value={tableData[row.calcField]}
                  onChange={(e) => onTableDataChange(row.calcField, e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Generic 2-column table component for electric potential vs distance
export function PotentialDistanceTable({ 
  distanceUnit, 
  inverseDistanceUnit,
  potentialUnit, 
  tableData, 
  onUnitChange, 
  onTableDataChange 
}) {
  // Ensure tableData is always an object to prevent errors
  const safeTableData = tableData || {};
  
  // Function to calculate inverse distance (1/r)
  const calculateInverseDistance = (distance) => {
    if (!distance) return '';
    const distValue = parseFloat(distance);
    if (isNaN(distValue) || distValue === 0) return '';
    // Return the inverse with 4 decimal places
    return (1 / distValue).toFixed(4);
  };
  
  return (
    <div className="data-table-container">
      <table className="data-table potential-distance-table">
        <thead>
          <tr>
            <th>
              <div className="cell-with-unit">
                <span>Distance (r)</span>
                <input 
                  type="text"
                  className="unit-input"
                  value={distanceUnit || ''}
                  onChange={(e) => onUnitChange('potentialDistanceUnit', e.target.value)}
                  placeholder="unit"
                  onPaste={(e) => e.preventDefault()}
                />
              </div>
            </th>
            <th>
              <div className="cell-with-unit">
                <span>Inverse Distance (1/r)</span>
                <input 
                  type="text"
                  className="unit-input"
                  value={inverseDistanceUnit || ''}
                  onChange={(e) => onUnitChange('inverseDistanceUnit', e.target.value)}
                  placeholder="unit"
                  onPaste={(e) => e.preventDefault()}
                />
              </div>
            </th>
            <th>
              <div className="cell-with-unit">
                <span>Electric Potential</span>
                <input 
                  type="text"
                  className="unit-input"
                  value={potentialUnit || ''}
                  onChange={(e) => onUnitChange('potentialUnit', e.target.value)}
                  placeholder="unit"
                  onPaste={(e) => e.preventDefault()}
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3, 4].map((rowIndex) => (
            <tr key={rowIndex}>
              <td>
                <input 
                  type="text"
                  value={(safeTableData[`r${rowIndex}`] || '')}
                  onChange={(e) => onTableDataChange(`r${rowIndex}`, e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                />
              </td>
              <td className="calculated-cell">
                {calculateInverseDistance(safeTableData[`r${rowIndex}`])}
              </td>
              <td>
                <input 
                  type="text"
                  value={(safeTableData[`v${rowIndex}`] || '')}
                  onChange={(e) => onTableDataChange(`v${rowIndex}`, e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 