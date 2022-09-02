import { App } from "../../../../types/App";
import { Playground } from "./components/Playground/Playground";

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
        github: {
            organization: "galarzafrancisco",
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
Playground.spec.app = Lab.spec.id;
Lab.spec.components?.push(Playground);

export { Lab }