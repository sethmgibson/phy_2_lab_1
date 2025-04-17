// Copyright 2014-2024, University of Colorado Boulder

/**
 * Charges and Fields main Screen
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import chargesAndFields from '../chargesAndFields.js';
import ChargesAndFieldsColors from './ChargesAndFieldsColors.js';
import ChargesAndFieldsModel from './model/ChargesAndFieldsModel.js';
import ChargesAndFieldsScreenView from './view/ChargesAndFieldsScreenView.js';
import StringProperty from '../../../axon/js/StringProperty.js';

class ChargesAndFieldsScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    const options = {
      name: new StringProperty( 'Simulation' ),
      backgroundColorProperty: ChargesAndFieldsColors.backgroundProperty,
      tandem: tandem
    };

    super(
      () => new ChargesAndFieldsModel( tandem.createTandem( 'model' ) ),
      model => new ChargesAndFieldsScreenView( model, tandem.createTandem( 'view' ) ),
      options );
  }
}

chargesAndFields.register( 'ChargesAndFieldsScreen', ChargesAndFieldsScreen );
export default ChargesAndFieldsScreen;