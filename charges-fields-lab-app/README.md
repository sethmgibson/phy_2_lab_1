# Electric Charges and Fields Lab Questions App

A standalone web app that provides lab questions for the PhET "Charges and Fields" simulation.

## Overview

This app is designed to be loaded within an iframe in the PhET simulation. It provides a set of lab questions that students answer based on their observations in the simulation. The app is built to work seamlessly with the PhET framework while having the flexibility of a modern web application.

## Features

- **Dark mode design** that matches the PhET simulation's aesthetic
- **Multiple question types** including text answers and multiple choice
- **Progress saving** in localStorage to prevent lost work
- **Cross-frame communication** with the parent simulation
- **Responsive design** that works on all device sizes

## Deployment Instructions

### 1. Build and Deploy the Web App

You can deploy this app using any static site hosting service. Here are a few options:

#### Option A: Netlify (recommended)

1. Create a free account on [Netlify](https://www.netlify.com/)
2. Install the Netlify CLI: `npm install -g netlify-cli`
3. Build the app: `cd charges-fields-lab-app && npm run build`
4. Deploy: `netlify deploy --prod`

#### Option B: GitHub Pages

1. Create a GitHub repository for this app
2. Build the app: `cd charges-fields-lab-app && npm run build`
3. Push the build output to the `gh-pages` branch
4. Enable GitHub Pages in your repository settings

#### Option C: Vercel

1. Create a free account on [Vercel](https://vercel.com/)
2. Install the Vercel CLI: `npm install -g vercel`
3. Deploy: `cd charges-fields-lab-app && vercel --prod`

### 2. Update the PhET Simulation

Once you've deployed the web app, you need to update the iframe URL in the PhET simulation:

1. Open `charges-and-fields/js/charges-and-fields/view/LabQuestionsScreenView.js`
2. Replace the placeholder URL with your deployed app URL:
   ```javascript
   iframe.src = 'https://your-deployed-app-url.com';
   ```
3. Also update the message origin check:
   ```javascript
   if (event.origin === 'https://your-deployed-app-url.com') {
   ```
4. Rebuild the PhET simulation

## Development

### Local Development

1. Install dependencies: `npm install`
2. Start the development server: `npm start`
3. Open `http://localhost:3000` in your browser

### Working with the PhET Simulation

For local development, you can temporarily modify the `LabQuestionsScreenView.js` file to point to your local development server:

```javascript
iframe.src = 'http://localhost:3000';
```

Remember to change it back to your production URL before deploying.

## Communication Protocol

The app uses the `window.postMessage` API to communicate with the parent PhET simulation. The message format is:

```javascript
{
  type: 'MESSAGE_TYPE',
  data: { ... } // Answer data or other information
}
```

### Message Types

- `SUBMIT_ANSWERS`: Sent when the student submits their answers
- `SAVE_PROGRESS`: Sent when the student manually saves their progress

## Customizing Questions

Edit the `App.js` file to modify the questions. The format is:

```javascript
<div className="question">
  <h2>Question Title</h2>
  <p>Question text</p>
  <textarea 
    value={answers.questionId} 
    onChange={(e) => handleChange('questionId', e.target.value)}
    rows={4}
    placeholder="Placeholder text..."
  />
</div>
```

For multiple choice questions, use the format shown in Question 2 in the sample app.

## License

This project is a part of the PhET Interactive Simulations project at the University of Colorado Boulder. 