import {
  HAP,
  Service,
  CharacteristicGetCallback,
  CharacteristicValue,
  CharacteristicSetCallback,
} from 'homebridge';

import { Kit } from '../utils/kit';
import { Services } from '../utils/services';

export class SwitchService {
  // Kit
  private hap: HAP;

  // Services
  private sirenSwitchService: Service;

  constructor(
    private readonly kit: Kit,
    private readonly services: Services,
  ) {
    this.hap = kit.hap;

    // Siren switch
    this.sirenSwitchService = new this.hap.Service.Switch('Siren', 'siren-switch');
    this.addGettersSetters();
  }

  private addGettersSetters(): void {
    this.sirenSwitchService
      .getCharacteristic(this.hap.Characteristic.On)
      .on('get', this.getSirenSwitch.bind(this))
      .on('set', this.setSirenSwitch.bind(this));
  }

  private getSirenSwitch(callback: CharacteristicGetCallback): void {
    const value = this.sirenSwitchService.getCharacteristic(this.hap.Characteristic.On).value;
    callback(null, value);
  }

  private setSirenSwitch(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
    this.services.securitySystemService?.sensorTriggered(value as boolean, callback);
  }

  public resetSirenSwitch(): void {
    const sirenSwitchOn = this.sirenSwitchService.getCharacteristic(this.hap.Characteristic.On);

    if (sirenSwitchOn.value) {
      sirenSwitchOn.updateValue(false);
    }
  }

  public get(): Service {
    return this.sirenSwitchService;
  }
}