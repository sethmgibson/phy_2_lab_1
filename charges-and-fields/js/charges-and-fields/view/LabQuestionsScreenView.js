// Copyright 2014-2025, University of Colorado Boulder

/**
 * View for the Lab Questions screen.
 * This implementation uses an iframe to load an external web page for the lab questions.
 *
 * @author Seth Gibson
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import DOM from '../../../../scenery/js/nodes/DOM.js';
import chargesAndFields from '../../chargesAndFields.js';

class LabQuestionsScreenView extends ScreenView {

  /**
   * @param {LabQuestionsModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {
    super( {
      tandem: tandem
    } );

    // Create a container div that fits within the layout bounds
    const containerDiv = document.createElement('div');
    
    // Calculate available dimensions (using layout bounds directly)
    const availableWidth = this.layoutBounds.width;
    const availableHeight = this.layoutBounds.height;
    
    containerDiv.style.width = `${availableWidth}px`;
    containerDiv.style.height = `${availableHeight}px`;
    containerDiv.style.position = 'absolute'; // Use absolute positioning
    containerDiv.style.top = '0';
    containerDiv.style.left = '0';
    containerDiv.style.overflow = 'hidden'; // Prevent content from spilling out
    
    // Create an iframe element
    const iframe = document.createElement('iframe');
    
    // Set the source URL to the lab app path
    iframe.src = '/lab-app/';

    // Style the iframe to fill the container
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.backgroundColor = '#fff';
    iframe.style.pointerEvents = 'auto'; // Enable pointer events
    
    // Set the necessary attributes for interaction
    iframe.allowFullscreen = true;
    iframe.allow = 'autoplay; clipboard-write';
    iframe.setAttribute('scrolling', 'yes'); // Explicitly enable scrolling
    
    // Add iframe to container
    containerDiv.appendChild(iframe);
    
    // Create a DOM wrapper for the container
    const domWrapper = new DOM(containerDiv, {
      tandem: tandem.createTandem('domWrapper'),
      disablePointerEvents: false,
      // Disable preventTransform to allow DOM positioning
      preventTransform: false, 
      pickable: true,
      phetioVisiblePropertyInstrumented: false
    });
    
    // Position at the origin of the layout bounds (top-left corner)
    domWrapper.setTranslation(this.layoutBounds.minX, this.layoutBounds.minY);
    
    // Add the wrapper to the scene
    this.addChild(domWrapper);
    
    // Update dimensions on layout bounds change
    this.visibleBoundsProperty.link(visibleBounds => {
      // Update container size to match current layout bounds
      containerDiv.style.width = `${this.layoutBounds.width}px`;
      containerDiv.style.height = `${this.layoutBounds.height}px`;
      
      // Update position to stay at origin of layout bounds
      domWrapper.setTranslation(this.layoutBounds.minX, this.layoutBounds.minY);
      
      // Log positioning for debugging
      console.log('Layout bounds:', this.layoutBounds.toString());
      console.log('DOM wrapper size:', containerDiv.style.width, containerDiv.style.height);
      console.log('DOM wrapper position:', this.layoutBounds.minX, this.layoutBounds.minY);
    });
    
    // Add message event listener for communication
    window.addEventListener('message', event => {
      // Accept messages from any origin since the lab app will be on the same domain
      const { type, data } = event.data;
      if (type) {
        switch (type) {
          case 'SAVE_PROGRESS':
            console.log('Saving progress:', data);
            break;
          case 'SUBMIT_ANSWERS':
            model.answersSubmittedProperty.value = true;
            console.log('Submitted answers:', data);
            break;
        }
      }
    });
  }
}

chargesAndFields.register('LabQuestionsScreenView', LabQuestionsScreenView);
export default LabQuestionsScreenView; 