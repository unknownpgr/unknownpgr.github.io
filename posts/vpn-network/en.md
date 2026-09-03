---
title: Resolving Network Issues Caused by a VPN
tags:
  - network
date: 2023-12-29T09:57:44.019Z
---

> This post was translated from Korean into English by AI.

While working with a VPN, I ran into a networking issue. This post describes the problem and how I resolved it.

# Problem

The situation was as follows.

- Server A and Server B need to communicate with each other.
- Server A and Server B are on different private networks and can only be accessed through a VPN.
- The VPN uses a commercial VPN network.
- A VPN client is installed and running on Server B.
- Server B's network and VPN settings cannot be changed.
- Server A's configuration can be changed, but obtaining a public IP address is not possible.
- I performed this work from my laptop (Host) by connecting to the servers over SSH.
- Host is on the same private network as Server A.

So I tried the following process.

1. Install a VPN client on Server A.
2. Connect Server A to the VPN.
3. Attempt to communicate from Server A to Server B.

However, as soon as I performed step 2, the SSH connection to Server A was lost.

## Diagnosis

After investigating the issue, I found that it occurred for the following reasons.

- When Server A connects to the VPN, a route is added to its routing table that directs traffic for the VPN network range to the VPN server.
- Coincidentally, Server A's private network was a subnet of the VPN network range.
- Because Host connected to Server A through Server A's private network, inbound traffic reached Server A normally.
- However, because Server A's private network range was included in the VPN network range, outbound traffic was sent to the VPN server. This was because the route in the routing table had a higher priority than the default gateway.
- The VPN server did not know Host's IP address, so routing failed and Host could no longer connect to Server A.

## Solution

First, because it would be inconvenient to lose network connectivity every time I ran a test, I created a container and conducted the tests inside it. Containers separate network namespaces, isolating routing tables and other network settings so they do not affect the host machine.

To describe the problem more specifically:

- Server A is running a service in a container.
- Assume that port 80 is exposed.
- Port 80 must be accessible through both Server A's private-network IP address and the VPN IP address assigned to Server A.

I used the following approach to solve the problem.

- Run a container that includes the VPN client and forward port 80.
  - This makes port 80 accessible from both the private network and the VPN network range.
- Set the service container's network namespace to that of the VPN container.
  - Use the `--net=container:<container-name>` option.
  - If you use Docker Compose, you can use the `network_mode: "service:<container-name>"` option.
  - In this case, the two containers use the same network namespace, so be aware that port conflicts can occur.
- Add a routing rule that sends traffic through the container network's default gateway when the source IP address belongs to the container network range.
  - This cannot be accomplished with an ordinary routing rule; policy-based routing is required.
  - Add the rules as follows.
    - `ip rule add from <container-network> table <table-name>`
    - `ip route add <server-a-private-network> via <container-gateway> dev <container-interface> table <table-name>`

The final step works because the destination IP address of inbound traffic—and therefore the source IP address of outbound traffic—differs depending on the path the traffic takes.

- When connecting through Server A's private network, the Docker network performs NAT.
  - Therefore, the destination IP address becomes the container network IP address rather than Server A's private-network IP address.
- When connecting through the VPN network, the VPN connection itself was established inside the container, so the destination IP address belongs to the VPN network range.
- A TCP connection is identified by `src ip addr, src port, dst ip addr, dst port`, so the source IP address of outbound traffic also differs accordingly.
- In other words, different routing rules can be applied based on the source IP address of outbound traffic, even when its destination belongs to both networks.

# References

- https://www.tldp.org/HOWTO/Adv-Routing-HOWTO/lartc.netfilter.html
- https://www.tldp.org/HOWTO/Adv-Routing-HOWTO/lartc.rpdb.multiple-links.html
- https://stackoverflow.com/questions/31435640/ip-route-add-by-specifying-source-address-in-the-same-network
- https://superuser.com/questions/376667/how-to-route-only-specific-subnet-source-ip-to-a-particular-interface
