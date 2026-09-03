---
title: Building a Kubernetes Cluster [5] - Multi-Node
tags:
  - kubernetes
date: 2021-09-18T01:01:29.384Z
---

> This post was translated from Korean into English by AI.

Until now, I had done everything on a single-node cluster. I thought that if I ever needed more nodes, I could simply attach them. But I struggled with this seemingly simple task far more than I had expected. In this post, I will summarize the problems I encountered while joining a new node to my existing master node and how I solved them.

![3bce3a1c-d5f7-4b5f-91df-27a177cae772](imgs/3bce3a1c-d5f7-4b5f-91df-27a177cae772.png)

# Node Fails to Join

The very first problem I ran into was that the node simply would not join. I use K3S, and even when I ran the installation script, it did not display so much as an error message. I did check the error logs using `systemctl`, but all I saw were ordinary Connection refused-type errors, which provided no particularly useful information. After wandering around GitHub for a long time, I found the issue below and learned that I needed to set the `--node-external-ip=<<public-ip>>` flag separately on the master node.

- [https://github.com/k3s-io/k3s/issues/1523#issuecomment-637844241](https://github.com/k3s-io/k3s/issues/1523#issuecomment-637844241)

I believe this problem occurred because Kubernetes accepts join requests only through the network configured as the node's external IP. I was running my nodes in VirtualBox virtual machines, so the first interface was connected to a network with a `10.0.x.y` address that was accessible only from within each virtual machine. The external IP was probably set to an address in this network range, causing all requests coming from other networks to be ignored. I ran both the master and worker as virtual machines and connected them to the host machine in bridged mode, so all of the virtual machines were connected directly to the same router network as the host. I therefore changed the master's external IP to an IP address on the router's internal network, which solved the problem.

What made this even more confusing—and rather absurd—was that the connection was not failing completely. After deleting and recreating the virtual machine, I checked the error logs and found a message saying that the hostname was not unique. Of course, I had set the hostnames to be unique. So I searched through the cluster's secrets and found the node-password secret corresponding to the worker node. (A node-password secret is issued once for each node in the cluster.)

This meant that, during an earlier attempt before I deleted the virtual machine, the worker node had successfully connected to the master node and obtained a node-password. Thinking about it, the process of obtaining the node-password must take place through the apiserver (because the apiserver is readily accessible from external networks), while some subsequent step must take place through kube-proxy (because the communication path between the master and worker has to be either the apiserver or kube-proxy). This makes me wonder whether kube-proxy was somehow affected by the external IP...

# Pods Cannot Communicate with Each Other

After going through the process above, I eventually managed to join the node successfully. But when I deployed a new service, I encountered a strange problem: I could not connect to it. I kept getting Gateway timeout errors. I tracked down the problem through the following process.

1. (Even though a Gateway timeout has nothing to do with the image) Could the image be the problem...? → Changing it does not help
2. Discover that the new service is running on the worker node
3. Move one of the existing, properly functioning services to the worker node → It stops working after the move
4. Can the nodes communicate with each other? → They must be able to, since the join succeeded
5. Can the pods communicate with each other? → Ping tests show that pods on the same node can communicate, but pods on different nodes cannot
6. Can the nodes communicate through the CNI interface? → Pings do not get through
7. Conclusion: This is clearly a CNI problem

To use Hubble, I installed the Cilium CNI instead of Flannel, which is installed by default. It seemed obvious that this was the problem. At some point, I had read that Cilium does not touch pods that were deployed before Cilium itself. I think it may have been in the troubleshooting documentation below, but I am not certain.

- [https://docs.cilium.io/en/v1.10/operations/troubleshooting/](https://docs.cilium.io/en/v1.10/operations/troubleshooting/)

So I simply deleted every pod that might have been causing trouble, including the Cilium operator and the Treafik service. (They would be recreated anyway.) Then, as if by magic, every problem described above disappeared(...) I do not know why this worked either. Even while the problem was occurring, I had clearly been able to see the Cilium interface on the worker node using the `ip route` and `ip addr` commands, and I had confirmed that a Cilium pod was running on both the master node and the worker node.

# Conclusion

When a program throws an error or refuses to cooperate, turning it off and back on makes things better. I have now confirmed that Kubernetes clusters are no exception.
