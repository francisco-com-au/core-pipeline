import { App } from "../../../../types/App";
import { Component } from "../../../../types/Component";
import { Container } from "../../../../types/Container";


const EasyGifts: App = {
    apiVersion: "platform.io/v1alpha1",
    kind: "app",
    metadata: {
        name: "easy-gifts",
    },
    spec: {
        id: 'eg',
        name: 'Easy Gifts',
        description: 'Gift recommender',
        domainName: 'gifts.american-broomstick.com',
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
                name: "website"
            },
            spec: {
                id: 'website',
                name: 'website',
                description: 'Front end',
                source: {
                    repo: 'easy.gifts-front-end',
                    infraPath: 'infra',
                },
                containers: [
                    {
                        apiVersion: "platform.io/v1alpha1",
                        kind: "container",
                        metadata: {
                            name: "static"
                        },
                        spec: {
                            id: 'static',
                            name: 'static',
                            description: "NGINX serving static content",
                            dockerFile: 'frontend/Dockerfile',
                            dockerContext: 'frontend',
                            expose: [{
                                name: 'nginx',
                                port: 80,
                                ingressPath: '/'
                            }]
                        }
                    }, {
                        apiVersion: "platform.io/v1alpha1",
                        kind: "container",
                        metadata: {
                            name: "api"
                        },
                        spec: {
                            id: 'api',
                            name: 'api',
                            description: "website's api",
                            dockerFile: 'backend/Dockerfile',
                            dockerContext: 'backend',
                            expose: [{
                                name: 'nginx',
                                port: 8080,
                                ingressPath: '/api'
                            }]
                        }
                    }
                ]
            }
        }]
    }
}

export { EasyGifts }