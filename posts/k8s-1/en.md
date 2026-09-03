---
title: Building a Kubernetes Cluster [1] - Virtual Machines
tags:
  - kubernetes
date: 2021-06-25T17:10:36.838Z
---

> This post was translated from Korean into English by AI.

![Vagrant logo](imgs/1500px-Vagrant-logo.png)

As you may know if you saw my previous post, I recently bought a fairly powerful mini computer. One of the main reasons I bought it was to study Kubernetes. So I tried installing Kubernetes, and I would like to document the process here.

# Vagrant

I had actually tinkered with Kubernetes a little before. I do not remember the details very well, but I must have installed something incorrectly, because I struggled with it for quite a while before giving up. Back then, using a virtual machine did not occur to me, so I repeatedly installed and uninstalled Kubernetes directly on the host computer. This time, however, I first set up a virtual machine with Vagrant and then installed Kubernetes on top of it so that the same thing would not happen again.

Vagrant is a kind of Infrastructure as Code (IaC)-based virtual machine management tool. As the name suggests, IaC refers to a system that lets you manage infrastructure in the form of code. That code might be `yaml` or `json`, or it might literally be a script written in something like `python`. Vagrant lets you create virtual machines from a configuration file called a `Vagrantfile`. Therefore, as long as you have the `Vagrnatfile`, you can always create the same virtual machine. This makes it very useful when you need to create several virtual machines with identical environments or run tests repeatedly in the same environment. And because this `Vagrantfile`, like a `Dockerfile`, is just a text file, it can also be version-controlled with Git.

One difference between a `Dockerfile` and a `Vagrantfile` is that a `Dockerfile` uses its own language, whereas a `Vagrantfile` is simply a script written in Ruby. It is intuitive enough, of course, that you can easily understand it even if you know no Ruby at all.

Vagrant itself, however, is neither a virtual machine nor virtualization software. Vagrant interacts with virtualization software such as VirtualBox and VMware, or platforms such as AWS and GCP, to manage their virtual machines. To use Vagrant, therefore, you need either to have VirtualBox or something similar installed already, or to integrate it with a platform such as AWS.

Vagrant manages virtual machines on a per-directory basis. Create a file named `Vagrantfile` in a directory, enter the appropriate settings in it, and run the `vagrant up` command; a virtual machine will then be created and started according to the settings in the `Vagrantfile`. You can connect to the resulting virtual machine with the `vagrant ssh` command.

Information about the virtual machine created this way is stored in a hidden directory called `.vagrant`. I have never experienced this myself, but apparently editing the `Vagrantfile` incorrectly can sometimes cause conflicts with a previously created virtual machine. In that case, you can delete the `.vagrant` directory.

## Writing a Vagrantfile

A `Vagrantfile` is, in fact, an ordinary `Ruby` script. I do not know how to use Ruby, of course, so I just worked it out by intuition. Below is the `Vagrantfile` I wrote. If you want to use this script, you will need to change the IP address as appropriate for your own network.

```Ruby
Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/focal64"
  config.vm.network "public_network", ip: "172.30.1.100"
  config.vm.synced_folder '.', '/vagrant', disabled: true
  config.vm.provider "virtualbox" do |v|
    v.memory = 16384
    v.cpus = 4
  end
  config.disksize.size = '200GB'
  config.vm.provision "shell", path: "bootstrap.sh"
end
```

- `  config.vm.box = "ubuntu/focal64"` : Sets the virtual machine image to use.
- `config.vm.network "public_network", ip: "172.30.1.100"` : Connects it to the host machine using a Bridged Adapter and assigns a static IP address. Bridged Adapters are explained below.
- `  config.vm.synced_folder '.', '/vagrant', disabled: true` : By default, Vagrant mounts the folder containing the `Vagrantfile` inside the virtual machine at the `/vagrant` directory. I disabled this for security reasons.
- `v.memory = 16384`, `v.cpus = 4` : Sets the amount of memory and the number of CPUs. I configured it with 16 GB and 4 cores.
- `  config.disksize.size = '200GB'` : Determines the disk size. This only works if you separately install the `disksize` plugin.
- `  config.vm.provision "shell", path: "bootstrap.sh"` Runs the specified shell script after the virtual machine has been created.

Alongside the `Vagrantfile` in the same directory is the following `bootstrap.sh` file.

```bash
ip route add default via 172.30.1.1
echo 'vagrant:some-password-for-vagrant' | sudo chpasswd
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config
systemctl restart sshd.service
curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644
```

- `ip route add default via 172.30.1.1` : `172.30.1.1` is the address of the router I use. If you do not configure this, outgoing packets will always pass through the host machine, making the virtual machine inaccessible from outside.

- ```bash
  echo 'vagrant:some-password-for-vagrant' | sudo chpasswd
  sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config
  systemctl restart sshd.service
  ```

  - The section above changes the password of the default user, `vagrant`, and then modifies the settings to allow SSH access using a password.

- `curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644` Finally, installs `k3s`, a lightweight Kubernetes distribution.

### Configuring Virtual Machine Accounts and the Rabbit Holes I Went Down

