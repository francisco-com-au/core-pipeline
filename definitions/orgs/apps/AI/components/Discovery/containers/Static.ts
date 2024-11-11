import { Container } from "../../../../../../../types/Container";

const Static: Container = {
    apiVersion: "platform.io/v1alpha1",
    kind: "container",
    metadata: {
        name: "static"
    },
    spec: {
        id: "static",
        name: "static",
        description: "NGINX serving static content",
        dockerFile: "huberchat/frontend/Dockerfile",
        dockerContext: "huberchat/frontend",
        replicas: 2,
        expose: [
            {
                name: "webserver",
                port: 80,
                ingressPath: "/",
            }
        ],
    }
}

export { Static }