// Simplified version of the charges-and-fields-main.js file
// This will display a message instead of trying to load all the dependencies

document.addEventListener('DOMContentLoaded', function() {
  // Replace the black background with white
  document.body.style.backgroundColor = '#fff';
  
  // Create a container for our message
  const container = document.createElement('div');
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.maxWidth = '800px';
  container.style.margin = '40px auto';
  container.style.padding = '20px';
  container.style.backgroundColor = '#f0f0f0';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  
  // Add content
  container.innerHTML = `
    <h1 style="color: #0077c0;">PhET Charges and Fields Simulation</h1>
    
    <p>This is a simplified placeholder for the Charges and Fields simulation.</p>
    
    <p>The original simulation requires multiple PhET framework dependencies that aren't included in this version. 
    To view the full interactive simulation, please visit the official PhET website:</p>
    
    <p><a href="https://phet.colorado.edu/en/simulation/charges-and-fields" 
          style="display: inline-block; padding: 10px 20px; background-color: #0077c0; color: white; 
                 text-decoration: none; border-radius: 4px; font-weight: bold;">
      Open Official Charges and Fields Simulation
    </a></p>
    
    <div style="margin-top: 30px; padding: 15px; background-color: #e6f7ff; border-left: 4px solid #0077c0; border-radius: 4px;">
      <h3 style="margin-top: 0;">About This Simulation</h3>
      <p>The Charges and Fields simulation allows users to:</p>
      <ul>
        <li>Arrange positive and negative charges on a playing field</li>
        <li>Visualize electric fields using vectors</li>
        <li>Explore electric potentials</li>
        <li>Place electric field sensors to measure field strength and direction</li>
        <li>Create equipotential lines</li>
      </ul>
    </div>
  `;
  
  // Add the container to the body
  document.body.appendChild(container);
});