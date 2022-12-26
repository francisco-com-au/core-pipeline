import { KRM } from './KRM'

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


export { Container, ContainerPort, ContainerEnv }