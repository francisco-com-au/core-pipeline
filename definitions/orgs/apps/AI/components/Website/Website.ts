import { Component } from "../../../../../../types/Component";
import { Api } from "./containers/Api";
import { Static } from "./containers/Static";

const Website: Component = {
    apiVersion: "platform.io/v1alpha1",
    kind: "component",
    metadata: {
        name: "website"
    },
    spec: {
        id: "website",
        name: "website",
        description: "Customer facing Web app.",
        source: {
            repo: "ai-website",
            infraPath: 'infra',
        },
        containers: [],
        gcp: {
            apis: ['dns.googleapis.com','pubsub.googleapis.com','firestore.googleapis.com']
        }
    }
}

Static.spec.component = Website.spec.id;
Website.spec.containers?.push(Static);
Api.spec.component = Website.spec.id;
Website.spec.containers?.push(Api);

export { Website }