- On most virtual machines created with Vagrant, the default username and password are both `vagrant`, and the `Vagrantfile` has **no option** for changing them.
  - If you look at the SSH configuration section on the official Vagrant website, you will see an option that appears to configure the username. However, it does not change the username inside the virtual machine; it configures the username to use when connecting via SSH. Changing it will therefore prevent you from connecting to the virtual machine.
  - To change the username, you must use a script in the `Vagrantfile` either to create a new user or to rename the default `vagrant` user.
  - I got this mixed up and spent an hour or two... sigh...
- By default, Vagrant is configured to connect via SSH using a keyfile. **Connecting with a password is generally not possible.**
  - If you visit the official Vagrant website, you will see an option for setting a password. But again, this sets the password to use when connecting via SSH; it does not set the password inside the virtual machine. Setting the password with this option will therefore prevent you from connecting to the virtual machine.
  - To set a password, you must use a script in the `Vagrantfile`, as shown above, to set the password and then permit password-based access in `sshd_config`.
  - I also mistook this for a way to set the password inside the virtual machine... and lost another hour or two...
  - If I understand this correctly, virtual machines allow only keyfile-based connections by default, and the keyfile is not generated randomly: it has a fixed value determined by the image. These keyfiles are all publicly available so that people can use the virtual machines.
  - In the past, therefore, virtual machines created by Vagrant from the same image all had the same key, making them highly vulnerable from a security standpoint. In other words, if an administrator forgot to replace the keyfile, anyone could connect to the machine.
  - To solve this problem, recent versions of Vagrant first connect to a newly created virtual machine using that fixed keyfile and then replace the existing key with a key generated randomly by Vagrant itself.
- The `Vagrantfile` above contains a section that runs a shell script. However, Vagrant runs this shell script only after the virtual machine has been fully created and Vagrant has connected to it via SSH.
  - Therefore, if you enable the SSH username or password settings in the `Vagrantfile`, the SSH connection itself becomes impossible, as described above, so the shell script cannot run either.

### Virtual Machine Network Modes and the Rabbit Holes I Went Down

Virtual machines can use several network modes. The two most commonly used modes are Network Address Translation (NAT) mode and Bridged Adapter mode. [This article](https://www.nakivo.com/blog/virtualbox-network-setting-guide/) explains them in great detail, so I will provide only a brief explanation here.

#### Network Address Translation (NAT)

Intuitively, you can think of NAT mode as creating a virtual router for the virtual machine inside your computer. (Real routers use NAT too, so it really is essentially the same thing.) Think of it as creating a router whose external IP address is the host machine's IP address. Just as we can access both the router's own IP address from behind a router (I do not mean accessing the configuration page through the default gateway; I mean that the router's external IP address is accessible) and the internet, this method allows you to access both the host machine and the internet from inside the virtual machine.

When you use a router, packets created inside the router's network all appear from outside the router to have originated from the router itself. Likewise, packets created by a virtual machine in NAT mode all appear from outside the host to have originated from the host.

Also, just as you cannot access devices behind a router from outside it without port forwarding, NAT mode makes it impossible to access the virtual machine from the host machine or the internet. You can, of course, use NAT mode and configure port forwarding on the host machine, but in that case using the Bridged Network mode described below is much more convenient.

#### Bridged Adapter

Bridged Adapter mode directly connects the virtual machine, through one of the host's network cards, to the network to which the host is connected. Thus, although there is physically one machine, there are logically two devices. As you can see in the `Vagrantfile` above, I connected the server to my router and connected the virtual machine using a Bridged Adapter. After doing so, the router's network page showed two IP addresses and two MAC addresses. It is equivalent to connecting another physical machine to the router in parallel, rather than a virtual machine.

Naturally, the virtual machine and the host machine can therefore access each other over the LAN, and the virtual machine can also be accessed externally if you configure port forwarding on the router.

This may appear completely trouble-free, but the real problem lies inside the virtual machine. When I manually set the IP address in the `Vagrantfile` for the purpose of port forwarding, DHCP did not work at all, so a default gateway was not assigned automatically either. With a configuration like mine, however, the virtual machine's internal network consists of NAT mode enabled by default with a Bridged Adapter added on top. Consequently, the internet works just fine, making it appear as though Bridged Adapter mode has been configured correctly, while external connections still fail—an odd situation indeed. I had no idea this was happening and assumed only that something was wrong with the Bridged Adapter configuration, so I wandered around in circles for quite a while yet again.

The correct approach is either to configure DHCP or, as I did, use a shell script to add another default gateway.

## Connecting to the Virtual Machine

If the `Vagrantfile` has been written correctly, you can connect using the `vagrant up` command as mentioned earlier. Of course, because the `Vagrantfile` above permits password-based connections, you can also connect with the `ssh vagrant@172.30.1.100` command.

# References

- [https://www.nakivo.com/blog/virtualbox-network-setting-guide/](https://www.nakivo.com/blog/virtualbox-network-setting-guide/)
  - This provides a very detailed explanation of virtual machine networking. It is an excellent article not only for virtual machines, but also for understanding general networking concepts such as NAT and bridges, so I strongly recommend reading it.
- [https://www.vagrantup.com/docs/index](https://www.vagrantup.com/docs/index)
  - The official Vagrant docs.
