import { Component } from "../../../../../../types/Component";
import { Mongo } from "./containers/Mongo";
import { Static } from "./containers/Static";
import { Api } from "./containers/Api";

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

Static.spec.component = Website.spec.id;
Website.spec.containers?.push(Static)

Api.spec.component = Website.spec.id;
Website.spec.containers?.push(Api)

export { Website }