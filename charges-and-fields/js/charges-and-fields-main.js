// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

// Function to add debug info to the page
function addDebugInfo(message) {
  console.log(message);
  const debugDiv = document.getElementById('debug-info');
  if (debugDiv) {
    debugDiv.innerHTML += message + '<br>';
  }
}

addDebugInfo('Starting to load imports');

// Use dynamic imports to better handle errors
try {
  addDebugInfo('Loading PreferencesModel');
  const PreferencesModelPromise = import('/joist/js/preferences/PreferencesModel.js');
  
  addDebugInfo('Loading Sim');
  const SimPromise = import('/joist/js/Sim.js');
  
  addDebugInfo('Loading simLauncher');
  const simLauncherPromise = import('/joist/js/simLauncher.js');
  
  addDebugInfo('Loading Tandem');
  const TandemPromise = import('/tandem/js/Tandem.js');
  
  addDebugInfo('Loading ChargesAndFieldsScreen');
  const ChargesAndFieldsScreenPromise = import('/charges-and-fields/js/charges-and-fields/ChargesAndFieldsScreen.js');
  
  addDebugInfo('Loading LabQuestionsScreen');
  const LabQuestionsScreenPromise = import('/charges-and-fields/js/charges-and-fields/LabQuestionsScreen.js');
  
  addDebugInfo('Loading ChargesAndFieldsStrings');
  const ChargesAndFieldsStringsPromise = import('/charges-and-fields/js/ChargesAndFieldsStrings.js');

  // Wait for all imports to complete
  Promise.all([
    PreferencesModelPromise,
    SimPromise,
    simLauncherPromise,
    TandemPromise,
    ChargesAndFieldsScreenPromise,
    LabQuestionsScreenPromise,
    ChargesAndFieldsStringsPromise
  ]).then(([
    { default: PreferencesModel },
    { default: Sim },
    { default: simLauncher },
    { default: Tandem },
    { default: ChargesAndFieldsScreen },
    { default: LabQuestionsScreen },
    { default: ChargesAndFieldsStrings }
  ]) => {
    addDebugInfo('All modules loaded successfully');
    
    const chargesAndFieldsTitleStringProperty = ChargesAndFieldsStrings[ 'charges-and-fields' ].titleStringProperty;

    const tandem = Tandem.ROOT;

    const simOptions = {
      credits: {
        // all credits fields are optional
        leadDesign: 'Michael Dubson, Amy Rouinfar',
        softwareDevelopment: 'Andrew Adare, Michael Dubson, Jonathan Olson, Martin Veillette',
        team: 'Ariel Paul, Kathy Perkins',
        qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Elise Morgan, Oliver Orejola, Ben Roberts, Bryan Yoelin'
      },

      webgl: true,
      preferencesModel: new PreferencesModel( {
        visualOptions: {
          supportsProjectorMode: true
        }
      } )
    };

    simLauncher.launch( () => {
      addDebugInfo('Launching simulation');
      try {
        const sim = new Sim( chargesAndFieldsTitleStringProperty, [
          new ChargesAndFieldsScreen( tandem.createTandem( 'chargesAndFieldsScreen' ) ),
          new LabQuestionsScreen( tandem.createTandem( 'labQuestionsScreen' ) )
        ], simOptions );
        sim.start();
        addDebugInfo('Simulation started successfully');
      } catch (error) {
        addDebugInfo(`Error starting simulation: ${error.message}`);
        console.error('Error starting simulation:', error);
      }
    } );
  }).catch(error => {
    addDebugInfo(`Error loading modules: ${error.message}`);
    console.error('Error loading modules:', error);
  });
} catch (error) {
  addDebugInfo(`Exception in dynamic imports: ${error.message}`);
  console.error('Exception in dynamic imports:', error);
}