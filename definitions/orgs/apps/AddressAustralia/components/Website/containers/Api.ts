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
        description: "API for the front end",
        dockerFile: "build/Dockerfile",
        image: "aa/website-api",
        expose: [
            {
                name: "api",
                port: 8080,
                ingressPath: "/api",
            }
        ],
    }
}

export { Api }