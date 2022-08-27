import { Org } from '../../types/Org';
import { HelloWorld } from './apps/HelloWorld/HelloWorld';


const Test: Org = {
    apiVersion: "platform.io/v1alpha1",
    kind: "org",
    metadata: {
        name: "test"
    },
    spec: {
        name: "test",
        description: "Test Organization",
        domain: "test.francisco.com.au",
        gcp: {
            orgId: `${process.env.ORG_ID}`,
            billingId: `${process.env.BILLING_ID}`,
            apis: [
                "cloudbilling.googleapis.com",
                "logging.googleapis.com",
                "iam.googleapis.com",
                "serviceusage.googleapis.com",
            ]
        },
        apps: []
    }
}
HelloWorld.spec.organization = Test.spec.name;
Test.spec.apps?.push(HelloWorld)

export { Test }