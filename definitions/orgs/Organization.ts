import { RoleBinding } from '../../types/GCP';
import { Org } from '../../types/Org';
import { Lab } from './apps/Lab/Lab';

const defaultRoles: RoleBinding[] = [
// gcp-viewer can view everything
{
    member: `group:gcp-viewer@${process.env.ORG_DOMAIN}`,
    roles: ["roles/viewer"],
    environment: 'dev'
},{
    member: `group:gcp-viewer@${process.env.ORG_DOMAIN}`,
    roles: ["roles/viewer"],
    environment: 'test'
},{
    member: `group:gcp-viewer@${process.env.ORG_DOMAIN}`,
    roles: ["roles/viewer"],
    environment: 'staging'
},{
    member: `group:gcp-viewer@${process.env.ORG_DOMAIN}`,
    roles: ["roles/viewer"],
    environment: 'prod'
},
// gcp-developers own dev, edit test & staging and view prod
{
    member: `group:gcp-developers@${process.env.ORG_DOMAIN}`,
    roles: ["roles/owner"],
    environment: 'dev'
},{
    member: `group:gcp-developers@${process.env.ORG_DOMAIN}`,
    roles: ["roles/editor"],
    environment: 'test'
},{
    member: `group:gcp-developers@${process.env.ORG_DOMAIN}`,
    roles: ["roles/editor"],
    environment: 'staging'
},{
    member: `group:gcp-developers@${process.env.ORG_DOMAIN}`,
    roles: ["roles/viewer"],
    environment: 'prod'
}];

const Organization: Org = {
    apiVersion: "platform.io/v1alpha1",
    kind: "org",
    metadata: {
        name: "test"
    },
    spec: {
        id: `${process.env.ORG_SHORT_NAME}`,
        name: `${process.env.ORG_NAME}`,
        description: `${process.env.ORG_DESCRIPTION}`,
        domain: `${process.env.ORG_DOMAIN}`,
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
Lab.spec.organization = Organization.spec.id;
Organization.spec.apps?.push(Lab)

export { Organization }