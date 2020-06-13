import { AccessoryConfig } from 'homebridge';
import { OptionDefaultValues } from './constants/optionDefaultValues';

export class Options {
  // General
  public name: string;
  public ignoreOffMode: boolean;
  public saveState: boolean;

  // Modes
  public defaultMode: string;
  public disabledModes: string[];

  // Time
  public armSeconds: number;
  public pauseMinutes: number;
  public triggerSeconds: number;
  public sirenSeconds: number;
  public resetMinutes: number;

  // Audio
  public audio: boolean;
  public audioLanguage: string;
  public audioAlertLooped: boolean;

  // Switches
  public modeSwitches: boolean;
  public pauseModeSwitch: boolean;
  public hideModeOffSwitch: boolean;

  public sirenSwitch: boolean;
  public sirenModeSwitches: boolean;

  // Sensors
  public sirenSensor: boolean;
  public sirenSensorSeconds: number;

  // Command
  public commandTargetHome: string;
  public commandTargetAway: string;
  public commandTargetNight: string;

  public commandCurrentHome: string;
  public commandCurrentAway: string;
  public commandCurrentNight: string;
  public commandCurrentOff: string;

  public commandCurrentAlert: string;
  public commandCurrentTriggered: string;

  // Webhook
  public webhookHost: string; // breaking change
  
  public webhookTargetHome: string;
  public webhookTargetAway: string;
  public webhookTargetNight: string;

  public webhookCurrentHome: string;
  public webhookCurrentAway: string;
  public webhookCurrentNight: string;
  public webhookCurrentOff: string; // breaking change

  public webhookCurrentAlert: string; // breaking change
  public webhookCurrentTriggered: string; // breaking change
  
  constructor(
    public readonly config: AccessoryConfig,
  ) {
    // General
    this.name = config.name;
    this.ignoreOffMode = config.ignoreOffMode; // breaking change
    this.saveState = config.save_state;

    // Modes
    this.defaultMode = config.default_mode;
    this.disabledModes = config.disabled_modes;

    // Time
    this.armSeconds = config.arm_seconds;
    this.pauseMinutes = config.paue_minutes;
    this.triggerSeconds = config.trigger_seconds;
    this.resetMinutes = config.reset_minutes;
    this.sirenSeconds = config.siren_seconds;

    // Audio
    this.audio = config.audio;
    this.audioLanguage = config.audio_language;
    this.audioAlertLooped = config.audio_alert_looped;

    // Switches
    this.modeSwitches = config.mode_switches; // breaking change
    this.pauseModeSwitch = config.pause_mode_switch; // breaking change
    this.sirenSwitch = config.siren_switch;
    this.sirenModeSwitches = config.siren_mode_switches;

    this.hideModeOffSwitch = config.hide_mode_off_switch;

    // Sensors
    this.sirenSensor = config.siren_sensor;
    this.sirenSensorSeconds = config.siren_sensor_seconds;

    // Command
    this.commandTargetHome = config.command_target_home;
    this.commandTargetAway = config.command_target_away;
    this.commandTargetNight = config.command_target_night;
  
    this.commandCurrentHome = config.command_current_home;
    this.commandCurrentAway = config.command_current_away;
    this.commandCurrentNight = config.command_current_night;
    this.commandCurrentOff = config.command_current_off; // breaking change
    this.commandCurrentAlert = config.command_current_alert; // breaking change
    this.commandCurrentTriggered = config.command_current_triggered; // breaking change

    // Webhook
    this.webhookHost = config.webhook_host; // breaking change
    
    this.webhookTargetHome = config.webhook_target_home;
    this.webhookTargetAway = config.webhook_target_away;
    this.webhookTargetNight = config.webhook_target_night;

    this.webhookCurrentHome = config.webhook_current_home;
    this.webhookCurrentAway = config.webhook_current_away;
    this.webhookCurrentNight = config.webhook_current_night;
    this.webhookCurrentOff = config.webhook_current_off; // breaking change
    this.webhookCurrentAlert = config.webhook_current_alert; // breaking change
    this.webhookCurrentTriggered = config.webhook_current_triggered; // breaking change

    // Default values
    this.setDefaultValues();
  }

