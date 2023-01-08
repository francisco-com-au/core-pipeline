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
                name: "MONGO_HOST",
                value: "api-database-mongo"
            },{
                name: "MONGO_PORT",
                value: "27017"
            },{
                name: "MONGO_DB_NAME",
                value: "twister"
            },
        ],
        secrets: []
    }
}

export { Api }
