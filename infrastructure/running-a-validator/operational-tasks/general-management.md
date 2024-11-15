---
title: General Management
description: TODO
---
# General Management

## Introduction

<!--TODO: add Intro and Description once we know all the things that will end up on this page-->
## Configuration Optimization

For those seeking to optimize their validator's performance, the following configurations can improve responsiveness, reduce latency, and ensure consistent performance during high-demand periods.

### Deactivate Simultaneous Multithreading

Polkadot validators operate primarily in single-threaded mode for critical paths, meaning optimizing for single-core CPU performance can reduce latency and improve stability. Deactivating simultaneous multithreading (SMT) can prevent virtual cores from affecting performance. SMT implementation is called Hyper-Threading on Intel and 2-way SMT on AMD Zen. The following will deactivate every other (vCPU) core:

```bash
for cpunum in $(cat /sys/devices/system/cpu/cpu*/topology/thread_siblings_list | cut -s -d, -f2- | tr ',' '\n' | sort -un)
do
  echo 0 > /sys/devices/system/cpu/cpu$cpunum/online
done
```

To save the changes permanently, add `nosmt=force` as kernel parameter. Edit `/etc/default/grub` and add `nosmt=force` to `GRUB_CMDLINE_LINUX_DEFAULT` variable as follows:

``` bash
sudo nano /etc/default/grub
# Add to GRUB_CMDLINE_LINUX_DEFAULT
```

``` config title="/etc/default/grub"
-8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/grub-config-01.js:1:7'
```

After updating the variable, be sure to update GRUB to apply changes:

``` bash
sudo update-grub
```

After the reboot, you should see that half of the cores are offline. To confirm, run:

``` bash
lscpu --extended
```

### Deactivate Automatic NUMA Balancing

Deactivating NUMA (Non-Uniform Memory Access) balancing for multi-CPU setups helps keep processes on the same CPU node, minimizing latency. Run the following command to deactivate NUMA balancing in runtime:

``` bash
sysctl kernel.numa_balancing=0
```

To deactivate NUMA balancing permanently, add `numa_balancing=disable` to GRUB settings:

``` bash
sudo nano /etc/default/grub
# Add to GRUB_CMDLINE_LINUX_DEFAULT
```

``` config title="/etc/default/grub"
-8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/grub-config-01.js:9:15'
```

After updating the variable, be sure to update GRUB to apply changes:

``` bash
sudo update-grub
```

Confirm the deactivation by running the following command:

``` bash
sysctl -a | grep 'kernel.numa_balancing'
```

If you successfully deactivated NUMA balancing, the preceding command should return `0`.

### Spectre and Meltdown Mitigations

[Spectre](https://en.wikipedia.org/wiki/Spectre_(security_vulnerability){target=\_blank} and [Meltdown](https://en.wikipedia.org/wiki/Meltdown_(security_vulnerability)){target=\_blank} are well-known vulnerabilities in modern CPUs that exploit speculative execution to access sensitive data. These vulnerabilities have been patched in recent Linux kernels, but the mitigations can slightly impact performance, especially in high-throughput or containerized environments.

If your security needs allow it, you may selectively deactivate specific mitigations for performance gains. The Spectre V2 and Speculative Store Bypass Disable (SSBD) for Spectre V4 apply to speculative execution and are particularly impactful in containerized environments. Deactivating them can help regain performance if your environment doesn't require these security layers.

To selectively deactivate the Spectre mitigations, update the `GRUB_CMDLINE_LINUX_DEFAULT` variable in your /etc/default/grub configuration:

``` bash
sudo nano /etc/default/grub
# Add to GRUB_CMDLINE_LINUX_DEFAULT
```

``` config title="/etc/default/grub"
-8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/grub-config-01.js:17:23'
```

After updating the variable, be sure to update GRUB to apply changes and then reboot:

``` bash
sudo update-grub
sudo reboot
```

This approach selectively deactivates the Spectre V2 and Spectre V4 mitigations, leaving other protections intact. For full security, keep mitigations activated unless there's a significant performance need, as disabling them could expose the system to potential attacks on affected CPUs.

## Additional Resources

For additional guidance, connect with other validators and the Polkadot engineering team in the [Polkadot Validator Lounge](https://matrix.to/#/#polkadotvalidatorlounge:web3.foundation){target=\_blank} on Element.

