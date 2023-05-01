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
        replicas: 2,
        expose: [
            {
                name: "api",
                port: 8080,
                ingressPath: "/",
            }
        ],
        probe: {
            path: '/health',
            port: 8080,
            scheme: 'HTTP'
        },
        env: [
            {
                name: "PORT",
                value: "8080"
            },{
                name: "OPEN_AI_KEY",
                secret: "api-api-openai",
                value: "token"
            },
        ],
        secrets: [{
            name: 'openai',
            onePasswordPath: 'vaults/automation/items/tf.ai.api.api.openai',
            type: 'environment'
        }]
    }
}

export { Api }
