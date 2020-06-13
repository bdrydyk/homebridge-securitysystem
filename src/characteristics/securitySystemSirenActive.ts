export default (Characteristic) => {
  class SecuritySystemSirenActive extends Characteristic {
    constructor() {
      super(SecuritySystemSirenActive.DISPLAY_NAME, SecuritySystemSirenActive.UUID);

      this.setProps({
        format: Characteristic.Formats.BOOL,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY],
      });

      this.value = this.getDefaultValue();
    }
  }

  SecuritySystemSirenActive.DISPLAY_NAME = 'Security System Siren Active';
  SecuritySystemSirenActive.UUID = '00003006-0000-1000-8000-135D67EC4377';

  return <unknown> SecuritySystemSirenActive;
};
