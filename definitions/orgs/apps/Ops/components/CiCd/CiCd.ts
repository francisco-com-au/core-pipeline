import { Component } from "../../../../../../types/Component";

const CiCd: Component = {
    apiVersion: "platform.io/v1alpha1",
    kind: "component",
    metadata: {
        name: "cicd"
    },
    spec: {
        id: "cicd",
        name: "ci/cd",
        description: "CI/CD components such as build definitions and artifacts.",
        source: {
            repo: "cicd"
        },
        containers: [],
        gcp: {
            apis: [
                "cloudbuild.googleapis.com",
                "pubsub.googleapis.com",
            ],
        }
    }
}

export { CiCd }