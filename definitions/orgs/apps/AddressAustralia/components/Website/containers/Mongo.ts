import { Container } from "../../../../../../../types/Container";

const Mongo: Container = {
    apiVersion: "platform.io/v1alpha1",
    kind: "container",
    metadata: {
        name: "mongo"
    },
    spec: {
        id: "mongo",
        name: "mongo",
        description: "Boilerplate NGINX container",
        image: "mongo:3.6.23",
        expose: [
            {
                name: "mongo",
                port: 27017,
                ingressPath: "/",
            }
        ]
    }
}

export { Mongo }