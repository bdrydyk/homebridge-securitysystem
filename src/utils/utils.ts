import { HAP } from 'homebridge';

export class Utils {
  public static state2mode(hap: HAP, state: number | string): string {
    switch (state) {
      case hap.Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED:
        return 'triggered';
  
      case hap.Characteristic.SecuritySystemCurrentState.STAY_ARM:
        return 'home';
  
      case hap.Characteristic.SecuritySystemCurrentState.AWAY_ARM:
        return 'away';
  
      case hap.Characteristic.SecuritySystemCurrentState.NIGHT_ARM:
        return 'night';
        
      case hap.Characteristic.SecuritySystemCurrentState.DISARMED:
        return 'off';
  
      // Custom
      case 'alert':
        return state;
  
      default:
        return 'unknown';
    }
  }

  public static mode2state(hap: HAP, mode: string): number {
    switch (mode) {
      case 'home':
        return hap.Characteristic.SecuritySystemCurrentState.STAY_ARM;
  
      case 'away':
        return hap.Characteristic.SecuritySystemCurrentState.AWAY_ARM;
  
      case 'night':
        return hap.Characteristic.SecuritySystemCurrentState.NIGHT_ARM;
        
      case 'off':
        return hap.Characteristic.SecuritySystemCurrentState.DISARMED;
  
      default:
        return -1;
    }
  }
}
