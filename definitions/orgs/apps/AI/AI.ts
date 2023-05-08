import { App } from "../../../../types/App";
import { Website } from "./components/Website/Website";

const AI: App = {
    apiVersion: "platform.io/v1alpha1",
    kind: "app",
    metadata: {
        name: "tw"
    },
    spec: {
        id: "ai",
        name: "AI",
        description: "Playground for AI stuff.",
        domainName: `ai.home.galarza.business`,
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
Website.spec.app = AI.spec.id;
AI.spec.components?.push(Website);

export { AI }