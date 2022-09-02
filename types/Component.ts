import { KRM } from "./KRM";
import { Container } from "./Container";
import { Apis, RoleBinding } from "./GCP";

interface Component extends KRM {
    spec: {
        /* Short name  */
        id: string;
        /* Name of the component. Example: "website" */
        name: string;
        /* Free text description. Example: "Front End. Includes Static and API" */
        description: string;
        /* Name of the parent application. Can be populated programatically. */
        app?: string;
        /* Prefix to prepend to the app's domain name.
        For example, if the app's domain is "example.com" and this domainPrefix is set to "api"
        then the component will be available on "api.example.com". */
        domainPrefix?: string;

        /* Repository */
        source: {
            /* Name of the GitHub repo to use/create */
            repo: string;
            /* Name of the GitHub organization to use. If omitted the App's configuration applies. */
            organization?: string;
        }

        /* GCP configuration */
        gcp?: {
            /* Can add extra IAM bindings here */
            roleBindings?: RoleBinding[];
            /* Can enable extra APIs here */
            apis?: Apis;
        }

        /* Containers to run. */
        containers?: Container[]
    }
}

export { Component }