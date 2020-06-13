import { AccessoryInformationService } from '../services/accessoryInformationService';
import { SecuritySystemService } from '../services/securitySystemService';
import { SwitchService } from '../services/switchService';
import { MotionSensorService } from '../services/motionSensorService';

export class Services {
  public accessoryInformationService: AccessoryInformationService | null = null;
  public securitySystemService: SecuritySystemService | null = null;
  public switchService: SwitchService | null = null;
  public motionSensorService: MotionSensorService | null = null;
}