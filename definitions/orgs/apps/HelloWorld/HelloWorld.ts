import { App } from "../../../../types/App";
import { Website } from "./components/Website/Website";

const HelloWorld: App = {
    apiVersion: "platform.io/v1alpha1",
    kind: "app",
    metadata: {
        name: "hello-world"
    },
    spec: {
        name: "hello-world",
        description: "Hello World application",
        github: {
            organization: "test-hello-world",
        },
        environments: [{
            name: "dev",
            type: "dev",
            branch: "develop",
        }],
        components: []
    }
}
Website.spec.app = HelloWorld.spec.name;
HelloWorld.spec.components?.push(Website);

export { HelloWorld }