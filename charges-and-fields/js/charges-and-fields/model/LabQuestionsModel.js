// Copyright 2014-2025, University of Colorado Boulder

/**
 * Model for the Lab Questions screen.
 *
 * @author Seth Gibson
 */

import Property from '../../../../axon/js/Property.js';
import chargesAndFields from '../../chargesAndFields.js';

class LabQuestionsModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    
    // Properties to store student answers
    this.answer1Property = new Property( '', {
      tandem: tandem.createTandem( 'answer1Property' )
    } );
    
    this.answer2Property = new Property( '', {
      tandem: tandem.createTandem( 'answer2Property' )
    } );
    
    this.answer3Property = new Property( '', {
      tandem: tandem.createTandem( 'answer3Property' )
    } );
    
    this.answer4Property = new Property( '', {
      tandem: tandem.createTandem( 'answer4Property' )
    } );
    
    // Property to track if answers have been submitted
    this.answersSubmittedProperty = new Property( false, {
      tandem: tandem.createTandem( 'answersSubmittedProperty' )
    } );
  }

  /**
   * Reset the model.
   * @public
   */
  reset() {
    this.answer1Property.reset();
    this.answer2Property.reset();
    this.answer3Property.reset();
    this.answer4Property.reset();
    this.answersSubmittedProperty.reset();
  }
}

chargesAndFields.register( 'LabQuestionsModel', LabQuestionsModel );
export default LabQuestionsModel; 