import { App } from "../../../../types/App";
import { CiCd } from "./components/CiCd/CiCd";

const Ops: App = {
    apiVersion: "platform.io/v1alpha1",
    kind: "app",
    metadata: {
        name: "Ops"
    },
    spec: {
        id: "Ops",
        name: "Ops",
        description: "Operations",
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
            apis: ['dns.googleapis.com'],
        },
        components: []
    }
}
CiCd.spec.app = Ops.spec.id;
Ops.spec.components?.push(CiCd);
// Echo.spec.app = Ops.spec.id;
// Ops.spec.components?.push(Echo);

export { Ops }