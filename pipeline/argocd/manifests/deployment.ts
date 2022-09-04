// import * as k8s from "@pulumi/kubernetes";

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
