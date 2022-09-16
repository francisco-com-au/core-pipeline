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
        env: [{
                name: "PORT",
                value: "8080"
            },{
                name: "FIRESTORE_PROJECT_ID", // this is hosted in the website project
                value: "tf-aa-website-dev-338608"
            },{
                name: "GOOGLE_APPLICATION_CREDENTIALS",
                value: "/etc/secrets/google/key.json"
            },{
                name: "SOLR_PORT",
                value: "8985"
            },{
                name: "SOLR_PROTOCOL",
                value: "http"
            }
        ],
        secrets: [{
            name: 'google',
            onePasswordPath: 'vaults/automation/items/tf.aa.api.api.google',
            type: 'file'
        }]
    }
}

export { Api }
