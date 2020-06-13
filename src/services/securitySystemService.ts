import {
  Logger,
  Service,
  Characteristic,
  WithUUID,
  HAP,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
} from 'homebridge';

import { Kit } from '../utils/kit';
import { Services } from '../utils/services';
import { Utils } from '../utils/utils';

import { Options } from '../options';
import { Storage } from '../components/storage';

import { Audio } from '../components/audio';
import { Command } from '../components/command';
import { Webhook } from '../components/webhook';

import SecuritySystemArming from '../characteristics/securitySystemArming';
import SecuritySystemDelayArming from '../characteristics/securitySystemDelayArming';
import SecuritySystemSirenActive from '../characteristics/securitySystemSirenActive';

export class SecuritySystemService {
  public currentState = 0;
  public targetState = 0;

  public delayArming = false;
  public arming = false;
  public sirenActive = false;

  // Kit
  private log: Logger;
  private hap: HAP;
  private options: Options;
  private storage: Storage;

  // Service
  private service: Service;

  private targetStates: number[];
  private stateChanged = false;

  // Characteristics
  private securitySystemDelayArming: WithUUID<{ new (): Characteristic; }>;
  private securitySystemArming: WithUUID<{ new (): Characteristic; }>;
  private securitySystemSirenActive: WithUUID<{ new (): Characteristic; }>;
  
  // Components
  private audio: Audio;
  private command: Command;
  private webhook: Webhook;

  // Timeouts
  private armingTimeout: NodeJS.Timeout | null = null;
  private triggerTimeout: NodeJS.Timeout | null = null;
  private sirenInterval: NodeJS.Timeout | null = null;
  private resetTimeout: NodeJS.Timeout | null = null;

  constructor(
    private readonly kit: Kit,
    private readonly services: Services,
  ) {
    this.log = kit.log;
    this.hap = kit.hap;
    this.storage = kit.storage;
    this.options = kit.options;
    
    this.service = new this.hap.Service.SecuritySystem(this.options.name);
    this.targetStates = this.getTargetStates();

    this.securitySystemDelayArming = new SecuritySystemDelayArming(this.hap.Characteristic);
    this.securitySystemArming = new SecuritySystemArming(this.hap.Characteristic);
    this.securitySystemSirenActive = new SecuritySystemSirenActive(this.hap.Characteristic);

    this.audio = new Audio(kit);
    this.command = new Command(kit);
    this.webhook = new Webhook(kit);

    this.addGettersSetters();
  }

  private logMode(type: string, state: number | string): void {
    let mode = Utils.state2mode(this.hap, state);
    mode = mode.charAt(0).toUpperCase() + mode.slice(1);

    this.log.info(`${type} mode (${mode})`);
  }

  private getTargetStates(): number[] {
    const targetStateCharacteristic = this.service.getCharacteristic(this.hap.Characteristic.SecuritySystemTargetState);
    const validTargetStates = targetStateCharacteristic.props.validValues || [];

    const disabledStates: number[] = [];

    for (const disabledMode of this.options.disabledModes) {
      const state = Utils.mode2state(this.hap, disabledMode.toLowerCase());
      disabledStates.push(state);
    }

    return validTargetStates.filter(mode => !disabledStates.includes(mode));
  }

  private addGettersSetters(): void {
    this.service
      .getCharacteristic(this.hap.Characteristic.SecuritySystemCurrentState)
      .on('get', this.getCurrentState.bind(this));

    this.service
      .getCharacteristic(this.hap.Characteristic.SecuritySystemTargetState)
      .setProps({validValues: this.targetStates})
      .on(CharacteristicEventTypes.GET, this.getTargetState.bind(this))
      .on(CharacteristicEventTypes.SET, this.setTargetState.bind(this));

    this.service
      .getCharacteristic(this.securitySystemDelayArming)
      .on('get', this.getDelayArming.bind(this))
      .on('set', this.setDelayArming.bind(this));

    this.service
      .getCharacteristic(this.securitySystemArming)
      .on('get', this.getArming.bind(this));

    this.service
      .getCharacteristic(this.securitySystemSirenActive)
      .on('get', this.getSirenActive.bind(this))
      .on('set', this.setSirenActive.bind(this));
  }

