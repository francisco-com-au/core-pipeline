import { Container } from "../../../../../../../types/Container";

const Nginx: Container = {
    apiVersion: "platform.io/v1alpha1",
    kind: "container",
    metadata: {
        name: "nginx"
    },
    spec: {
        id: "nginx",
        name: "nginx",
        description: "Boilerplate NGINX container",
        image: "nginx:latest",
        expose: [
            {
                name: "root",
                port: 8080,
                ingressPath: "/",
            }
        ]
    }
}

export { Nginx }