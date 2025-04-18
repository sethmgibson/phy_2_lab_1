# Electric Charges and Fields Lab Application

A React-based web application that provides interactive lab questions for the PhET "Charges and Fields" simulation. This application enables students to conduct virtual lab experiments, record measurements, and answer questions based on their observations.

## Project Overview

This application is designed to be loaded within an iframe in the PhET simulation or run as a standalone web application. It provides a comprehensive lab experience for physics students studying electric charges and fields, with features for data collection, analysis, and reporting.

## Technical Stack

### Core Technologies
- **React** (v17.0.2): Front-end UI library
- **Parcel** (v1.12.5): Web application bundler
- **Chart.js** (v3.9.1): Data visualization library
- **jsPDF** (v3.0.1): PDF generation library

### Development Tools
- **Babel**: JavaScript compiler for compatibility
  - @babel/core (v7.21.4)
  - @babel/preset-env (v7.21.4)
  - @babel/preset-react (v7.18.6)

### Browser Support
- Last 2 versions of Chrome, Firefox, and Safari

## Application Structure

```
charges-fields-lab-app/
├── components/           # React components
│   ├── FormComponents    # Form input components
│   ├── ImageComponents   # Image handling components
│   ├── SectionComponents # Structural section components
│   ├── TableComponents   # Data table components
│   ├── ChartComponents   # Data visualization components
│   └── TabComponents     # Navigation components
├── constants/            # Application constants
│   ├── ImageConfig       # Image upload configuration
│   └── TableDefinitions  # Table structure definitions
├── utils/                # Utility functions
│   ├── fitCalculations   # Data fitting algorithms
│   ├── storage           # LocalStorage persistence
│   ├── imageHandlers     # Image processing utilities
│   └── pdfGenerator      # Report generation functionality
├── App.js                # Main application component
├── index.js              # Entry point
├── index.html            # HTML template
├── styles.css            # Application styles
├── package.json          # Dependencies and scripts
└── .babelrc              # Babel configuration
```

## Features

1. **Interactive Lab Interface**
   - Simulation integration through iframe embedding
   - Tabbed navigation between simulation and questions
   - Optional side-by-side layout for larger screens

2. **Data Collection Tools**
   - Electric field measurement tables
   - Potential vs. distance measurement
   - Charge and distance doubling experiments

3. **Data Analysis**
   - Interactive charts using Chart.js
   - Proportional and linear fit calculations
   - Error analysis calculations

4. **Lab Report Features**
   - Image upload for experiment screenshots
   - Comprehensive PDF report generation
   - Progress saving using localStorage

5. **Security Features**
   - Prevention of copying/pasting (except in input fields)
   - Cross-frame communication with parent simulation

## Development Setup

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/sethmgibson/phy_2_lab_1.git
   cd phy_2_lab_1
   ```

2. Install dependencies:
   ```
   cd charges-fields-lab-app
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser to `http://localhost:3333`

### Build for Production

To create a production build:

```
npm run build
```

The build output will be in the `dist` directory, ready for deployment.

## Deployment

This application is configured for deployment to Railway, but can be deployed to any static site hosting service.

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Node.js application
3. The application will be deployed using the commands in the Procfile

### Other Deployment Options

#### Netlify
1. Connect your GitHub repository or upload the build folder
2. Set the build command to: `cd charges-fields-lab-app && npm run build`
3. Set the publish directory to: `charges-fields-lab-app/dist`

#### Vercel
1. Connect your GitHub repository
2. Set the build command to: `cd charges-fields-lab-app && npm run build`
3. Set the output directory to: `charges-fields-lab-app/dist`

## Integration with PhET Simulation

To integrate with the PhET "Charges and Fields" simulation:

1. Deploy this application to a web server
2. In the PhET simulation code, update the iframe source URL to point to your deployment
3. Configure the postMessage communication to match your domain

Example PhET integration code:
```javascript
// In LabQuestionsScreenView.js
const iframe = document.createElement('iframe');
iframe.src = 'https://your-deployed-app-url.com';
iframe.style.border = 'none';
iframe.style.width = '100%';
iframe.style.height = '100%';
container.appendChild(iframe);

// Handle messages from the lab questions app
window.addEventListener('message', function(event) {
  if (event.origin === 'https://your-deployed-app-url.com') {
    // Process the message from the lab app
    const message = event.data;
    // Handle different message types
  }
});
```

## Communication Protocol

The application uses the `window.postMessage` API to communicate with the parent PhET simulation:

```javascript
// Sending data to parent
window.parent.postMessage({
  type: 'SUBMIT_ANSWERS',
  data: answers
}, '*');

// Saving progress
window.parent.postMessage({
  type: 'SAVE_PROGRESS',
  data: answers
}, '*');
```

## Contributing

Contributions to this project are welcome. Please ensure that your code adheres to the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License. See the LICENSE file for details. 