  public get(): Service {
    return this.service;
  }

  private getCurrentState(callback: CharacteristicGetCallback): void {
    callback(null, this.currentState);
  }

  private setCurrentState(value: number): void {
    // Check if mode already set
    if (this.currentState === value) {
      return;
    }

    this.currentState = value;
    this.service.setCharacteristic(this.hap.Characteristic.SecuritySystemCurrentState, value);
    this.logMode('Current', value);

    // Audio
    if (this.options.audio) {
      this.audio.play('current', value);
    }

    // Command
    this.command.execute('current', value);

    // Webhook
    this.webhook.send('current', value);

    // Save state to file
    if (this.options.saveState) {
      this.storage.save();
    }

    if (value === this.hap.Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED) {
      // Change motion sensor state to detected every x seconds
      // to allow multiple notifications
      this.sirenInterval = setInterval(() => {
        this.services.motionSensorService
          ?.get()
          .getCharacteristic(this.hap.Characteristic.MotionDetected)
          .updateValue(true);
  
        setTimeout(() => {
          this.services.motionSensorService
            ?.get()
            .getCharacteristic(this.hap.Characteristic.MotionDetected)
            .updateValue(false);
        }, 750);
      }, this.options.sirenSensorSeconds * 1000);
  
      // Automatically reset when being triggered after x minutes
      this.resetTimeout = setTimeout(() => {
        this.resetTimeout = null;
        this.handleStateChange();
        this.setCurrentState(this.targetState);
      }, this.options.resetMinutes * 60 * 1000);
    }
  }

  private getTargetState(callback: CharacteristicGetCallback): void {
    callback(null, this.targetState);
  }

  private setTargetState(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    //this.resetModePauseSwitch();
    this.updateTargetState(value as number, false);
  
    callback(null);
  }

  private updateTargetState(value: number, notify: boolean, delay?: boolean): void {
    // Check if state enabled
    if (this.targetStates.includes(value) === false) {
      return;
    }

    // Clear siren interval
    if (this.sirenInterval !== null) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }

    // Clear arming timeout
    if (this.armingTimeout !== null) {
      clearTimeout(this.armingTimeout);
      this.armingTimeout = null;
    }

