import { App } from "../../../../types/App";
import { Website } from "./components/Website/Website";

const AddressAustralia: App = {
    apiVersion: "platform.io/v1alpha1",
    kind: "app",
    metadata: {
        name: "aa"
    },
    spec: {
        id: "aa",
        name: "Address Australia",
        description: "Address Australia.",
        domainName: `addressaustralia.com.au`,
        github: {
            organization: "address-australia",
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
            ],
        },
        components: []
    }
}
Website.spec.app = AddressAustralia.spec.id;
AddressAustralia.spec.components?.push(Website);
\
export { AddressAustralia }