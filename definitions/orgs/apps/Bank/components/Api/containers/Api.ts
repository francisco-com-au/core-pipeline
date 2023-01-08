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
        dockerFile: "api/Dockerfile",
        dockerContext: "api",
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
                name: "PROJECT_ID",
                value: "tf-aa-website-dev-338608"
            },{
                name: "GOOGLE_APPLICATION_CREDENTIALS",
                value: "/etc/secrets/google/key.json"
            },
        ],
        secrets: [
            {
                name: "google",
                onePasswordPath: 'vaults/automation/items/tf.bank.api.api.google',
                type: 'file'
            }
        ]
    }
}

export { Api }
