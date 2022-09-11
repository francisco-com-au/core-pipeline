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
        description: "Session store",
        image: "mongo:3.6.23",
        expose: [
            {
                name: "mongo",
                port: 27017
            }
        ],
        env: [
            {
                name: "ENV_TEST_KEY",
                value: "ENV_TEST_VALUE"
            }
        ]
    }
}

export { Mongo }