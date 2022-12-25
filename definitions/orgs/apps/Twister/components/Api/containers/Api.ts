import { Container } from "../../../../../../../types/Container";

const Api: Container = {
    apiVersion: "platform.io/v1alpha1",
    kind: "container",
    metadata: {
        name: "api"
    },
    spec: {
        id: "api",
        name: "api",
        description: "API",
        dockerFile: "Dockerfile",
        dockerContext: ".",
        expose: [
            {
                name: "api",
                port: 8080,
                ingressPath: "/",
            }
        ],
        env: [
            {
                name: "PORT",
                value: "8080"
            },{
                name: "MONGO_HOST",
                value: "mongo"
            },{
                name: "MONGO_PORT",
                value: "27017"
            },{
                name: "MONGO_DB_NAME",
                value: "twister"
            },
            // },{
            //     name: "MONGO_INITDB_ROOT_USERNAME",
            //     secret: "api-database-mongo",
            //     value: "username"
            // },{
            //     name: "MONGO_INITDB_ROOT_PASSWORD",
            //     secret: "api-database-mongo",
            //     value: "password"
            // },{
            //     name: "MONGODB_USER",
            //     secret: "api-database-mongo",
            //     value: "username"
            // },{
            //     name: "MONGODB_PASS",
            //     secret: "api-database-mongo",
            //     value: "password"
            // },{
            //     name: "MONGO_INITDB_DATABASE",
            //     secret: "api-database-mongo",
            //     value: "db"
            // },
        ],
        secrets: []
    }
}

export { Api }
