---
title: '쿠버네티스 클러스터 구축[3] - Traefik'
category: kubernetes
date: 


---

![7651.vertical - Copy.png-900x506x2](imgs/logo.png)

이번 글에서는 Traefik에 대해 정리해보려고 합니다.

...그런데 Traefik에 대해 설명하려다 보니 쿠버네티스의 서비스 구조부터 설명하는 게 순서상 맞는 것 같아서, 그것부터 먼저 설명해보겠습니다. 저번 글에서도 분명히 Lens와 Prometheus에 대해 정리하려다가 쿠버네티스 클러스터의 구조에 대해 한참 정리했던 것 같습니다. 결국 이번 글도 비슷하게 되지 않을까 합니다.

# K8S 서비스 구조

쿠버네티스에서는 대부분의 대상들을 '오브젝트(Object)'로 추상화합니다. 예를 들자면 컨테이너들의 묶음인 팟(Pod), 네트워크 설정, 시크릿 키 등이 전부 오브젝트로 추상화됩니다. 이때 쿠버네티스는 어떤 서비스를 이루는 팟의 구성과 그 팟에 접근하기 위한 네트워크 구성을 서로 다른 오브젝트로 추상화합니다.

**Deployment**는 어떤 서비스를 이루는 팟이 어떻게 구성되어야 하는지를 정의합니다. 각 컨테이너가 어떻게 구성되어야 하는지, 몇 개의 레플리카가 있어야 하는지, Deployment 자체가 업데이트될 때 어떤 정책 (e.g. Rolling Update, Recreate 등)을 사용할 것인지... 와 같은 구성 설정들을 정의하는 것으로 볼 수 있습니다. Deployment 오브젝트를 생성하면 쿠버네티스 컨트롤러는 이 설정에 맞게 되도록 설정에 정의된 방식을 따라서 팟을 생성하거나 삭제합니다.

**Service**는 그렇게 정의된 팟들에 어떻게 네트워크를 연결할지 정의합니다. 서비스는 개념이 좀 복잡해서 이해하는 데 약간 시간이 걸렸었는데, 쿠버네티스 공식 독스의 Motivation을 보니까 이해가 잘 되었습니다. 그 설명을 좀 더 자세하게 풀어보겠습니다.

먼저 쿠버네티스에서는 한 서비스를 이루는 팟이 하나가 아닐 수도 있습니다. 그리고 심지어 그 팟들이 계속 동일하게 유지되고 있다고 보장할 수가 없습니다. 왜냐하면 Deployment를 변경함에 따라서 팟이 새로 생기거나 없어지거나, 바뀔 수도 있기 때문입니다. 그러므로 외부 네트워크와 팟을 직접 연결하면 설정이 엄청나게 복잡한데다 매우 자주 바뀌게 될 것입니다.

 예컨대 어떤 서비스에 사용자가 폭주하여 원래 하나의 팟으로 운영되고 있던 백엔드 서비스를 3개의 레플리카로 스케일링했다고 가정해보겠습니다. 그러면 프론트에서는 먼저 백엔드 서비스가 3개로 늘어난 것을 알아챈 후 이 3개의 팟에 균일하게 요청을 보내야 합니다. 이는 매우 비효율적인 방법입니다. 더 좋은 방법은, 백엔드에 고정된 주소를 가지는 로드밸런서를 하나 붙여 놓고, 이 로드밸런서가 자동으로 백엔드 팟들에게, 심지어 개수가 변하거나 ip 주소가 바뀐다고 하더라도, 자동으로 트래픽을 분배해주는 것입니다.

 이때 이 로드밸런서가 Service가 된다고 생각하면 되겠습니다. Service는 특정 pod들의 집합을 계속 추적하면서 들어오는 트래픽을 자신이 추적하는 pod들에게 분배해줍니다. 그러므로 프론트에서는 백에 대해 전혀 알 필요가 없이 단일한 Service에 요청을 보낼 수 있습니다.

> Pod은 dictionay 형식의 label을 가지는데, Service는 자신이 관리하는 pod들을 이 label을 통해 알아냅니다.

# Ingress

그런데 위와 같이 서비스를 바로 외부 네트워크에 연결하면 여러 문제가 발생합니다. 서비스 자체가 바로 외부 네트워크에 연결되어있기 때문에 한 클러스터에서 한 가지 서비스밖에 띄울 수가 없으며, 어떤 경우에는 클러스터 밖에서는 사용하지 않고 클러스터 내부에서만 사용하는 서비스도 있을 텐데 이런 서비스들도 전부 외부 네트워크에 연결되어버립니다.

