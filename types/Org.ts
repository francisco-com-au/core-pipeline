import { App } from "./App";
import { Apis, RoleBinding } from "./GCP";
import { KRM } from "./KRM"

interface Org extends KRM {
    spec: {
        /* Name of the organization. Example: "main" */
        name: string;
        /* Free text description. Example: "This is the PROD org, where all the work happens" */
        description: string;
        /* If you have a Domain Name, put it here. Not sure if this is useful but hey 🤷🏻‍♂️*/
        domain?: string;
        
        /* Google Cloud configuration */
        gcp: {
            /* GCP Organization ID */
            orgId: string;
            /* GCP Billing ID to use for projects */
            billingId: string;
            /* Roles to apply to every project */
            roleBindings?: RoleBinding[];
            /* APIs to enable in every project */
            apis?: Apis
        }

        /* Applications */
        apps?: App[]
    }
}

export { Org }
