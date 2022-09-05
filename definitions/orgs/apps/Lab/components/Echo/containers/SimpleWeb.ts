import { Container } from "../../../../../../../types/Container";

const SimpleWeb: Container = {
    apiVersion: "platform.io/v1alpha1",
    kind: "container",
    metadata: {
        name: "simple-web"
    },
    spec: {
        id: "simple-web",
        name: "simple-web",
        description: "App to test ",
        image: "yeasy/simple-web:latest",
        expose: [
            {
                name: "server",
                port: 80,
                ingressPath: "/",
            }
        ]
    }
}


export { SimpleWeb }