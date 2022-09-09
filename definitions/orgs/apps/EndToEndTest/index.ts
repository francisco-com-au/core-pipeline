import { App } from "../../../../types/App";
import { Component } from "../../../../types/Component";
import { Container } from "../../../../types/Container";


const Application: App = {
    apiVersion: "platform.io/v1alpha1",
    kind: "app",
    metadata: {
        name: "end-to-end-test",
    },
    spec: {
        id: 'e2e',
        name: 'End to end',
        description: 'End to end testing, from definition to container built',
        domainName: 'american-broomstick.com',
        github: {
            organization: 'galarzafrancisco',
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
                    repo: 'end-to-end-portal',
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
                        dockerFile: 'Dockerfile',
                        expose: [{
                            name: 'webserver',
                            port: 80,
                            ingressPath: '/'
                        }]
                    }
                }]
            }
        }]
    }
}

export { Application }