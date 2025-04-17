// Copyright 2014-2022, University of Colorado Boulder

/**
 * View toggle control for Charges and Fields lab screens
 * Allows switching between tab view and split view modes
 *
 * @author Seth Gibson
 */

import HBox from '../../../scenery/js/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Panel from '../../../sun/js/Panel.js';
import Text from '../../../scenery/js/nodes/Text.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import ChargesAndFieldsStrings from '../../ChargesAndFieldsStrings.js';
import chargesAndFields from '../../chargesAndFields.js';

// Add a unique version marker to verify this file is loaded
console.log('ViewToggleControl loaded - VERSION 3.0 - BUTTON ONLY');

const BUTTON_FONT = new PhetFont(14);

class ViewToggleControl extends Panel {
  /**
   * @param {Property} viewModeProperty - property that tracks the view mode
   * @param {Object} options
   */
  constructor(viewModeProperty, options) {
    console.log('ViewToggleControl constructor called - VERSION 3.0');

    options = options || {};

    // Create a text label
    const viewToggleText = new Text(ChargesAndFieldsStrings.viewModeStringProperty, {
      font: new PhetFont(14)
    });

    // Create a toggle button instead of using the ComboBox
    const toggleButton = new RectangularPushButton({
      content: new Text(
        viewModeProperty.value === 'tab' ? 
          ChargesAndFieldsStrings.tabViewStringProperty : 
          ChargesAndFieldsStrings.splitViewStringProperty, 
        { font: BUTTON_FONT }
      ),
      listener: () => {
        // Toggle between 'tab' and 'split' modes
        viewModeProperty.value = viewModeProperty.value === 'tab' ? 'split' : 'tab';
      },
      baseColor: 'white',
      minWidth: 100
    });

    // Update button text when view mode changes
    viewModeProperty.link(mode => {
      const buttonText = mode === 'tab' ? 
        ChargesAndFieldsStrings.tabViewStringProperty : 
        ChargesAndFieldsStrings.splitViewStringProperty;
      
      toggleButton.content = new Text(buttonText, { font: BUTTON_FONT });
    });
    
    // Create the content
    const content = new HBox({
      spacing: 10,
      children: [viewToggleText, toggleButton],
      align: 'center'
    });
    
    super(content, options);
  }
}

chargesAndFields.register('ViewToggleControl', ViewToggleControl);
export default ViewToggleControl; 