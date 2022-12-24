import { Container } from "../../../../../../../types/Container";

const Database: Container = {
    apiVersion: "platform.io/v1alpha1",
    kind: "container",
    metadata: {
        name: "database"
    },
    spec: {
        id: "database",
        name: "database",
        description: "Database to store all the tweets",
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
                secret: "api-database-mongo",
                value: "username"
            },{
                name: "MONGO_INITDB_ROOT_PASSWORD",
                secret: "api-database-mongo",
                value: "password"
            },{
                name: "MONGODB_USER",
                secret: "api-database-mongo",
                value: "username"
            },{
                name: "MONGODB_PASS",
                secret: "api-database-mongo",
                value: "password"
            },{
                name: "MONGO_INITDB_DATABASE",
                secret: "api-database-mongo",
                value: "db"
            },
        ],
        secrets: [{
            name: 'mongo',
            onePasswordPath: 'vaults/automation/items/tf.tw.api.database.mongo',
            type: 'environment'
        }]
    }
}

export { Database }
