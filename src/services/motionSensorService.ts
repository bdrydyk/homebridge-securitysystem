import { Service, HAP, CharacteristicGetCallback } from 'homebridge';
import { Kit } from '../utils/kit';

export class MotionSensorService {
  // Kit
  private hap: HAP;

  private sirenSensorService: Service;
  private sirenSensorValue = false;

  constructor(
    private readonly kit: Kit,
  ) {
    this.hap = kit.hap;

    // Siren sensor
    this.sirenSensorService = new this.hap.Service.MotionSensor('Siren sensor', 'siren-sensor');
    this.addGettersSetters();
  }

  private addGettersSetters(): void {
    this.sirenSensorService
      .getCharacteristic(this.hap.Characteristic.MotionDetected)
      .on('get', this.getSirenSensor.bind(this));
  }

  private getSirenSensor(callback: CharacteristicGetCallback): void {
    callback(null, this.sirenSensorValue);
  }

  public get(): Service {
    return this.sirenSensorService;
  }
}