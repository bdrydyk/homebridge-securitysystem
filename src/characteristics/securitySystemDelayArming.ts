export default (Characteristic) => {
  class SecuritySystemDelayArming extends Characteristic {
    constructor() {
      super(SecuritySystemDelayArming.DISPLAY_NAME, SecuritySystemDelayArming.UUID);

      this.setProps({
        format: Characteristic.Formats.BOOL,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY],
      });

      this.value = true;
    }
  }

  SecuritySystemDelayArming.DISPLAY_NAME = 'Security System Delay Arming';
  SecuritySystemDelayArming.UUID = '00003007-0000-1000-8000-135D67EC4377';

  return <unknown> SecuritySystemDelayArming;
};