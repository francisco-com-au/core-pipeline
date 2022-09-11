/*
I need to split this into modules.
This creates basic folders, projects and IAM based on app definitions.
*/

// Import types
import { OrgFolders } from "../../types/folders";
import {Apis, RoleBinding} from "../../../../../types/GCP";
import { Org } from "../../../../../types/Org"

// Import packages
import * as gcp from "@pulumi/gcp";
import * as random from "@pulumi/random";
import { Project } from "@pulumi/gcp/organizations";
// import moment from 'moment'


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

export function makeFolders(org: Org, ciProject: gcp.organizations.Project): OrgFolders {
    // Initiate an org folder object to create a graph
    // of folders.
    const orgFolders: OrgFolders = {};
    console.log(`org.spec.gcp.orgId ${org.spec.gcp.orgId}`)
    orgFolders[org.spec.id] = {
        gcpOrgId: org.spec.gcp.orgId,
        roleBindings: org.spec.gcp.roleBindings,
        apps: {},
    };
    
    // Figure out what folders are needed
    org.spec.apps?.forEach(app => {
        orgFolders[org.spec.id].apps[app.spec.id] = {
            name: app.spec.name,
            environments: {}
        };
        app.spec.environments.forEach(environment => {
            const orgRoleBindings = org.spec.gcp.roleBindings?.filter(role => role.environment === environment.type) || [];
            const appRoleBindings = app.spec.gcp?.roleBindings?.filter(role => role.environment === environment.type) || [];
            const roleBindings: RoleBinding[] = [...orgRoleBindings, ...appRoleBindings];
            orgFolders[org.spec.id].apps[app.spec.id].environments[environment.name] = {
                roleBindings
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
                ['roles/resourcemanager.folderEditor', 'roles/resourcemanager.projectCreator', 'roles/resourcemanager.projectDeleter', 'roles/editor'].forEach(role => {
                    console.log(`role ${role}`)
                    new gcp.folder.IAMMember(`${orgId}.${appId}.${envName}.serviceAccount:cicd.${role}`, {
                        folder: envFolder.id,
                        member: ciProject.projectId.apply(projectId => `serviceAccount:cicd-${appId}-${envName}@${projectId}.iam.gserviceaccount.com`),
                        role: role,
                    });
                });
                app.environments[envName].roleBindings?.forEach(roleBinding => {
                    roleBinding.roles.forEach(role => {
                        const folderIam = new gcp.folder.IAMMember(`${orgId}.${appId}.${envName}.${roleBinding.member}.${role}`, {
                            folder: envFolder.id,
                            member: roleBinding.member,
                            role: role,
                        });
                    });
                });
            });
        });
    });

    return orgFolders;
}



