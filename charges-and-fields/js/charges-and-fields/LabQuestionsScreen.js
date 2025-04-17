// Copyright 2014-2025, University of Colorado Boulder

/**
 * Lab Questions Screen for Charges and Fields
 *
 * @author Seth Gibson
 */

import Screen from '../../../joist/js/Screen.js';
import chargesAndFields from '../chargesAndFields.js';
import ChargesAndFieldsColors from './ChargesAndFieldsColors.js';
import LabQuestionsScreenView from './view/LabQuestionsScreenView.js';
import LabQuestionsModel from './model/LabQuestionsModel.js';
import ChargesAndFieldsStrings from '../ChargesAndFieldsStrings.js';

class LabQuestionsScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    const options = {
      name: ChargesAndFieldsStrings.labQuestionsStringProperty,
      backgroundColorProperty: ChargesAndFieldsColors.backgroundProperty,
      tandem: tandem
    };

    super(
      () => new LabQuestionsModel( tandem.createTandem( 'model' ) ),
      model => new LabQuestionsScreenView( model, tandem.createTandem( 'view' ) ),
      options );
  }
}

chargesAndFields.register( 'LabQuestionsScreen', LabQuestionsScreen );
export default LabQuestionsScreen; 