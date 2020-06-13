import { AccessoryPlugin, Service, Logger, AccessoryConfig, API } from 'homebridge';

import { Kit } from './utils/kit';
import { Options } from './options';
import { Services } from './utils/services';

import { AccessoryInformationService } from './services/accessoryInformationService';
import { SecuritySystemService } from './services/securitySystemService';
import { SwitchService } from './services/switchService';
import { MotionSensorService } from './services/motionSensorService';

import { Storage } from './components/storage';

export class SecuritySystemAccessory implements AccessoryPlugin {
  private services: Services;
  private kit: Kit;

  private options: Options;
  private storage: Storage;

  private servicesList: Service[];

  constructor(
    private readonly log: Logger,
    private readonly config: AccessoryConfig,
    private readonly api: API,
  ) {
    this.services = new Services();
    this.servicesList = [];
    
    this.options = new Options(config);
    this.storage = new Storage(log, api, this.services);
    this.kit = new Kit(log, api.hap, this.options, this.storage);

    this.logConfiguration();

    this.addAccessoryInformationService();
    this.addSecuritySystemService();

    this.loadState();
  }

  public identify(): void {
    this.log.info('Identify');
  }

  private logConfiguration(): void {
    let defaultMode = this.options.defaultMode.toLowerCase();
    defaultMode = defaultMode.charAt(0).toUpperCase() + defaultMode.slice(1);

    this.log.info(`Default mode (${defaultMode})`);
    this.log.info(`Arm delay (${this.options.armSeconds} second/s)`);
    this.log.info(`Trigger delay (${this.options.triggerSeconds} second/s)`);

    if (this.options.audio) {
      this.log.info('Audio (Enabled)');
    } else {
      this.log.info('Audio (Disabled)');
    }

    if (this.options.webhookHost !== undefined) {
      this.log.info(`Webhook (${this.options.webhookHost})`);
    }
  }

  private addAccessoryInformationService(): void {
    this.services.accessoryInformationService = new AccessoryInformationService(this.api.hap);
    this.servicesList.push(this.services.accessoryInformationService?.get());
  }

  private addSecuritySystemService(): void {
    this.services.securitySystemService = new SecuritySystemService(this.kit, this.services);
    this.servicesList.push(this.services.securitySystemService?.get());
  }

  private addMotionSensorService(): void {
    this.services.motionSensorService = new MotionSensorService(this.kit);
    this.servicesList.push(this.services.motionSensorService?.get());
  }

  private addSwitchService(): void {
    this.services.switchService = new SwitchService(this.kit, this.services);
    this.servicesList.push(this.services.switchService?.get());
  }

  private async loadState(): Promise<void> {
    await this.storage.load();
  }

  public getServices(): Service[] {
    return this.servicesList;
  }
}
