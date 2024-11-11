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
        dockerFile: "huberchat/backend/Dockerfile",
        dockerContext: "huberchat/backend",
        // image: "aa/huberchat-api:f9a4f15",
        expose: [
            {
                name: "api",
                port: 8080,
                ingressPath: "/api",
            }
        ],
        env: [
            {
                name: "PORT",
                value: "8080"
            },{
                name: "OPENAI_API_KEY",
                secret: "discovery-api-openai",
                value: "token"
            }
        ],
        secrets: [{
            name: 'openai',
            onePasswordPath: 'vaults/automation/items/tf.ai.discovery.api.openai',
            type: 'environment'
        }]
    }
}

export { Api }