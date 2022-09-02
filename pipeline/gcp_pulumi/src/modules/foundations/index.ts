// Import types
import { OrgFolders } from "../../types/folders";
import {Apis} from "../../../../../types/GCP";
import { Org } from "../../../../../types/Org"

// Import packages
import * as gcp from "@pulumi/gcp";


/*
org
├─ App 1 folder
│  ├─ Environment 1 folder
│  │  ├─ Component 1 project
│  │  └─ Component 2 project
│  │
│  └─ Environment 2 folder
│     ├─ Component 1 project
│     └─ Component 2 project
│
└─ App 2 folder
   ├─ Environment 1 folder
   │  ├─ Component 1 project
   │  └─ Component 2 project
   │
   └─ Environment 2 folder
      ├─ Component 1 project
      └─ Component 2 project
*/

export function makeFolders(org: Org): OrgFolders {
    // Initiate an org folder object to create a graph
    // of folders.
    const orgFolders: OrgFolders = {};
    console.log(`org.spec.gcp.orgId ${org.spec.gcp.orgId}`)
    orgFolders[org.spec.id] = {
        gcpOrgId: org.spec.gcp.orgId,
        apps: {},
    };
    
    // Figure out what folders are needed
    org.spec.apps?.forEach(app => {
        orgFolders[org.spec.id].apps[app.spec.id] = {
            name: app.spec.name,
            environments: {}
        };
        app.spec.environments.forEach(environment => {
            const roles = app.spec.gcp?.roleBindings?.filter(role => role.environment === environment.type)
            orgFolders[org.spec.id].apps[app.spec.id].environments[environment.name] = {
                roles
            };
        });
    });

    // Make folders
    Object.keys(orgFolders).forEach(orgId => {
        // Make app level folders
        Object.keys(orgFolders[orgId].apps).forEach(appId => {
            const app = orgFolders[orgId].apps[appId];
            const appFolder = new gcp.organizations.Folder(`${orgId}.${appId}`, {
                displayName: app.name,
                parent: `organizations/${orgFolders[orgId].gcpOrgId}`
            });
            orgFolders[orgId].apps[appId].gcpFolderId = appFolder.id;
            // Make environment level folders
            Object.keys(app.environments).forEach(envName => {
                const envFolder = new gcp.organizations.Folder(`${orgId}.${appId}.${envName}`, {
                    displayName: envName,
                    parent: appFolder.id
                });
                orgFolders[orgId].apps[appId].environments[envName].gcpFolderId = envFolder.id;
                // Apply IAM
                app.environments[envName].roles?.forEach(role => {
                    role.roles.forEach(gcpRole => {
                        const folder = new gcp.folder.IAMMember(`${orgId}.${appId}.${envName}.${role.member}.${gcpRole}`, {
                            folder: envFolder.id,
                            member: role.member,
                            role: gcpRole,
                        });
                    });
                });
            });
        });
    });

    return orgFolders;
}



export function makeProjects(org: Org, orgFolders: OrgFolders) {
    org.spec.apps?.forEach(app => {
        app.spec.components?.forEach(component => {
            // Find environment folders
            const environments = orgFolders[org.spec.id].apps[app.spec.id].environments;
            Object.keys(environments).forEach(envName => {
                // Calculate project ID
                const projectId = `${org.spec.id}-${app.spec.id}-${component.spec.id}-${envName}-2`;
                // Calculate APIs to enable (inherit from org and app)
                const apis: Apis = [];
                org.spec.gcp?.apis?.forEach(api => apis.indexOf(api) === -1 ? apis.push(api) : null);
                app.spec.gcp?.apis?.forEach(api => apis.indexOf(api) === -1 ? apis.push(api) : null);
                component.spec.gcp?.apis?.forEach(api => apis.indexOf(api) === -1 ? apis.push(api) : null);
                // Make the project 🔥
                console.log(`Org: ${org.spec.id} - App: ${app.spec.id} - Component: ${component.spec.id} - Env: ${envName}`)
                const project = new gcp.organizations.Project(projectId, {
                    folderId: environments[envName].gcpFolderId?.apply(a => `${a}`),
                    name: projectId,
                    projectId: projectId,
                    billingAccount: org.spec.gcp.billingId,
                    labels: {
                        'organization': org.spec.id.replace(/ /g, '-').toLowerCase(),
                        'app': app.spec.id.replace(/ /g, '-').toLowerCase(),
                        'environment_name': `${app.spec.environments.find(e => e.name == envName)?.name}`.toLowerCase(),
                        'environment_type': `${app.spec.environments.find(e => e.name == envName)?.type}`.toLowerCase(),
                        'created_by': 'pulumi',
                    },
                });
                // Enable APIs
                apis.forEach(api => {
                    new gcp.projects.Service(`${org.spec.id}.${app.spec.id}.${component.spec.id}.${envName}.${api}`, {
                        disableDependentServices: true,
                        project: project.projectId,
                        service: api,
                    });
                })
            });
        });
    });
}