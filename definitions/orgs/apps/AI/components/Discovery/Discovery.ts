import { Component } from "../../../../../../types/Component";

const Discovery: Component = {
    apiVersion: "platform.io/v1alpha1",
    kind: "component",
    metadata: {
        name: "discovery"
    },
    spec: {
        id: "discovery",
        name: "discovery",
        description: "Used to play with AI services",
        source: {
            repo: "ai-discovery",
            infraPath: 'infra',
        },
        containers: [],
        gcp: {
            apis: ['dns.googleapis.com','pubsub.googleapis.com','firestore.googleapis.com']
        }
    }
}


export { Discovery }