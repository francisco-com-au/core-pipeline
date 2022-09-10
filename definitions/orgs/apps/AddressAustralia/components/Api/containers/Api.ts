import { Container } from "../../../../../../../types/Container";

const Api: Container = {
    apiVersion: "platform.io/v1alpha1",
    kind: "container",
    metadata: {
        name: "api"
    },
    spec: {
        id: "api",
        name: "api",
        description: "API",
        dockerFile: "Dockerfile",
        dockerContext: ".",
        expose: [
            {
                name: "api",
                port: 8080,
                ingressPath: "/",
            }
        ],
        env: [
            {
                name: "PORT",
                value: "8080"
            },
            {
                name: "SOLR_PORT",
                value: "8985"
            },
            {
                name: "SOLR_PROTOCOL",
                value: "http"
            }
        ]
    }
}

export { Api }