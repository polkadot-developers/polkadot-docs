GRUB_DEFAULT = 0;
GRUB_HIDDEN_TIMEOUT = 0;
GRUB_HIDDEN_TIMEOUT_QUIET = true;
GRUB_TIMEOUT = 10;
GRUB_DISTRIBUTOR = `lsb_release -i -s 2> /dev/null || echo Debian`;
GRUB_CMDLINE_LINUX_DEFAULT = 'nosmt=force';
GRUB_CMDLINE_LINUX = '';

GRUB_DEFAULT = 0;
GRUB_HIDDEN_TIMEOUT = 0;
GRUB_HIDDEN_TIMEOUT_QUIET = true;
GRUB_TIMEOUT = 10;
GRUB_DISTRIBUTOR = `lsb_release -i -s 2> /dev/null || echo Debian`;
GRUB_CMDLINE_LINUX_DEFAULT = 'numa_balancing=disable';
GRUB_CMDLINE_LINUX = '';

GRUB_DEFAULT = 0;
GRUB_HIDDEN_TIMEOUT = 0;
GRUB_HIDDEN_TIMEOUT_QUIET = true;
GRUB_TIMEOUT = 10;
GRUB_DISTRIBUTOR = `lsb_release -i -s 2> /dev/null || echo Debian`;
GRUB_CMDLINE_LINUX_DEFAULT =
  'spec_store_bypass_disable=prctl spectre_v2_user=prctl';
GRUB_CMDLINE_LINUX = '';
