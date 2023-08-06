import { App } from "../../../../types/App";
import { Website } from "./components/Website/Website";

const LeanmoteAI: App = {
    apiVersion: "platform.io/v1alpha1",
    kind: "app",
    metadata: {
        name: "lm"
    },
    spec: {
        id: "lm",
        name: "Leanmote AI",
        description: "Leanmote AI",
        domainName: `leanmote.american-broomstick.com`,
        github: {
            organization: "leanmote-ai",
        },
        environments: [
            {
                name: "dev",
                type: "dev",
                branch: "develop",
            }
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
Website.spec.app = LeanmoteAI.spec.id;
LeanmoteAI.spec.components?.push(Website);

export { LeanmoteAI }