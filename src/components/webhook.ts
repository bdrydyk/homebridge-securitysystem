import { fetch } from 'node-fetch';
import { Logger, HAP } from 'homebridge';

import { Kit } from '../utils/kit';
import { Options } from '../options';

export class Webhook {
  private log: Logger;
  private hap: HAP;
  private options: Options;

  constructor(
    private readonly kit: Kit,
  ) {
    this.log = kit.log;
    this.hap = kit.hap;
    this.options = kit.options;
  }

  public send(type: string, state: number | string) {
    let path: string | null = null;

    switch (state) {
      case this.hap.Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED:
        path = this.options.webhookCurrentTriggered;
        break;
  
      case this.hap.Characteristic.SecuritySystemCurrentState.STAY_ARM:
        if (type === 'current') {
          path = this.options.webhookCurrentHome;
          break;
        }
  
        path = this.options.webhookTargetHome;
        break;
  
      case this.hap.Characteristic.SecuritySystemCurrentState.AWAY_ARM:
        if (type === 'current') {
          path = this.options.webhookCurrentAway;
          break;
        }
  
        path = this.options.webhookTargetAway;
        break;
  
      case this.hap.Characteristic.SecuritySystemCurrentState.NIGHT_ARM:
        if (type === 'current') {
          path = this.options.webhookCurrentNight;
          break;
        }
  
        path = this.options.webhookTargetNight;
        break;
  
      case this.hap.Characteristic.SecuritySystemCurrentState.DISARMED:
        if (type === 'current') {
          return;
        }
  
        path = this.options.webhookCurrentOff;
        break;
  
      case 'alert':
        path = this.options.webhookCurrentAlert;
        break;
  
      default:
        this.log.error(`Unknown ${type} state (${state})`);
        return;
    }
  
    // Check if option is set
    if (path === undefined || path === null) {
      return;
    }
  
    // Send GET request to server
    fetch(this.options.webhookHost + path)
      .then((response: { ok: boolean; statusCode: number; }) => {
        if (!response.ok) {
          throw new Error(`Status code (${response.statusCode})`);
        }
  
        this.log.info('Webhook event (Sent)');
      })
      .catch((error: string) => {
        this.log.error(`Request to webhook failed. (${path})`);
        this.log.error(error);
      });
  }
}