  private isOptionSet(value: unknown): boolean {
    if (value === undefined || value === null) {
      return false;
    }
  
    return true;
  }

  private setDefaultValues(): void {
    // General
    if (this.isOptionSet(this.name) === false) {
      this.name = OptionDefaultValues.NAME;
    }

    if (this.isOptionSet(this.ignoreOffMode) === false) {
      this.ignoreOffMode = OptionDefaultValues.IGNORE_OFF_MODE;
    }
    
    if (this.isOptionSet(this.saveState) === false) {
      this.saveState = OptionDefaultValues.SAVE_STATE;
    }

    // Modes
    if (this.isOptionSet(this.defaultMode)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: Object is possible 'null' or 'undefined'
      this.defaultMode = this.defaultMode.toLowerCase();
    } else {
      this.defaultMode = OptionDefaultValues.DEFAULT_MODE;
    }

    if (this.isOptionSet(this.disabledModes) === false) {
      this.disabledModes = OptionDefaultValues.DISABLED_MODES;
    }

    // Time
    if (this.isOptionSet(this.armSeconds) === false) {
      this.armSeconds = OptionDefaultValues.ARM_SECONDS;
    }

    if (this.isOptionSet(this.pauseMinutes) === false) {
      this.pauseMinutes = OptionDefaultValues.PAUSE_MINUTES;
    }

    if (this.isOptionSet(this.triggerSeconds)) {
      this.triggerSeconds = OptionDefaultValues.TRIGGER_SECONDS;
    }

    if (this.isOptionSet(this.resetMinutes)) {
      this.resetMinutes = OptionDefaultValues.RESET_MINUTES;
    }

    if (this.isOptionSet(this.sirenSeconds)) {
      this.sirenSeconds = OptionDefaultValues.SIREN_SECONDS;
    }

    // Audio
    if (this.isOptionSet(this.audio) === false) {
      this.audio = OptionDefaultValues.AUDIO;
    }

    if (this.isOptionSet(this.audioLanguage) === false) {
      this.audioLanguage = OptionDefaultValues.AUDIO_LANGUAGE;
    }

    if (this.isOptionSet(this.audioAlertLooped) === false) {
      this.audioAlertLooped = OptionDefaultValues.AUDIO_ALERT_LOOPED;
    }

    // Switches
    if (this.isOptionSet(this.modeSwitches) === false) {
      this.modeSwitches = OptionDefaultValues.MODE_SWITCHES;
    }

    if (this.isOptionSet(this.pauseModeSwitch) === false) {
      this.pauseModeSwitch = OptionDefaultValues.PAUSE_MODE_SWITCH;
    }

    if (this.isOptionSet(this.sirenSwitch) === false) {
      this.sirenSwitch = OptionDefaultValues.SIREN_SWITCH;
    }

    if (this.isOptionSet(this.sirenSwitch) === false) {
      this.sirenSwitch = OptionDefaultValues.SIREN_SWITCH;
    }
  
    if (this.isOptionSet(this.sirenSeconds) === false) {
      this.sirenSeconds = OptionDefaultValues.SIREN_SECONDS;
    }

    if (this.isOptionSet(this.sirenModeSwitches) === false) {
      this.sirenModeSwitches = OptionDefaultValues.SIREN_MODE_SWITCHES;
    }

    if (this.isOptionSet(this.hideModeOffSwitch) === false) {
      this.hideModeOffSwitch = OptionDefaultValues.HIDE_MODE_OFF_SWITCH;
    }

    // Sensors
    if (this.isOptionSet(this.sirenSensor) === false) {
      this.sirenSensor = OptionDefaultValues.SIREN_SENSOR;
    }
  }
}
