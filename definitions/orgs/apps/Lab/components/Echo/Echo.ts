import { Component } from "../../../../../../types/Component";
import { SimpleWeb } from "./containers/SimpleWeb";

const Echo: Component = {
    apiVersion: "platform.io/v1alpha1",
    kind: "component",
    metadata: {
        name: "echo"
    },
    spec: {
        id: "echo",
        name: "echo",
        description: "Free project for exploring GCP things and other stuff.",
        domainPrefix: "echo",
        source: {
            repo: "echo"
        },
        containers: [],
    }
}
SimpleWeb.spec.component = Echo.spec.id;
Echo.spec.containers?.push(SimpleWeb)

export { Echo }