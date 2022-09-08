import { App } from "../../../../types/App";
import { Playground } from "./components/Playground/Playground";
import { Echo } from "./components/Echo/Echo";

const Lab: App = {
    apiVersion: "platform.io/v1alpha1",
    kind: "app",
    metadata: {
        name: "lab"
    },
    spec: {
        id: "lab",
        name: "Lab",
        description: "A free product to test and break things manually.",
        domainName: `american-broomstick.com`,
        github: {
            organization: "francisco-com-au",
        },
        environments: [{
            name: "dev",
            type: "dev",
            branch: "develop",
        }],
        gcp: {
            roleBindings: [
                {
                    member: "",
                    roles: [],
                    environment: "dev"
                }
            ],
            apis: [
                "alloydb.googleapis.com",
                "compute.googleapis.com", // needed for alloydb clusters
                "servicenetworking.googleapis.com", // needed for alloydb clusters
            ],
        },
        components: []
    }
}
// Playground.spec.app = Lab.spec.id;
// Lab.spec.components?.push(Playground);
// Echo.spec.app = Lab.spec.id;
// Lab.spec.components?.push(Echo);

export { Lab }