    // Clear reset timeout
    if (this.resetTimeout !== null) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = null;
    }

    // Check if mode already set
    let modeAlreadySet = false;

    if (value === this.currentState && value === this.targetState) {
      // Same mode
      modeAlreadySet = true;
    } else if (this.triggerTimeout !== null) {
      // Mode changed

      // Clear trigger timeout
      clearTimeout(this.triggerTimeout);
      this.triggerTimeout = null;
    }

    this.targetState = value;
    this.logMode('Target', value);

    // Commands
    this.command.execute('target', value);

    // Webhooks
    this.webhook.send('target', value);

    if (modeAlreadySet) {
      return;
    }

    if (notify) {
      this.service.getCharacteristic(this.hap.Characteristic.SecuritySystemTargetState).updateValue(this.targetState);
    }

    this.handleStateChange();

    // Audio
    if (this.audio && this.stateChanged === false && this.options.armSeconds > 0) {
      this.audio.play('target', value);
    }

    if (delay === undefined) {
      delay = this.service.getCharacteristic(this.securitySystemDelayArming).value as boolean;
    }

    let armSeconds = 0;

    // Add arm delay if alarm is not triggered
    if (this.currentState !== this.hap.Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED) {
      // Only if set to a mode excluding off
      if (value !== this.hap.Characteristic.SecuritySystemTargetState.DISARM) {
        // Only if delay is enabled
        if (delay) {
          armSeconds = this.options.armSeconds;

          // Update arming status
          this.arming = true;
          this.service
            .getCharacteristic(this.securitySystemArming)
            .updateValue(this.arming);
        }
      }
    }

    // Arming
    this.armingTimeout = setTimeout(() => {
      this.armingTimeout = null;
      this.setCurrentState(value);

      // Only if set to a mode excluding off
      if (value !== this.hap.Characteristic.SecuritySystemTargetState.DISARM) {
        this.arming = false;
        this.service
          .getCharacteristic(this.securitySystemArming)
          .updateValue(this.arming);
      }
    }, armSeconds * 1000);
  }

  private handleStateChange(): void {
    // Set security system to mode
    // selected from the user
    // during triggered state
    if (this.currentState === this.hap.Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED) {
      this.stateChanged = true;
    } else {
      this.stateChanged = false;
    }

    // Update characteristic & switches
    const sirenActiveCharacteristic = this.service.getCharacteristic(this.securitySystemSirenActive);

    if (sirenActiveCharacteristic.value) {
      sirenActiveCharacteristic.updateValue(false);
    }

    this.services.switchService?.resetSirenSwitch();

    //this.resetSirenSwitches();
    //this.resetModeSwitches();
    //this.updateModeSwitches();
  }

  private getDelayArming(callback: CharacteristicGetCallback): void {
    callback(null, this.delayArming);
  }

  private setDelayArming(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
    this.delayArming = value as boolean;
    this.log.info(`Delay arming (${(this.delayArming) ? 'On' : 'Off'})`);
  
    // Save state to file
    if (this.options.saveState) {
      this.storage.save();
    }
  
    callback(null);
  }

  private getArming(callback: CharacteristicGetCallback): void {
    callback(null, this.arming);
  }

  private getSirenActive(callback: CharacteristicGetCallback): void {
    callback(null, this.sirenActive);
  }
  
  private setSirenActive(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
    this.sensorTriggered(value, callback);
  }

  public sensorTriggered(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
    // Ignore if the security system
    // mode is off
    if (this.currentState === this.hap.Characteristic.SecuritySystemCurrentState.DISARMED) {
      if (this.options.ignoreOffMode === false) {
        if (callback !== null) {
          callback(new Error('Security system not armed.'));
        }
    
        return;
      }
    }
  
    // Ignore if the security system
    // is arming
    if (this.arming) {
      if (callback !== null) {
        callback(new Error('Security system not armed yet.'));
      }
  
      return;
    }
  
    if (value) {
      // On
      if (this.currentState === this.hap.Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED) {
        // Ignore since alarm
        // is already triggered
      } else {
        this.log.info('Sensor/s (Triggered)');
  
        // Check if sensor already triggered
        if (this.triggerTimeout !== null) {
          return;
        }
  
        this.triggerTimeout = setTimeout(() => {
          // Reset
          this.triggerTimeout = null;
          this.stateChanged = false;
  
          // 🎵 And there goes the alarm... 🎵
          this.setCurrentState(this.hap.Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED);
        }, this.options.triggerSeconds * 1000);
  
        // Execute command
        this.command.execute('current', 'alert');
  
        // Send Webhook request
        if (this.webhook) {
          this.webhook.send('current', 'alert');
        }
  
        // Audio
        if (this.audio) {
          this.audio.play('current', 'alert');
        }
      }
    } else {
      // Off
      this.service.getCharacteristic(new SecuritySystemSirenActive(this.hap)).updateValue(false);
  
      if (this.currentState === this.hap.Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED) {
        if (this.stateChanged === false) {
          this.service.setCharacteristic(
            this.hap.Characteristic.SecuritySystemTargetState, 
            this.hap.Characteristic.SecuritySystemTargetState.DISARM,
          );
        }
      } else {
        if (this.triggerTimeout !== null) {
          clearTimeout(this.triggerTimeout);
          this.triggerTimeout = null;
  
          this.log.info('Sensor/s (Cancelled)');
        }
      }
    }
  
    if (callback !== null) {
      callback(null);
    }
  }
}