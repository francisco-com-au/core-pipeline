import { Container } from "../../../types/Container"

// const customImage = "node-app";
// const appImage = 'asd';
// const appLabels = { app: customImage };
// const appDeployment = new k8s.apps.v1.Deployment("app", {
//     spec: {
//         selector: { matchLabels: appLabels },
//         replicas: 1,
//         template: {
//             metadata: { labels: appLabels },
//             spec: {
//                 containers: [{
//                     name: customImage,
//                     image: appImage,
//                     ports: [{name: "http", containerPort: 80}],
//                 }],
//             }
//         },
//     }
// })
// appDeployment
const deployment = function(
    name: string,
    namespace: string,
    appId: string,
    componentId: string,
    image: string,
    container: Container,
    ): string {

    const plainEnv = container.spec.env?.filter(e => !e.secret && !e.configMap) || [];
    const secretEnv = container.spec.env?.filter(e => e.secret) || [];
    const configMapEnv = container.spec.env?.filter(e => !e.secret && e.configMap) || [];

    return`---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  selector:
    matchLabels:
      app: ${appId}
      component: ${componentId}
      container: ${container.spec.id}
  replicas: 1
  template:
    metadata:
      labels:
        app: ${appId}
        component: ${componentId}
        container: ${container.spec.id}
    spec:
      containers:
        - name: ${container.spec.id}
          image: ${image}
          imagePullPolicy: Always
          ${container.spec.expose ? `ports: ${container.spec.expose?.map(containerPort => `
            - containerPort: ${containerPort.port}`).join('')}` : ''}
          ${container.spec.env ? `env: ${plainEnv.map(e => `
            - name: ${e.name}
              value: "${e.value}"`).join('')}${secretEnv.map(e => `
            - name: ${e.name}
              valueFrom:
                secretKeyRef:
                  name: ${e.secret}
                  key: ${e.value}`).join('')}${configMapEnv.map(e => `
            - name: ${e.name}
              valueFrom:
                configMapKeyRef:
                  name: ${e.configMap}
                  key: ${e.value}`).join('')}` : ''}
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "250m"
              memory: "256Mi"
          envFrom:
            - configMapRef:
                name: app-level-config
            - configMapRef:
                name: env-level-config
            - configMapRef:
                name: component-level-config-${componentId}
            - configMapRef:
                name: container-level-config-${componentId}-${container.spec.id}
`
}

export { deployment }
