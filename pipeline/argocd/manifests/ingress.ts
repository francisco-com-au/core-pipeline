import { Container, ContainerPort } from "../../../types/Container"

const ingress = function(
        name: string,
        namespace: string,
        domainName: string,
        containers: Container[],
    ): string {

    const portsToExpose: ContainerPort[] = [];
    const svcName: string[] = [];
    containers.forEach(container => {
        container.spec.expose?.forEach(containerPort => {
            if (containerPort.ingressPath) {
                portsToExpose.push(containerPort);
                svcName.push(`${name}-${container.spec.id}-${containerPort.name}`);
            }
        });
    });
    
    return `---
# argo external
kind: Ingress
apiVersion: networking.k8s.io/v1
metadata:
  name: ${name}
  namespace: ${namespace}
  annotations:
    nginx.ingress.kubernetes.io/backend-protocol: https # ingress-nginx
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - ${domainName}
    secretName: ${name}-tls
  rules:
  - host: ${domainName}
    http:
      paths: ${portsToExpose.map((p, idx ) => `
      - path: ${p.ingressPath}
        pathType: Prefix
        backend:
          service:
            name: ${svcName[idx]}
            port:
              number: ${p.port}
      `)}
    #   - path: /
    #     pathType: Prefix
    #     backend:
    #       service:
    #         name: argo-server
    #         port:
    #           number: 2746
`
}

export { ingress }
