import { RoleBinding } from '../../types/GCP';
import { Org } from '../../types/Org';
import { Lab } from './apps/Lab/Lab';

const defaultRoles: RoleBinding[] = [{
    member: "user:franciscogalarza@gmail.com",
    roles: ["roles/owner"],
    environment: 'dev'
},{
    member: "user:franciscogalarza@gmail.com",
    roles: ["roles/editor"],
    environment: 'test'
},{
    member: "user:franciscogalarza@gmail.com",
    roles: ["roles/editor"],
    environment: 'staging'
},{
    member: "user:franciscogalarza@gmail.com",
    roles: ["roles/viewer"],
    environment: 'prod'
}];

const Test: Org = {
    apiVersion: "platform.io/v1alpha1",
    kind: "org",
    metadata: {
        name: "test"
    },
    spec: {
        id: "tfran",
        name: "Test Fran",
        description: "Used to test platform configuration",
        domain: "test.francisco.com.au",
        gcp: {
            orgId: `${process.env.ORG_ID}`,
            billingId: `${process.env.BILLING_ID}`,
            apis: [
                "cloudbilling.googleapis.com",
                "logging.googleapis.com",
                "iam.googleapis.com",
                "serviceusage.googleapis.com",
            ],
            roleBindings: defaultRoles,
        },
        apps: []
    }
}
HelloWorld.spec.organization = Test.spec.id;
Test.spec.apps?.push(Lab)

export { Test }