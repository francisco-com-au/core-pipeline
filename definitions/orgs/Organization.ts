import { RoleBinding } from '../../types/GCP';
import { Org } from '../../types/Org';
import { AddressAustralia } from './apps/AddressAustralia/AddressAustralia';

const defaultRoles: RoleBinding[] = [
// gcp-viewer can view everything
{
    member: `group:gcp-viewers@${process.env.ORG_DOMAIN}`,
    roles: ["roles/viewer"],
    environment: 'dev'
},{
    member: `group:gcp-viewers@${process.env.ORG_DOMAIN}`,
    roles: ["roles/viewer"],
    environment: 'test'
},{
    member: `group:gcp-viewers@${process.env.ORG_DOMAIN}`,
    roles: ["roles/viewer"],
    environment: 'staging'
},{
    member: `group:gcp-viewers@${process.env.ORG_DOMAIN}`,
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
        name: `${process.env.ORG_SHORT_NAME}`
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
// Ops.spec.organization = Organization.spec.id;
// Organization.spec.apps?.push(Ops);

// // Mount Easy Gifts
// EasyGifts.spec.organization = Organization.spec.id;
// Organization.spec.apps?.push(EasyGifts);
// Mount Address Auastralia
AddressAustralia.spec.organization = Organization.spec.id;
Organization.spec.apps?.push(AddressAustralia);
// // Mount End To End
// EndToEnd.spec.organization = Organization.spec.id;
// Organization.spec.apps?.push(EndToEnd);
// // Mount Stocks
// Stocks.spec.organization = Organization.spec.id;
// Organization.spec.apps?.push(Stocks);
// // Mount Twister
// Twister.spec.organization = Organization.spec.id;
// Organization.spec.apps?.push(Twister);
// // Mount Bank
// Bank.spec.organization = Organization.spec.id;
// Organization.spec.apps?.push(Bank);
// // Mount AI
// AI.spec.organization = Organization.spec.id;
// Organization.spec.apps?.push(AI);
// // Mount store
// Store.spec.organization = Organization.spec.id;
// Organization.spec.apps?.push(Store);

export { Organization }