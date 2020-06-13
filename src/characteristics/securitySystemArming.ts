export default (Characteristic) => {
  class SecuritySystemArming extends Characteristic {
    constructor() {
      super(SecuritySystemArming.DISPLAY_NAME, SecuritySystemArming.UUID);

      this.setProps({
        format: Characteristic.Formats.BOOL,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY],
      });

      this.value = this.getDefaultValue();
    }
  }

  SecuritySystemArming.DISPLAY_NAME = 'Security System Arming';
  SecuritySystemArming.UUID = '00003005-0000-1000-8000-135D67EC4377';

  return <unknown> SecuritySystemArming;
};
