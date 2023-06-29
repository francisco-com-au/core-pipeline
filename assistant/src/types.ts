interface KRM {
    apiVersion: string;
    kind: string;
    metadata: {
        name: string;
        labels?: {
            [key: string]: string
        }[];
        annotations?: {
            [key: string]: string
        }[]
    };
};

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
            /* Folder to put the infrastructure */
            infraPath?: string;
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

interface Container extends KRM {
    spec: {
        /* Short name */
        id: string;
        /* Name of the container. Example: "static" or "api" */
        name: string;
        /* Free text description. Example: "Contains the static assets wrapped in an NGINX server" */
        description: string;
        /* Name of the parent component. Can be populated programatically if this container is added to the component object. */
        component?: string;
        /* Image to run. */
        image?: string;
        /* If image is not present will create a build trigger using:
            - the parent component's repo
            - the parent application environment's branch
            - the path to the dockerfile specified here
        */
        dockerFile?: string;
        dockerContext?: string;

        /* Number of replicase to use. Defaults to 1 */
        replicas?: number;

        /* Defines endpoint to query */
        probe?: {
            path: string,
            port: number,
            scheme: 'HTTP' | 'HTTPS',
        };

        /* Ports to expose via services */
        expose?: ContainerPort[];
        
        /* Environment variables to inject in the container */
        env?: ContainerEnv[];

        /* Secrets to mount */
        secrets?: ContainerSecret[];
    }
}

interface ContainerPort {
    /* Name of the service to create */
    name: string
    /* Port number both for the container and the service */
    port: number
    /* If specified, will create an ingress path in the ingress controller.
    For example, if the app's domain is "example.com", the component's domainPrefix
    is "api" and this ingressPath is "health" then the container will be
    available on "api.example.com/health". */
    ingressPath?: string
}

interface ContainerEnv {
    /* Name of the environment variable */
    name: string;
    /* If present, the value will come from a secret with this name. */
    secret?: string;
    /* If present, the value will come from a configMap with this name. Secret takes priority. */
    configMap?: string;
    /* If present, the secret will be retrieved from 1 Password. */
    onePassword?: string;
    /* Literal value of the environment variable.
    If secret or configMap are present, this becomes the key used to find the value. */
    value: string;
}

interface ContainerSecret {
    /* Name of the secret */
    name: string;
    /* Path within 1 password */
    onePasswordPath: string;
    /* Mount the secret as a file or as env variables? */
    type: 'file' | 'environment'
}

interface RoleBinding {
    member: string;
    roles: string[];
    environment?: EnvironmentTypes;
}

type Apis = string[];

type EnvironmentTypes = "dev" | "test" | "staging" | "prod"

interface Org extends KRM {
    spec: {
        /* Short name to append to use as an identifier and append to projectIds */
        id: string;
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
