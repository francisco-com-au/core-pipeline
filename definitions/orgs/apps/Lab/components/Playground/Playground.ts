import { Component } from "../../../../../../types/Component";
import { Nginx } from "./containers/Nginx";
import { SimpleWeb } from "./containers/SimpleWeb";

const Playground: Component = {
    apiVersion: "platform.io/v1alpha1",
    kind: "component",
    metadata: {
        name: "playground"
    },
    spec: {
        id: "playground",
        name: "playground",
        description: "Free project for exploring GCP things and other stuff.",
        domainPrefix: "playground",
        source: {
            repo: "playground"
        },
        containers: [],
        gcp: {
            apis: ['dns.googleapis.com']
        }
    }
}
Nginx.spec.component = Playground.spec.id;
Playground.spec.containers?.push(Nginx)
SimpleWeb.spec.component = Playground.spec.id;
Playground.spec.containers?.push(SimpleWeb)

export { Playground }