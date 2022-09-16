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
        description: "API for the front end",
        dockerFile: "backend/Dockerfile",
        dockerContext: "backend",
        // image: "aa/website-api:f9a4f15",
        expose: [
            {
                name: "api",
                port: 8080,
                ingressPath: "/api",
            }
        ],
        env: [{
                name: "PORT",
                value: "8080"
            },{
                name: "PROJECT_ID",
                value: "tf-aa-website-dev-338608"
            },{
                name: "GOOGLE_APPLICATION_CREDENTIALS",
                value: "/etc/secrets/google/key.json"
            },{
                name: 'MONGO_PORT',
                value: '27017'
            },{
                name: "MONGO_COLLECTION",
                secret: "website-api-mongo-sessions",
                value: "db"
            },{
                name: "MONGO_USER_NAME",
                secret: "website-api-mongo-sessions",
                value: "username"
            },{
                name: "MONGO_PASSWORD",
                secret: "website-api-mongo-sessions",
                value: "password"
            },{
                name: "COOKIE_NAME",
                secret: "website-api-mongo-sessions",
                value: "cookie_name"
            },{
                name: "COOKIE_SECRET",
                secret: "website-api-mongo-sessions",
                value: "cookie_secret"
            },{
                name: "SENDGRID_API_KEY",
                secret: "website-api-sendgrid-key",
                value: "key"
            },{
                name: "STRIPE_SECRET_KEY",
                secret: "website-api-stripe-key",
                value: "secret_key"
            },{
                name: "STRIPE_PUBLISHABLE_KEY",
                secret: "website-api-stripe-key",
                value: "publishable_key"
            },{
                name: "STRIPE_WEBHOOK_SECRET",
                secret: "website-api-stripe-key",
                value: "webhook_secret"
            },{
                name: "MAIL_USERNAME",
                secret: "website-api-mail-key",
                value: "MAIL_USERNAME"
            },{
                name: "MAIL_PASSWORD",
                secret: "website-api-mail-key",
                value: "MAIL_PASSWORD"
            }
        ],
        secrets: [{
            name: 'google',
            onePasswordPath: 'vaults/automation/items/tf.aa.website.api.google',
            type: 'file'
        },{
            name: 'sendgrid-key',
            onePasswordPath: 'vaults/automation/items/tf.aa.website.api.sendgrid',
            type: 'environment'
        },{
            name: 'stripe-key',
            onePasswordPath: 'vaults/automation/items/tf.aa.website.api.stripe',
            type: 'environment'
        },{
            name: 'mail-key',
            onePasswordPath: 'vaults/automation/items/tf.aa.website.api.mail',
            type: 'environment'
        }]
    }
}

export { Api }