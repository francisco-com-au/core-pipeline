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
                name: "MONGO_INITDB_ROOT_USERNAME",
                secret: "website-api-mongo-sessions",
                value: "username"
            },{
                name: "MONGO_INITDB_ROOT_PASSWORD",
                secret: "website-api-mongo-sessions",
                value: "password"
            },{
                name: "MONGODB_USER",
                secret: "website-api-mongo-sessions",
                value: "username"
            },{
                name: "MONGODB_PASS",
                secret: "website-api-mongo-sessions",
                value: "password"
            },{
                name: "MONGO_INITDB_DATABASE",
                secret: "website-api-mongo-sessions",
                value: "db"
            },
        ],
        secrets: [{
            name: 'sessions',
            onePasswordPath: 'vaults/automation/items/tf.aa.website.api.mongo',
            type: 'environment'
        }]
    }
}

export { Mongo }