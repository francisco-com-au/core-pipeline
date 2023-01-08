import { App } from "../../../../types/App";
import { Api } from "./components/Api/Api";
import { Website } from "./components/Website/Website";

const Bank: App = {
    apiVersion: "platform.io/v1alpha1",
    kind: "app",
    metadata: {
        name: "bank"
    },
    spec: {
        id: "bank",
        name: "Bank",
        description: "Bank ",
        domainName: `bank.francisco.au`,
        github: {
            organization: "galarzafrancisco",
        },
        environments: [
            {
                name: "dev",
                type: "dev",
                branch: "develop",
            },
        ],
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
Website.spec.app = Bank.spec.id;
Bank.spec.components?.push(Website);
Api.spec.app = Bank.spec.id;
Bank.spec.components?.push(Api);

export { Bank }