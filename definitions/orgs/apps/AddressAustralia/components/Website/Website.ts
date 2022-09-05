import { Component } from "../../../../../../types/Component";
import { Mongo } from "./containers/Mongo";

const Website: Component = {
    apiVersion: "platform.io/v1alpha1",
    kind: "component",
    metadata: {
        name: "website"
    },
    spec: {
        id: "website",
        name: "website",
        description: "Front end stuff.",
        domainPrefix: "website",
        source: {
            repo: "website"
        },
        containers: [],
        gcp: {
            apis: ['dns.googleapis.com']
        }
    }
}
Mongo.spec.component = Website.spec.id;
Website.spec.containers?.push(Mongo)

export { Website }