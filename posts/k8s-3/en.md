---
title: Building a Kubernetes Cluster [3] - Traefik
tags:
  - kubernetes
date: 2021-09-01T23:01:24.540Z
---

> This post was translated from Korean into English by AI.

![7651.vertical - Copy.png-900x506x2](imgs/logo.png)

In this post, I will cover Traefik. To understand how Traefik works, you first need to understand the Kubernetes Service architecture. So before getting into Traefik, I would like to give an overview of how Kubernetes Services are structured.

In the previous post, I also set out to cover Lens and Prometheus but seem to have spent quite a while discussing the structure of a Kubernetes cluster. I suspect this post will ultimately turn out much the same way.

# Kubernetes Service Architecture

Kubernetes abstracts most things as "objects." For example, Pods—which are groups of containers—along with network configurations, secret keys, and storage are all abstracted as objects. Kubernetes represents the composition of the Pods that make up a service and the network configuration used to access those Pods as separate objects.

A **Deployment** defines how the Pods that make up a service should be configured. You can think of it as defining configuration such as which images the containers in each Pod use, which values are provided as environment variables, how many replicas of those containers should exist, and which policy (e.g., Rolling Update, Recreate, etc.) to use when those replicas are updated. When a Deployment object is created, the Kubernetes controller creates or deletes Pods according to the method defined in the configuration so that the actual state matches it.

> Strictly speaking, the Pod specification and replica count are managed by a ReplicaSet, while a Deployment can be thought of as an extension of a ReplicaSet that adds a method for performing updates. (In fact, creating a Deployment creates a ReplicaSet.) However, creating ReplicaSets directly is not recommended when using Kubernetes; users are advised to create only Deployments directly, so I have skipped the explanation of ReplicaSets.

A **Service** defines how networking should be connected to the Pods defined in this way. The concept of a Service is somewhat complicated, so it took me a little while to understand, but the Motivation section of the official Kubernetes documentation made it clear to me. Let me expand on that explanation in a little more detail.

First, a service in Kubernetes may consist of more than one Pod. Moreover, there is no guarantee that those Pods will remain the same. This is because changing a Deployment may cause Pods to be created, removed, or replaced. Connecting an external network directly to Pods would therefore make the configuration extremely complicated and subject to very frequent changes.

For example, suppose a service experiences a surge in users and a backend service that had originally been running as a single Pod is scaled to three replicas. The frontend would first have to detect that the backend service had expanded to three Pods and then distribute requests evenly among them. This is very inefficient. A better approach is to put a load balancer with a fixed address in front of the backend and have it automatically distribute traffic among the backend Pods, even if their number changes or their IP addresses change.

You can think of this load balancer as the Service. A Service continually tracks a particular set of Pods and distributes incoming traffic among the Pods it tracks. The frontend can therefore send requests to a single Service without needing to know anything at all about the backend Pods.

> Pods have labels in dictionary format, and a Service identifies the Pods it manages through these labels.

# Ingress

However, connecting Services directly to an external network as described above creates several problems. Because each Service itself is connected directly to the external network, only one kind of service can be hosted in a cluster. In addition, some Services may be intended for use only inside the cluster rather than from outside it, yet those Services would all be connected to the external network as well.

For this reason, Kubernetes Services are accessible only from within the cluster by default. Accessing a Service from outside the cluster requires a new configuration that connects the outside of the cluster to the inside. The object containing this configuration is an Ingress.

An **Ingress** is a configuration that determines which Service should receive an incoming external request based on properties such as its path or domain. You can additionally configure load balancing or TLS termination (converting requests received over HTTPS to HTTP).

However, an Ingress is merely a kind of configuration; the component that actually executes it is the **Ingress Controller**. An Ingress Controller routes requests arriving from outside the cluster to the appropriate internal Services according to the configured Ingress.

In summary, when a request is sent to a Service from outside Kubernetes, access proceeds in the following order: Ingress Controller → Service → Pod.

# Traefik

Traefik is a type of Ingress Controller, as described above. In other words, once an Ingress is configured, Traefik reads it and performs the actual routing. Instructions for installing Traefik are available on the [official website](https://doc.traefik.io/traefik/v1.7/user-guide/kubernetes/), so I will not repeat them here. There are two installation methods; I used the Helm chart and found it very convenient.

Traefik also lets you use a CRD (Custom Resource Definition) called IngressRoute instead of Ingress for more detailed configuration. I understand it simply as an extended version of Ingress.

## Example

First, let us implement a simple Whoami service. Create a Deployment with three replicas as shown below.

> In case anyone reading this is new to Kubernetes: to deploy the objects below to a cluster, save them in `.yaml` or `.yml` format and run the command `kubectl apply -f filename.yaml`.

```yaml
kind: Deployment
apiVersion: apps/v1
metadata:
  namespace: default
  name: whoami
  labels:
    app: whoami
spec:
  replicas: 3
  selector:
    matchLabels:
      app: whoami
  template:
    metadata:
      labels:
        app: whoami
    spec:
      containers:
        - name: whoami
          image: traefik/whoami
          ports:
            - name: web
              containerPort: 80
```

Next, we will create a Service to distribute traffic among the Pods created by the Deployment above.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: whoami
spec:
  ports:
    - protocol: TCP
      name: web
      port: 80
  selector:
    app: whoami
```

You can see that the selector is used to select Pods with the `app:whoami` label.

Finally, we will define a Traefik IngressRoute.

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: ingressroute-whoami
spec:
  entryPoints:
    - web
  routes:
  - match: Host(`whoami.server.unknownpgr.com`)
    kind: Rule
    services:
    - name: whoami
      port: 80
```

Done! It is simple. The `whoami.server.unknownpgr.com` above is my server's domain; replace it with an appropriate domain for your own use. With the configuration above, all traffic reaching my server for `whoami.server.unknownpgr.com` is routed to the whoami Service. You can use various functions and operators in the `match` section above; see the [Routing section of the official Traefik documentation](https://doc.traefik.io/traefik/v2.4/routing/routers/) for details.

# Exception

Because I was working on a virtual machine, one machine belonged to multiple networks and consequently had several IP addresses assigned to it. Somehow, perhaps because I had misconfigured something, the external IP of the Traefik Service was set to the internal network rather than the external network, making it inaccessible from outside. I resolved this simply by changing the Service's external IP in Lens.

# References

I did not keep proper notes when installing Traefik, so I cannot remember which resources I consulted...

However, I referred mostly to the official website, so please consider all the links in this post to be references.
