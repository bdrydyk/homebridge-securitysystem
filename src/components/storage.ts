import * as path from 'path';
import * as storage from 'node-persist';

import { Logger, API } from 'homebridge';

import { Services } from '../utils/services';
import { SecuritySystemService } from '../services/securitySystemService';

export class Storage {
  constructor(
    private readonly log: Logger,
    private readonly api: API,
    private readonly services: Services,
  ) { }

  public async load(): Promise<void> {
    const options = {
      'dir': path.join(this.api.user.storagePath(), 'homebridge-securitysystem'),
    };
  
    await storage.init(options)
      .then()
      .catch((error: string) => {
        this.log.error('Unable to initialize storage.');
        this.log.error(error);
      });

    if (storage.defaultInstance === undefined) {
      return;
    }
    
    await storage.getItem('state')
      .then((state: Record<string, unknown>) => {
        if (state === undefined) {
          return;
        }
  
        this.log.info('Saved state (Found)');
      })
      .catch((error: string) => {
        this.log.info('Saved state (Error)');
        this.log.info(error);
      });
  }

  public async save(): Promise<void> {
    if (storage.defaultInstance === undefined) {
      return;
    }
  
    const securitySystemService = this.services.securitySystemService as SecuritySystemService;

    const state = {
      'currentState': securitySystemService.currentState,
      'targetState': securitySystemService.targetState,
      'delayArming': securitySystemService.delayArming,
    };
  
    await storage.setItem('state', state)
      .then()
      .catch((error: string) => {
        this.log.error('Unable to save state.');
        this.log.error(error);
      });
  }
}