export function makeProjects(org: Org, orgFolders: OrgFolders, ciProject: Project) {
    org.spec.apps?.forEach(app => {
        app.spec.components?.forEach(component => {
            // Find environment folders
            const environments = orgFolders[org.spec.id].apps[app.spec.id].environments;
            Object.keys(environments).forEach(envName => {
                // Calculate project ID
                const projectId = `${org.spec.id}-${app.spec.id}-${component.spec.id}-${envName}`;
                const randomId = new random.RandomId(projectId, {
                    byteLength: 3,
                    keepers: {
                        org: `${org.spec.id}`,
                    },
                });    
            
                // Calculate APIs to enable (inherit from org and app)
                const apis: Apis = [];
                org.spec.gcp?.apis?.forEach(api => apis.indexOf(api) === -1 ? apis.push(api) : null);
                app.spec.gcp?.apis?.forEach(api => apis.indexOf(api) === -1 ? apis.push(api) : null);
                component.spec.gcp?.apis?.forEach(api => apis.indexOf(api) === -1 ? apis.push(api) : null);
                
                // Make the project 🔥
                console.log(`Org: ${org.spec.id} - App: ${app.spec.id} - Component: ${component.spec.id} - Env: ${envName}`)
                const project = new gcp.organizations.Project(projectId, {
                    folderId: environments[envName].gcpFolderId?.apply(folderId => `${folderId}`),
                    name: projectId,
                    projectId: randomId.hex.apply(id => `${projectId}-${id}`),
                    billingAccount: org.spec.gcp.billingId,
                    labels: {
                        'organization': org.spec.name.replace(/ /g, '-').toLowerCase(),
                        'app': app.spec.name.replace(/ /g, '-').toLowerCase(),
                        'environment_name': `${app.spec.environments.find(e => e.name == envName)?.name}`.toLowerCase(),
                        'environment_type': `${app.spec.environments.find(e => e.name == envName)?.type}`.toLowerCase(),
                        'created_by': 'pulumi',
                        // 'pulumi_last_reconciled': `${(moment(new Date())).format('YYYMMDD-HHmmss')}`
                    },
                });

                // Enable APIs
                apis.forEach(api => {
                    new gcp.projects.Service(`${org.spec.id}.${app.spec.id}.${component.spec.id}.${envName}.${api}`, {
                        disableDependentServices: true,
                        project: project.projectId,
                        service: api,
                    }, {dependsOn: [project]});
                });

                // Create build trigger for infra components
                console.log(`component.spec.source ${JSON.stringify(component.spec.source)}`)
                if (component.spec.source.infraPath) {
                    const repoOrg = component.spec.source.organization || app.spec.github.organization;
                    const repoName = component.spec.source.repo;
                    const env = app.spec.environments.filter(e => e.name == envName)[0];
                    const branch = env?.branch || envName;
                    ciProject.projectId.apply(projectId => console.log(`Service Account: cicd-${app.spec.id}-${envName}@${projectId}.iam.gserviceaccount.com`))
                    const buildTrigger = new gcp.cloudbuild.Trigger(`${org.spec.id}.cicd.infra.component.${app.spec.id}.${component.spec.id}.${envName}`, {
                            project: ciProject.projectId,
                            name: `component-infra-${app.spec.id}-${component.spec.id}-${envName}`.substring(0, 63),
                            github: {
                                name: repoName,
                                owner: repoOrg,
                                push: {
                                    branch: `^${branch}$`,
                                },
                            },
                            includedFiles: [`${component.spec.source.infraPath}/**`],
                            includeBuildLogs: "INCLUDE_BUILD_LOGS_WITH_STATUS",
                            build: {
                                steps: [
                                    {
                                        id: "Infra 🔧",
                                        name: "pulumi/pulumi",
                                        entrypoint: "/bin/sh",
                                        args: [
                                            "-c", `
                                            set -e -x
                                            cd ${component.spec.source.infraPath}
                                            npm install
                                            pulumi login
                                            pulumi stack select ${envName} -c
                                            pulumi config set gcp:project $$COMPONENT_PROJECT_ID
                                            pulumi up -y
                                            `
                                        ],
                                        envs: [
                                            'COMPONENT_PROJECT_ID=$_COMPONENT_PROJECT_ID',
                                            'PULUMI_ACCESS_TOKEN=$_INSECURE_SUBSTITUTION_PULUMI_ACCESS_TOKEN',
                                        ]
                                    }
                                ],
                            },
                            substitutions: {
                                _COMPONENT_PROJECT_ID: project.projectId,
                                _INSECURE_SUBSTITUTION_PULUMI_ACCESS_TOKEN: process.env.PULUMI_ACCESS_TOKEN || '',
                                _ORG: org.spec.id,
                                _APP: app.spec.id,
                                _COMPONENT: component.spec.id,
                                _ENV: envName
                            },
                            serviceAccount: ciProject.projectId.apply(projectId => `projects/${projectId}/serviceAccounts/cicd-${app.spec.id}-${envName}@${projectId}.iam.gserviceaccount.com`)
                        },
                    );
                };
            });
        });
    });
}