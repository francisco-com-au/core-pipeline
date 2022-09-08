// Import types
import {Apis, RoleBinding} from "../../../../../types/GCP";
import { Org } from "../../../../../types/Org"

// Import packages
import * as gcp from "@pulumi/gcp";
import moment from 'moment'


// Create folder for ops
export function makeFolders(org: Org): gcp.organizations.Folder {    
    const platformOpsFolder = new gcp.organizations.Folder(`${org.spec}.$platform-ops`, {
        displayName: "Platform Ops",
        parent: `organizations/${org.spec.gcp.orgId}`
    });
    // Grant roles to org viewers
    const roleBinding: RoleBinding = {
        member: `group:gcp-viewers@${process.env.ORG_DOMAIN}`,
        roles: ["roles/viewer"],
    };
    roleBinding.roles.forEach(role => {
        const folderRole = new gcp.folder.IAMMember(`${org.spec.id}.platform-ops.${roleBinding.member}.${role}`, {
            folder: platformOpsFolder.id,
            member: roleBinding.member,
            role: role,
        });
    });
    return platformOpsFolder
};

// Create project for CI
export function makeCIProject(org: Org, parentFolder: gcp.organizations.Folder): gcp.organizations.Project {
    const projectId = `${org.spec.id}-platform-ops-cicd`;
    const ciProject = new gcp.organizations.Project(projectId, {
        folderId: parentFolder.id,
        // name: projectId,
        projectId: projectId,
        billingAccount: org.spec.gcp.billingId,
        labels: {
            'organization': org.spec.name.replace(/ /g, '-').toLowerCase(),
            'app': 'platform-ops',
            'created_by': 'pulumi',
            'pulumi_last_reconciled': `${(moment(new Date())).format('YYYMMDD-HHmmss')}`
        },
    });
    // Grant roles to devops
    const roleBinding: RoleBinding = {
        member: `group:gcp-devops@${process.env.ORG_DOMAIN}`,
        roles: ["roles/editor"],
    };
    roleBinding.roles.forEach(role => {
        const folderRole = new gcp.folder.IAMMember(`${org.spec.id}.platform-ops.${roleBinding.member}.${role}`, {
            folder: parentFolder.id,
            member: roleBinding.member,
            role: role,
        });
    });

    // Enable Pubsub and Cloudbuild APIs
    const apis = ['pubsub.googleapis.com', 'cloudbuild.googleapis.com'];
    const enabledApis = new Map<string, gcp.projects.Service>();
    let e: gcp.projects.Service;
    apis.forEach(api => {
        const enabledApi = new gcp.projects.Service(`${org.spec.id}.platform-ops.cicd.${api}`, {
            disableDependentServices: true,
            project: ciProject.projectId,
            service: api,
        });
        enabledApis.set(api, enabledApi);
        e = enabledApi;
    });
    const pubsubApi = enabledApis.get('pubsub.googleapis.com');
    const cloudbuildApi = enabledApis.get('cloudbuild.googleapis.com');

    // Create topic for repo changes
    const repoEventsTopic = new gcp.pubsub.Topic(`${org.spec.id}-repo-events`,
        {
            project: ciProject.projectId,
            name: `${org.spec.id}-repo-events`,
            messageRetentionDuration: "86600s",
        },
        {
            dependsOn: pubsubApi ? [pubsubApi] : []
        }
    );

    // Make a service account per app
    org.spec.apps?.forEach(app => {
        app.spec.environments?.forEach(env => {
            const serviceAccount = new gcp.serviceaccount.Account(`${org.spec.id}.cicd.${app.spec.id}.${env.name}`, {
                project: ciProject.projectId,
                accountId: `cicd-${app.spec.id}-${env.name}`,
                displayName: `CI/CD - ${app.spec.name} / ${env.name}`,
                description: `Service account for automated CI/CD for App "${app.spec.name}" - Environment "${env.name}"`,
            });
        });
    });

    // Create a trigger for each repo
    org.spec.apps?.forEach(app => {
        app.spec.components?.forEach(component => {
            app.spec.environments.forEach(env => {
                const repoOrg = component.spec.source.organization || app.spec.github.organization;
                const repoName = component.spec.source.repo;
                const branch = env.branch || env.name;

                // Push trigger
                const pushTrigger = new gcp.cloudbuild.Trigger(`${org.spec.id}.cicd.${app.spec.id}.${component.spec.id}.${env.name}.pr`,
                    {
                        project: ciProject.projectId,
                        name: `repo-events-${repoOrg ? `${repoOrg}/` : ''}-${repoName}-${branch}-${env}-push`,
                        github: {
                            name: repoName,
                            owner: repoOrg,
                            push: {
                                branch: `"^${branch}$"`,
                            },
                            // pull_request: {
                            //     branch: ".*"
                            // },
                        },
                        includeBuildLogs: "INCLUDE_BUILD_LOGS_WITH_STATUS",
                        filename: "cloudbuild.yaml",
                        substitutions: {
                            _APP: app.spec.id,
                            _COMPONENT: component.spec.id,
                            _ENV: env,
                            _BRANCH: branch,
                            _REPO: `${repoOrg}/${repoName}`,
                            _EVENT: "push"
                        },
                    },
                    {
                        dependsOn: cloudbuildApi ? [cloudbuildApi] : []
                    }
                );
            });
        });
    });
    // const filename_trigger = new gcp.cloudbuild.Trigger("filename-trigger", {
    //     filename: "cloudbuild.yaml",
    //     substitutions: {
    //         _BAZ: "qux",
    //         _FOO: "bar",
    //     },
    //     triggerTemplate: {
    //         branchName: "main",
    //         repoName: "my-repo",
    //     },
    // });
    return ciProject
}

