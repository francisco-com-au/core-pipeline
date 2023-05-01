import { Component } from "../../../../../../types/Component";
import { Api as ApiContainer } from "./containers/Api";

const Api: Component = {
    apiVersion: "platform.io/v1alpha1",
    kind: "component",
    metadata: {
        name: "api"
    },
    spec: {
        id: "api",
        name: "api",
        description: "Customer facing API to search.",
        source: {
            repo: "ai-api",
            infraPath: 'infra',
        },
        domainPrefix: "api",
        containers: [],
        gcp: {
            apis: ['dns.googleapis.com']
        }
    }
}

ApiContainer.spec.component = Api.spec.id;
Api.spec.containers?.push(ApiContainer);

export { Api }