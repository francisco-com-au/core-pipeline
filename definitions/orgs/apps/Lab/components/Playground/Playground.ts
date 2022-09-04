import { Component } from "../../../../../../types/Component";
import { Nginx } from "./containers/Nginx";

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
        containers: []
    }
}
Nginx.spec.component = Playground.spec.id;
Playground.spec.containers?.push(Nginx)

export { Playground }