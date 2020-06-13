import { exec, ExecException } from 'child_process';
import { Logger, HAP } from 'homebridge';

import { Kit } from '../utils/kit';
import { Options } from '../options';

export class Command {
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

  public execute(type: string, state: number | string) {
    let command: string | null = null;

    switch (state) {
      case this.hap.Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED:
        command = this.options.commandCurrentTriggered;
        break;

      case 'alert':
        command = this.options.commandCurrentAlert;
        break;
  
      case this.hap.Characteristic.SecuritySystemCurrentState.STAY_ARM:
        if (type === 'current') {
          command = this.options.commandCurrentHome;
          break;
        }
  
        command = this.options.commandTargetHome;
        break;
  
      case this.hap.Characteristic.SecuritySystemCurrentState.AWAY_ARM:
        if (type === 'current') {
          command = this.options.commandCurrentAway;
          break;
        }
  
        command = this.options.commandTargetAway;
        break;
  
      case this.hap.Characteristic.SecuritySystemCurrentState.NIGHT_ARM:
        if (type === 'current') {
          command = this.options.commandCurrentNight;
          break;
        }
  
        command = this.options.commandTargetNight;
        break;
  
      case this.hap.Characteristic.SecuritySystemCurrentState.DISARMED:
        if (type === 'current') {
          return;
        }
  
        command = this.options.commandCurrentTriggered;
        break;
  
      default:
        this.log.error(`Unknown ${type} state (${state})`);
    }
  
    // Check if option is set
    if (command === undefined || command === null) {
      return;
    }
  
    exec(<string> command, (error: ExecException | null, stdout: string, stderr: string) => {
      if (error !== null) {
        this.log.error(`Command failed (${command})\n${error}`);
        return;
      }
  
      if (stderr !== '') {
        this.log.error(`Command failed (${command})\n${stderr}`);
        return;
      }
  
      this.log.info(`Command output: ${stdout}`);
    });
  }
}