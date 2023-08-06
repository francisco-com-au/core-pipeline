import { Component } from "../../../../../../types/Component";
import { Static } from "./containers/Static";

const Website: Component = {
    apiVersion: "platform.io/v1alpha1",
    kind: "component",
    metadata: {
        name: "mock-ui"
    },
    spec: {
        id: "mock-ui",
        name: "mock-ui",
        description: "Customer facing Web app.",
        source: {
            repo: "mock-ui",
            infraPath: 'infra',
        },
        containers: [],
        gcp: {
            apis: ['dns.googleapis.com','pubsub.googleapis.com','firestore.googleapis.com']
        }
    }
}

Static.spec.component = Website.spec.id;
Website.spec.containers?.push(Static)

export { Website }