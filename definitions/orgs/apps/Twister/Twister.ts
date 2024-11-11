import { App } from "../../../../types/App";
import { Api } from "./components/Api/Api";
import { Website } from "./components/Website/Website";

const Twister: App = {
    apiVersion: "platform.io/v1alpha1",
    kind: "app",
    metadata: {
        name: "tw"
    },
    spec: {
        id: "tw",
        name: "Twister",
        description: "Mock replica of Twitter.",
        domainName: `twister.american-broomstick.com`,
        github: {
            organization: "galarzafrancisco",
        },
        environments: [
            {
                name: "dev",
                type: "dev",
                branch: "develop",
            },
            // {
            //     name: "beta",
            //     type: "dev",
            //     branch: "beta",
            // },
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
Website.spec.app = Twister.spec.id;
Twister.spec.components?.push(Website);
Api.spec.app = Twister.spec.id;
Twister.spec.components?.push(Api);

export { Twister }