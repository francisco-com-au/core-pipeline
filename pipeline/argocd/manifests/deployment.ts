// import * as k8s from "@pulumi/kubernetes";

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
    container: Container,
    ): string {

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
          image: ${container.spec.image}
          ${container.spec.expose ? `ports: ${container.spec.expose?.map(containerPort => `
            - containerPort: ${containerPort.port}`).join('')}` : ''}
          ${container.spec.env ? `env: ${container.spec.env?.map(containerEnv => `
            - name: ${containerEnv.name}
              value: "${containerEnv.value}"`).join('')}` : ''}
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "250m"
              memory: "256Mi"
`
}

export { deployment }
