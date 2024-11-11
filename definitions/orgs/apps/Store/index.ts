import { App } from "../../../../types/App";

const Store: App = {
    apiVersion: "platform.io/v1alpha1",
    kind: "app",
    metadata: {
        name: "store",
    },
    spec: {
        id: 'store',
        name: 'store',
        description: 'Store app to handle inventory, order and sell stuff',
        domainName: 'american-broomstick.com',
        github: {
            organization: 'galarzafrancisco',
        },
        gcp: {
            apis: [
                'firestore.googleapis.com',
            ],
        },
        environments: [{
            name: 'dev',
            type: 'dev',
            branch: 'develop'
        }],
        components: [{
            apiVersion: "platform.io/v1alpha1",
            kind: "component",
            metadata: {
                name: "portal"
            },
            spec: {
                id: 'portal',
                name: 'portal',
                description: 'Simple web app',
                source: {
                    repo: 'store-portal',
                    infraPath: 'infra',
                },
                containers: [{
                    apiVersion: "platform.io/v1alpha1",
                    kind: "container",
                    metadata: {
                        name: "static"
                    },
                    spec: {
                        id: 'static',
                        name: 'static',
                        description: "NGINX serving static content",
                        dockerFile: 'src/Dockerfile',
                        dockerContext: 'src',
                        expose: [{
                            name: 'webserver',
                            port: 8080,
                            ingressPath: '/'
                        }],
                        secrets: [{
                            name: 'demo',
                            onePasswordPath: 'vaults/automation/items/tf.store.portal.demo',
                            type: 'file'
                        }]
                    }
                }]
            }
        }]
    }
}

export { Store }