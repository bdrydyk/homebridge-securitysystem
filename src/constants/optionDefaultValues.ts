export class OptionDefaultValues {
  // General
  public static readonly NAME = 'Security system';
  public static readonly IGNORE_OFF_MODE = false;
  public static readonly SAVE_STATE = false;

  // Modes
  public static readonly DEFAULT_MODE = 'off';
  public static readonly DISABLED_MODES = [];

  // Time
  public static readonly ARM_SECONDS = 0;
  public static readonly PAUSE_MINUTES = 0;
  public static readonly TRIGGER_SECONDS = 0;
  public static readonly SIREN_SECONDS = 5;
  public static readonly RESET_MINUTES = 10; 

  // Audio
  public static readonly AUDIO = false;
  public static readonly AUDIO_LANGUAGE = 'en-US';
  public static readonly AUDIO_ALERT_LOOPED = false;

  // Switches
  public static readonly MODE_SWITCHES = false;
  public static readonly PAUSE_MODE_SWITCH = false;
  public static readonly SIREN_SWITCH = false;
  public static readonly SIREN_MODE_SWITCHES = false;

  public static readonly HIDE_MODE_OFF_SWITCH = false;

  // Sensors
  public static readonly SIREN_SENSOR = false;
}