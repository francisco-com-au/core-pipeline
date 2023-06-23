import { Component } from "../../../../../../types/Component";
import { Api } from "./containers/Api";
import { Static } from "./containers/Static";

const Discovery: Component = {
    apiVersion: "platform.io/v1alpha1",
    kind: "component",
    metadata: {
        name: "discovery"
    },
    spec: {
        id: "discovery",
        name: "discovery",
        domainPrefix: "huberchat",
        description: "Used to play with AI services",
        source: {
            repo: "ai-discovery",
            infraPath: 'infra',
        },
        containers: [],
        gcp: {
            apis: [
                'dns.googleapis.com',
                'pubsub.googleapis.com',
                'firestore.googleapis.com',
                'aiplatform.googleapis.com',
                'notebooks.googleapis.com'
            ]
        }
    }
}

Static.spec.component = Discovery.spec.id;
Discovery.spec.containers?.push(Static);
Api.spec.component = Discovery.spec.id;
Discovery.spec.containers?.push(Api);


export { Discovery }