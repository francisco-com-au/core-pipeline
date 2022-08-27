import { Component } from "../../../../../../types/Component";
import { Nginx } from "./containers/Nginx"

const Website: Component = {
    apiVersion: "platform.io/v1alpha1",
    kind: "component",
    metadata: {
        name: "website"
    },
    spec: {
        name: "website",
        description: "Website",
        source: {
            repo: "website"
        },
        containers: []
    }
}
Nginx.spec.component = Website.spec.name;
Website.spec.containers?.push(Nginx)

export { Website }