import { KRM } from './KRM'

interface Container extends KRM {
    spec: {
        /* Name of the container. Example: "static" or "api" */
        name: string;
        /* Free text description. Example: "Contains the static assets wrapped in an NGINX server" */
        description: string;
        /* Name of the parent component. Can be populated programatically if this container is added to the component object. */
        component?: string;
        /* Image to run. */
        image: string;

        /* Ports to expose via services */
        expose?: ContainerPort[];
        
        /* Environment variables to inject in the container */
        env?: ContainerEnv[];
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
    /* Value of the environment variable */
    value: string;
}

export { Container, ContainerPort, ContainerEnv }