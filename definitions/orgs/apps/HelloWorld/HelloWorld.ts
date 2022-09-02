import { App } from "../../../../types/App";
import { Website } from "./components/Website/Website";

const HelloWorld: App = {
    apiVersion: "platform.io/v1alpha1",
    kind: "app",
    metadata: {
        name: "hello-world"
    },
    spec: {
        id: "hw",
        name: "Hello World",
        description: "Toy application to test the core pipeline",
        github: {
            organization: "test-hello-world",
        },
        environments: [{
            name: "dev",
            type: "dev",
            branch: "develop",
        }],
        gcp: {
            apis: [
                "alloydb.googleapis.com",
                "compute.googleapis.com", // needed for alloydb clusters
                "servicenetworking.googleapis.com", // needed for alloydb clusters
            ],
        },
        components: []
    }
}
Website.spec.app = HelloWorld.spec.id;
HelloWorld.spec.components?.push(Website);

export { HelloWorld }