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
const deploymentPatch = function(
    name: string,
    namespace: string,
    image: string,
    container: Container,
    ): string {

    return`---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  template:
    spec:
      containers:
        - name: ${container.spec.id}
          image: ${image}
`
}

export { deploymentPatch }
