import { Service, HAP } from 'homebridge';
import { MANUFACTURER, NAME, SERIAL_NUMBER } from '../constants/plugin';

export class AccessoryInformationService {
  private service: Service;

  constructor(
    private readonly hap: HAP,
  ) {
    this.service = new this.hap.Service.AccessoryInformation();

    this.service.setCharacteristic(this.hap.Characteristic.Identify, true);
    this.service.setCharacteristic(this.hap.Characteristic.Manufacturer, MANUFACTURER);
    this.service.setCharacteristic(this.hap.Characteristic.Model, NAME);
    this.service.setCharacteristic(this.hap.Characteristic.Name, NAME);
    this.service.setCharacteristic(this.hap.Characteristic.SerialNumber, SERIAL_NUMBER);
  }

  public get(): Service {
    return this.service;
  }
}