// Create project for network
export function makeNetworkProject(org: Org, parentFolder: gcp.organizations.Folder): gcp.organizations.Project {
    const projectId = `${org.spec.id}-platform-ops-network`;
    const networkProject = new gcp.organizations.Project(projectId, {
        folderId: parentFolder.id,
        // name: projectId,
        projectId: projectId,
        billingAccount: org.spec.gcp.billingId,
        labels: {
            'organization': org.spec.name.replace(/ /g, '-').toLowerCase(),
            'app': 'platform-ops',
            'created_by': 'pulumi',
            'pulumi_last_reconciled': `${(moment(new Date())).format('YYYMMDD-HHmmss')}`
        },
    });
    // Grant roles to network admins
    const roleBinding: RoleBinding = {
        member: `group:gcp-network-admins@${process.env.ORG_DOMAIN}`,
        roles: ["roles/editor"],
    };
    roleBinding.roles.forEach(role => {
        const folderRole = new gcp.folder.IAMMember(`${org.spec.id}.platform-ops.network.${roleBinding.member}.${role}`, {
            folder: parentFolder.id,
            member: roleBinding.member,
            role: role,
        });
    });

    // Enable DNS API
    const apis = ['dns.googleapis.com'];
    const enabledApis = new Map<string, gcp.projects.Service>();
    let e: gcp.projects.Service;
    apis.forEach(api => {
        const enabledApi = new gcp.projects.Service(`${org.spec.id}.platform-ops.network.${api}`, {
            disableDependentServices: true,
            project: networkProject.projectId,
            service: api,
        });
        enabledApis.set(api, enabledApi);
        e = enabledApi;
    });
    const dnsApi = enabledApis.get('dns.googleapis.com');

    // Create DNS entries. Crawl the org to see what domains we need.
    const domains: string[] = [];
    if (org.spec.domain) {
        domains.push(org.spec.domain);
        const zone = new gcp.dns.ManagedZone(`${org.spec.id}-${org.spec.domain}`.replace(/\./g, '-'), {
            // name: 'Org DNS zone'.replace(/ /g, '-').toLowerCase(),
            project: networkProject.projectId,
            description: `Org level domain for organization ${org.spec.name}`,
            dnsName: `${org.spec.domain}.`,
            labels: {
                'organization': org.spec.name.replace(/ /g, '-').toLowerCase(),
                'app': 'platform-ops',
                'created_by': 'pulumi',
                // 'pulumi_last_reconciled': `${(moment(new Date())).format('YYYMMDD-HHmmss')}` <- this triggers a recreate and it fails
            },
        },
        {
            dependsOn: dnsApi ? [dnsApi] : []
        });
    };
    org.spec.apps?.forEach(app => {
        if (app.spec.domainName && !domains.includes(app.spec.domainName)) {
            domains.push(app.spec.domainName);
            const zone = new gcp.dns.ManagedZone(`${org.spec.id}-${app.spec.domainName}`.replace(/\./g, '-'), {
                // name: app.spec.name.replace(/ /g, '-').toLowerCase(),
                project: networkProject.projectId,
                description: `Domain for app ${app.spec.name}`,
                dnsName: `${app.spec.domainName}.`,
                labels: {
                    'organization': org.spec.name.replace(/ /g, '-').toLowerCase(),
                    'app': app.spec.name.replace(/ /g, '-').toLowerCase(),
                    'created_by': 'pulumi',
                    // 'pulumi_last_reconciled': `${(moment(new Date())).format('YYYMMDD-HHmmss')}` <- this triggers a recreate and it fails
                },
            },
            {
                dependsOn: dnsApi ? [dnsApi] : []
            });
        };
    });

    return networkProject
};

export function makePlatformOps(org: Org) {
    const platformOpsFolder = makeFolders(org);
    const networkProject = makeNetworkProject(org, platformOpsFolder);
    const ciProject = makeCIProject(org, platformOpsFolder);
    return {
        ciProject, networkProject
    };
};