그래서 쿠버네티스에서 서비스는 오직 클러스터 내에서만 접근이 가능하며, 클러스터 밖에서 서비스에 접근하려면 클러스터 외부와 내부를 이어주는 새로운 설정이 필요합니다. 이 설정을 담고 있는 오브젝트가 Ingress입니다.

**Ingress**는 외부에서 들어오는 요청을 여러 속성, 예컨대 path, host 등에 따라 어떤 서비스로 보낼지를 결정하는 설정입니다. 추가적으로 로드밸런싱이나  TLS termination (https로 들어오는 요청을 http로 바꾸어주는 것)을 설정할 수도 있습니다.

다만 ingress는 일종의 설정일 뿐이고, 실제로 이를 실행하는 오브젝트는 **Ingress Controller**입니다. Ingress controller는 설정된 Ingress에 따라 외부에서 들어온 요청을 내부의 적절한 서비스로 라우팅해줍니다.

정리하자면, 쿠버네티스 외부에서 어떤 서비스에 요청을 보내면 Ingress Controller → Service → Pod 의 순서로 접근이 이루어집니다.

# Traefik

Traefik은 앞서 설명한 Ingress controller 의 일종입니다. 즉, Ingress를 설정해주면 Traefik은 이를 읽고 실제 라우팅을 수행합니다. Traefik의 설치 방법은 [공식 홈페이지](https://doc.traefik.io/traefik/v1.7/user-guide/kubernetes/)에 나와 있으므로 다시 언급하지는 않겠습니다. 설치 방법이 두 가지가 있는데, 저는 Helm chart를 사용하니 설치가 편해서 좋았습니다.

그리고 Treafik에서는 좀 더 상세한 설정을 위해 Ingress 대신 IngressRoute라는 CRD(Custom Resource Definition)를 사용할 수도 있습니다. 저는 간단하게 Ingress의 확장 버전이라 이해하고 있습니다.

## 예시

먼저 간단한 Whoami 서비스를 구현해보겠습니다. 아래와 같이 3개의 replica를 가지는 Deployment를 생성해줍니다.

> 혹시 쿠버네티스를 처음 접하는 사람이 있을까 하여 설명하자면, 아래 오브젝트들을 클러스터에 배포하기 위해서는 `.yaml` 혹은 `.yml` 형식으로 저장한 후 `kubectl apply -f 파일이름.yaml`  커맨드를 사용하여 배포하면 됩니다.

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

다음으로 위 Deployment를 통해 생성된 팟들에게 트래픽을 배분해줄 서비스를 생성해주겠습니다.

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

selector를 이용하여 `app:whoami` 레이블을 가지는 pod들을 선택하는 것을 확인할 수 있습니다.

마지막으로 Traefik IngressRoute를 정의해주겠습니다.

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

끝! 심플합니다. 위 `whoami.server.unknownpgr.com`은 제 서버의 도메인이며, 적절히 바꾸어 사용하시면 되겠습니다. 위와 같이 설정하면 제 서버로 들어오는 트래픽 중 `whoami.server.unknownpgr.com`으로 들어오는 트래픽은 모두 whoami 서비스로 라우팅됩니다. 위 `match` 부분에는 다양한 함수 및 연산자를 사용할 수 있으며, [Traefik 공식 도큐먼트의 Routing 부분](https://doc.traefik.io/traefik/v2.4/routing/routers/)을 참고하시면 됩니다.

# 예외

저는 가상 머신 위에서 작업을 하다 보니 한 머신이 여러 네트워크에 속해 있었고, 따라서 IP가 여러 개 할당되어있는 상태였습니다. 그런데 어쩌다 보니 설정이 잘못되었는지, Traefik service의 external ip가 외부 네트워크가 아닌 내부 네트워크로 잡혀 있어 외부에서는 접근이 불가능하게 되었습니다. 저는 그냥 Lens에서 service의 external ip를 바꿔 주는 방식으로 해결했습니다.

# 참고문헌

Traefik을 설치할 때 정리를 제대로 해 두지 않아 어떤 자료를 참고했는지 기억이 나지 않습니다...

다만 대부분 공식 홈페이지를 참고하였으므로 글 내부의 링크를 모두 참고 문헌으로 간주해주시기 바랍니다.
