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
        name: projectId,
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

    // Make a service account per app
    org.spec.apps?.forEach(app => {
        app.spec.environments?.forEach(env => {
            const serviceAccount = new gcp.serviceaccount.Account(`${org.spec.id}.cicd.${app.spec.id}.${env.name}`, {
                project: ciProject.id,
                accountId: `cicd-${app.spec.id}-${env.name}`,
                displayName: `CI/CD - ${app.spec.name} / ${env.name}`,
                description: `Service account for automated CI/CD for App "${app.spec.name}" - Environment "${env.name}"`,
            });
        });
    });

    return ciProject
}

// Create project for network
export function makeNetworkProject(org: Org, parentFolder: gcp.organizations.Folder): gcp.organizations.Project {
    const projectId = `${org.spec.id}-platform-ops-network`;
    const project = new gcp.organizations.Project(projectId, {
        folderId: parentFolder.id,
        name: projectId,
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
        const folderRole = new gcp.folder.IAMMember(`${org.spec.id}.platform-ops.${roleBinding.member}.${role}`, {
            folder: parentFolder.id,
            member: roleBinding.member,
            role: role,
        });
    });

    return project
}

export function makePlatformOps(org: Org) {
    const platformOpsFolder = makeFolders(org);
    const networkProject = makeNetworkProject(org, platformOpsFolder);
    const ciProject = makeCIProject(org, platformOpsFolder);
    return {
        ciProject, networkProject
    }
}