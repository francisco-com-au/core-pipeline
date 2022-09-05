import { Container, ContainerPort } from "../../../types/Container"

const ingressPatch = function(
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
kind: Ingress
apiVersion: networking.k8s.io/v1
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  tls:
    - hosts:
        - ${domainName}
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
              number: ${p.port}`).join('')}
`
}

export { ingressPatch }
