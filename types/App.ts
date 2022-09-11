import { KRM } from "./KRM";
import { Component } from "./Component";
import { EnvironmentTypes } from "./Environments"
import { RoleBinding, Apis } from "./GCP"

interface App extends KRM {
    spec: {
        /* Short name to append to use as the projectIds */
        id: string;
        /* Name of the application. Example: "Super App". */
        name: string;
        /* Free text description. Example: "This App is the shit!". */
        description: string;
        /* Name of the parent organization. Can be populated programatically. */
        organization?: string;

        /* Domain name of the app. If present will create an ingress and tls certs. */
        domainName?: string;

        /* GitHub configuration */
        github: {
            /* Name of the GitHub organization containing repos */
            organization: string;
        }
        
        /* GCP configuration */
        gcp?: {
            /* Can add extra IAM bindings here */
            roleBindings?: RoleBinding[];
            /* Can enable extra APIs here */
            apis?: Apis;
        }

        /* Environments */
        environments: AppEnvironments[]

        /* Components */
        components?: Component[]
    }
}

interface AppEnvironments {
    /* Name. Example: "dev", "prod", "testing-something" */
    name: string;
    
    /* Type of the environment. Has IAM implications. Options: dev|test|prod */
    type: EnvironmentTypes;
    
    /* I need to wrap my head around this but the idea is that you can
    create a new environment and tell it what branch of the source repo to use.
    The hard part is that this app has many components, each one with its own repo.
    Additionally, the containers reference images, not branches, so not sure
    how this will work. */
    branch?: string;
}

export { App }