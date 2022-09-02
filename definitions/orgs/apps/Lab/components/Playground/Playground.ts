import { Component } from "../../../../../../types/Component";

const Playground: Component = {
    apiVersion: "platform.io/v1alpha1",
    kind: "component",
    metadata: {
        name: "playground"
    },
    spec: {
        id: "playground",
        name: "playground",
        description: "Free project for exploring GCP things and other stuff.",
        source: {
            repo: "playground"
        },
        containers: []
    }
}

export { Playground }