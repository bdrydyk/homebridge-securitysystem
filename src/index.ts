import { API } from 'homebridge';

import { ACCESSORY_NAME } from './constants/plugin';
import { SecuritySystemAccessory } from './accessory'; 

/**
 * This method registers the accessory with Homebridge
 */
export = (api: API) => {
  api.registerAccessory(ACCESSORY_NAME, SecuritySystemAccessory);
}
