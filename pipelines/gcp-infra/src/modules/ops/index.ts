/*
I need to split this into modules. This creates the ops side of the platform,
mainly CI/CD components such as automated builds of compoentes, automated deployment
of new images and (coming later) automated deployment of app level infra.
*/

// Import types
import {Apis, RoleBinding} from "../../../../../types/GCP";
import { Org } from "../../../../../types/Org"

// Import packages
import * as gcp from "@pulumi/gcp";
import * as random from "@pulumi/random";
// import moment from 'moment'


// Create folder for ops
export function makeFolders(org: Org): gcp.organizations.Folder {    
    const platformOpsFolder = new gcp.organizations.Folder(`${org.spec}.ops`, {
        displayName: "ops",
        parent: `organizations/${org.spec.gcp.orgId}`
    });
    // Grant roles to org viewers
    const roleBinding: RoleBinding = {
        member: `group:gcp-viewers@${process.env.ORG_DOMAIN}`,
        roles: ["roles/viewer"],
    };
    roleBinding.roles.forEach(role => {
        const folderRole = new gcp.folder.IAMMember(`${org.spec.id}.ops.${roleBinding.member}.${role}`, {
            folder: platformOpsFolder.id,
            member: roleBinding.member,
            role: role,
        });
    });
    return platformOpsFolder
};

// Create project for CI
export function makeCIProject(org: Org, parentFolder: gcp.organizations.Folder): gcp.organizations.Project {
    
    // Create project
    const projectId = `${org.spec.id}-ops-cicd`;
    const randomId = new random.RandomId(projectId, {
        byteLength: 3,
        keepers: {
            org: `${org.spec.id}`,
        },
    });
    const ciProject = new gcp.organizations.Project(projectId, {
        folderId: parentFolder.id,
        name: projectId,
        projectId: randomId.hex.apply(id => `${projectId}-${id}`),
        billingAccount: org.spec.gcp.billingId,
        labels: {
            'organization': org.spec.name.replace(/ /g, '-').toLowerCase(),
            'app': 'ops',
            'created_by': 'pulumi',
            // 'pulumi_last_reconciled': `${(moment(new Date())).format('YYYMMDD-HHmmss')}`
        },
    });

    // Grant roles to devops
    const roleBinding: RoleBinding = {
        member: `group:gcp-devops@${process.env.ORG_DOMAIN}`,
        roles: ["roles/editor"],
    };
    roleBinding.roles.forEach(role => {
        const folderRole = new gcp.folder.IAMMember(`${org.spec.id}.ops.${roleBinding.member}.${role}`, {
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
        const enabledApi = new gcp.projects.Service(`${org.spec.id}.ops.cicd.${api}`, {
            disableDependentServices: true,
            project: ciProject.projectId,
            service: api,
        }, {dependsOn: [ciProject]});
        enabledApis.set(api, enabledApi);
        e = enabledApi;
    });
    const pubsubApi = enabledApis.get('pubsub.googleapis.com');
    const cloudbuildApi = enabledApis.get('cloudbuild.googleapis.com');

    // Create a topic for GCR notificaitons (when new images are built)
    const gcrTopic = new gcp.pubsub.Topic(`${org.spec.id}-gcr-events`, {
            project: ciProject.projectId,
            name: 'gcr',
            messageRetentionDuration: "86600s", // 1 day and a bit
        }, { dependsOn: pubsubApi ? [pubsubApi] : []}
    );
    // Create topic for repo changes
    const repoAllEventsTopic = new gcp.pubsub.Topic(`${org.spec.id}-repo-all-events`, {
            project: ciProject.projectId,
            name: `${org.spec.id}-repo-all-events`,
            messageRetentionDuration: "86600s", // 1 day and a bit
        }, { dependsOn: pubsubApi ? [pubsubApi] : [] }
    );
    // Create a topic for only events related to environments that we care about (build containers)
    const repoEventsTopic = new gcp.pubsub.Topic(`${org.spec.id}-repo-events`, {
            project: ciProject.projectId,
            name: `${org.spec.id}-repo-events`,
            messageRetentionDuration: "86600s",
        }, { dependsOn: pubsubApi ? [pubsubApi] : [] }
    );
    // Create a topic for only events related to environments that we care about (build containers)
    const imageUpdatedTopic = new gcp.pubsub.Topic(`${org.spec.id}-image-events`, {
            project: ciProject.projectId,
            name: `${org.spec.id}-image-events`,
            messageRetentionDuration: "86600s",
        }, { dependsOn: pubsubApi ? [pubsubApi] : [] }
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

    // Make a service account to pull docker images
    const pullServiceAccount = new gcp.serviceaccount.Account(`${org.spec.id}.cicd.pull`, {
        project: ciProject.projectId,
        accountId: `container-registry-pull`,
        displayName: `Container Registry - Pull`,
        description: "Service account to pull images from the Container Registry"
    });
    // Grant the service account with pull access to gcr
    [
        "roles/storage.objectViewer"
    ].forEach(role => {
        new gcp.projects.IAMMember(`${org.spec.id}.cicd.pull.${roleBinding.member}.${role}`, {
            project: ciProject.projectId,
            member: pullServiceAccount.email.apply(sa => `serviceAccount:${sa}`),
            role: role,
        });
    });
    // Grant devs with access to the service account

    // Create a trigger for each repo
    org.spec.apps?.forEach(app => {
        app.spec.components?.forEach(component => {
            const repoOrg = component.spec.source.organization || app.spec.github.organization;
            const repoName = component.spec.source.repo;
    
            // Publish on all changes
            const messageBody = '{org:"$_ORG",app:"$_APP",component:"$_COMPONENT",branch:"$BRANCH_NAME",repo:"$REPO_NAME",sha:"$SHORT_SHA",event:"$_EVENT"}'
            const pushTrigger = new gcp.cloudbuild.Trigger(`${org.spec.id}.cicd.repo-all-events.push.${app.spec.id}.${component.spec.id}`,
                {
                    project: ciProject.projectId,
                    name: `repo-all-events-push-${repoOrg ? `${repoOrg}-` : ''}${repoName}`.substring(0, 63),
                    github: {
                        name: repoName,
                        owner: repoOrg,
                        push: {
                            branch: `.*`, // matches all branches
                        },
                    },
                    includeBuildLogs: "INCLUDE_BUILD_LOGS_WITH_STATUS",
                    build: {
                        steps: [
                            {
                                name: "gcr.io/cloud-builders/gcloud",
                                args: [
                                    'pubsub',
                                    'topics',
                                    'publish',
                                    repoAllEventsTopic.id.apply(t => t),
                                    '--message',
                                    messageBody
                                ]
                            }
                        ]
                    },
                    substitutions: {
                        _ORG: org.spec.id,
                        _APP: app.spec.id,
                        _COMPONENT: component.spec.id,
                        _REPO: `${repoOrg}/${repoName}`,
                        _EVENT: "push"
                    },
                },
                {
                    dependsOn: cloudbuildApi ? [cloudbuildApi] : []
                }
            );

            
            app.spec.environments.forEach(env => {
                const branch = env.branch || env.name;

                // Publish on changes that match the org-app-component-env branch
                ciProject.projectId.apply(p => console.log(`projectId: ${p}`))
                const messageBody = '{org:"$_ORG",app:"$_APP",component:"$_COMPONENT",env:"$_ENV",branch:"$BRANCH_NAME",repo:"$REPO_NAME",sha:"$SHORT_SHA",event:"$_EVENT"}'
                const pushTrigger = new gcp.cloudbuild.Trigger(`${org.spec.id}.cicd.repo-events.push.${app.spec.id}.${component.spec.id}.${env.name}`, {
                        project: ciProject.projectId,
                        name: `repo-events-push-${repoOrg ? `${repoOrg}-` : ''}${repoName}-${branch}-${env.name}`.substring(0, 63),
                        github: {
                            name: repoName,
                            owner: repoOrg,
                            push: {
                                branch: `^${branch}$`,
                            },
                        },
                        includeBuildLogs: "INCLUDE_BUILD_LOGS_WITH_STATUS",
                        build: {
                            steps: [
                                {
                                    name: "gcr.io/cloud-builders/gcloud",
                                    args: [
                                        'pubsub',
                                        'topics',
                                        'publish',
                                        repoEventsTopic.id.apply(t => t),
                                        '--message',
                                        messageBody
                                    ]
                                }
                            ]
                        },
                        substitutions: {
                            _ORG: org.spec.id,
                            _APP: app.spec.id,
                            _COMPONENT: component.spec.id,
                            _ENV: env.name,
                            _BRANCH: branch,
                            _REPO: `${repoOrg}/${repoName}`,
                            _EVENT: "push"
                        },
                    }, {
                        dependsOn: cloudbuildApi ? [cloudbuildApi] : []
                    }
                );

                // If this component has an infrastructure folder, create a trigger
                const buildInfra = false;
                if (buildInfra && component.spec.source.infraPath) {
                    const buildTrigger = new gcp.cloudbuild.Trigger(`${org.spec.id}.cicd.infra.component.${app.spec.id}.${component.spec.id}.${env.name}`, {
                            project: ciProject.projectId,
                            name: `component-infra-${app.spec.id}-${component.spec.id}-${env.name}`.substring(0, 63),
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
                                            pulumi stack select ${env.name} -c
                                            pulumi config set gcp:project $COMPONENT_PROJECT_ID
                                            pulumi up -y
                                            `
                                        ],
                                        envs: [
                                            'COMPONENT_PROJECT_ID=$_COMPONENT_PROJECT_ID',
                                            'PULUMI_ACCESS_TOKEN=$_INSECURE_SUBSTITUTION_PULUMI_ACCESS_TOKEN',
                                        ]
                                    }
                                ]
                            },
                            substitutions: {
                                _COMPONENT_PROJECT_ID: '',
                                _INSECURE_SUBSTITUTION_PULUMI_ACCESS_TOKEN: process.env.PULUMI_ACCESS_TOKEN || '',
                                _ORG: org.spec.id,
                                _APP: app.spec.id,
                                _COMPONENT: component.spec.id,
                                _ENV: env.name,
                            },
                        }, {
                            dependsOn: cloudbuildApi ? [cloudbuildApi] : []
                        }
                    );
                }

                // Build image
                let buildComponent = false
                if (buildComponent) {
                    const buildTrigger = new gcp.cloudbuild.Trigger(`${org.spec.id}.cicd.build.component.${app.spec.id}.${component.spec.id}.${env.name}`, {
                            project: ciProject.projectId,
                            name: `component-build-${app.spec.id}-${component.spec.id}-${env.name}`.substring(0, 63),
                            github: {
                                name: repoName,
                                owner: repoOrg,
                                push: {
                                    branch: `^${branch}$`,
                                },
                            },
                            includeBuildLogs: "INCLUDE_BUILD_LOGS_WITH_STATUS",
                            filename: 'build/cloudbuild.yaml',
                            substitutions: {
                                _ORG: org.spec.id,
                                _APP: app.spec.id,
                                _COMPONENT: component.spec.id,
                                _ENV: env.name,
                                _BRANCH: branch,
                                _REPO: `${repoOrg}/${repoName}`,
                                _EVENT: "push"
                            },
                        }, {
                            dependsOn: cloudbuildApi ? [cloudbuildApi] : []
                        }
                    );
                }

                // Actually I need to build one image per container, not just at the component level
                component.spec.containers?.forEach(container => {
                    // If the container has an image in the spec, don't create a build trigger
                    if (container.spec.image) {
                        return
                    }
                    // If the container doesn't have a dockerfile in the spec, don't create a build trigger
                    if (!container.spec.dockerFile) {
                        return
                    }
                    const imageName = `gcr.io/$PROJECT_ID/${app.spec.id}/${component.spec.id}/${env.name}/${container.spec.id}`;
                    const includedFiles = `${container.spec.dockerContext && container.spec.dockerContext != '.' ? `${container.spec.dockerContext}/` : ''}**`
                    const messageBody = '{event:"New image available"}';
                    const containerBuildTrigger = new gcp.cloudbuild.Trigger(`${org.spec.id}.cicd.build.container.${app.spec.id}.${component.spec.id}.${container.spec.id}.${env.name}`, {
                        project: ciProject.projectId,
                        name: `container-build-${app.spec.id}-${component.spec.id}-${container.spec.id}-${env.name}`.substring(0, 63),
                        github: {
                            name: repoName,
                            owner: repoOrg,
                            push: {
                                branch: `^${branch}$`,
                            },
                        },
                        includedFiles: [includedFiles],
                        includeBuildLogs: "INCLUDE_BUILD_LOGS_WITH_STATUS",
                        build: {
                            steps: [
                                {
                                    id: "Build 🐳",
                                    name: "gcr.io/cloud-builders/docker",
                                    entrypoint: "docker",
                                    args: [
                                        "build",
                                        "-t",
                                        `${imageName}:$SHORT_SHA`,
                                        "-t",
                                        `${imageName}:latest`,
                                        "-f",
                                        container.spec.dockerFile || "Dockerfile",
                                        container.spec.dockerContext || "."
                                    ]
                                },{
                                    id: "Push [sha] 🚀",
                                    name: "gcr.io/cloud-builders/docker",
                                    entrypoint: "docker",
                                    args: [
                                        "push",
                                        `${imageName}:$SHORT_SHA`,
                                    ],
                                    waitFors: ["Build 🐳"],
                                },{
                                    id: "Push [latest] 🚀",
                                    name: "gcr.io/cloud-builders/docker",
                                    entrypoint: "docker",
                                    args: [
                                        "push",
                                        `${imageName}:latest`,
                                    ],
                                    waitFors: ["Build 🐳"],
                                },{
                                    id: "Update tag",
                                    name: `gcr.io/$PROJECT_ID/core-pipeline-runner:latest`,
                                    entrypoint: "sh",
                                    args: [
                                        "-c",
                                        `set -e -x
      
                                        # Login to github
                                        echo "$$GITHUB_ACCESS_TOKEN" | gh auth login --with-token
                                
                                        # Configure git
                                        gh auth setup-git
                                        git config --global user.email "image-updater-$BRANCH_NAME@$$ORG_DOMAIN"
                                        git config --global user.name "image-updater-$BRANCH_NAME"

                                        # Define name of the branch to use
                                        BRANCH=feature/image-updater-$COMMIT_SHA

                                        # Clean up cloned repo
                                        rm -rf platform-apps

                                        # Clone repo
                                        gh repo clone $$APPS_REPO
                                        cd platform-apps
                                        git checkout ${process.env.PLATFORM_BRANCH}
                                        git checkout -b $$BRANCH

                                        # Apply tag
                                        mkdir -p managed/images/${app.spec.id}/${component.spec.id}/${env.name}/
                                        echo -n $SHORT_SHA > managed/images/${app.spec.id}/${component.spec.id}/${env.name}/${container.spec.id}

                                        git add .

                                        function has_changes() {
                                            # Push to branch
                                            git push --set-upstream origin $$BRANCH

                                            # Merge to master
                                            git checkout ${process.env.PLATFORM_BRANCH}
                                            git pull
                                            git merge $$BRANCH
                                            git push
                                        }

                                        git commit -m "Automated commit from the image updater. $SHORT_SHA" && has_changes
`
                                    ],
                                    envs: [
                                        `GITHUB_ACCESS_TOKEN=$_INSECURE_SUBSTITUTION_GITHUB_ACCESS_TOKEN`,
                                        `ORG_DOMAIN=$_ORG_DOMAIN`,
                                        `APPS_REPO=$_APPS_REPO`,
                                    ],
                                    waitFors: ["Push [sha] 🚀"]
                                },{
                                    id: "Publish new tag available",
                                    name: "gcr.io/cloud-builders/gcloud",
                                    args: [
                                        'pubsub',
                                        'topics',
                                        'publish',
                                        imageUpdatedTopic.id.apply(t => t),
                                        '--message',
                                        messageBody,
                                    ],
                                    waitFors: ["Update tag"]
                                }
                            ],
                            // images: [ciProject.projectId.apply(projectId => `gcr://${projectId}/`)],
                        },
                        substitutions: {
                            _ORG: org.spec.id,
                            _APP: app.spec.id,
                            _COMPONENT: component.spec.id,
                            _CONTAINER: container.spec.id,
                            _ENV: env.name,
                            _BRANCH: branch,
                            _IMAGE_TAG: "$SHORT_SHA",
                            _REPO: `${repoOrg}/${repoName}`,
                            _INSECURE_SUBSTITUTION_GITHUB_ACCESS_TOKEN: process.env.GITHUB_ACCESS_TOKEN || '',
                            _ORG_DOMAIN: process.env.ORG_DOMAIN || 'placeholder.com',
                            _ROOT_PROJECT_ID: process.env.PROJECT_ID || '',
                            _APPS_REPO: process.env.APPS_REPO || '',
                        },
                    }, {
                        dependsOn: cloudbuildApi ? [cloudbuildApi] : []
                    });
                    
                });
            });
        });
    });

    return ciProject
}

// Create project for network
export function makeNetworkProject(org: Org, parentFolder: gcp.organizations.Folder): gcp.organizations.Project {
    const projectId = `${org.spec.id}-ops-network`;
    const randomId = new random.RandomId(projectId, {
        byteLength: 3,
        keepers: {
            org: `${org.spec.id}`,
        },
    });    

    const networkProject = new gcp.organizations.Project(projectId, {
        folderId: parentFolder.id,
        name: projectId,
        projectId: randomId.hex.apply(id => `${projectId}-${id}`),
        billingAccount: org.spec.gcp.billingId,
        labels: {
            'organization': org.spec.name.replace(/ /g, '-').toLowerCase(),
            'app': 'ops',
            'created_by': 'pulumi',
            // 'pulumi_last_reconciled': `${(moment(new Date())).format('YYYMMDD-HHmmss')}`
        },
    });
    // Grant roles to network admins
    const roleBinding: RoleBinding = {
        member: `group:gcp-network-admins@${process.env.ORG_DOMAIN}`,
        roles: ["roles/editor"],
    };
    roleBinding.roles.forEach(role => {
        const folderRole = new gcp.folder.IAMMember(`${org.spec.id}.ops.network.${roleBinding.member}.${role}`, {
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
        const enabledApi = new gcp.projects.Service(`${org.spec.id}.ops.network.${api}`, {
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
        // const zone = new gcp.dns.ManagedZone(`${org.spec.id}-${org.spec.domain}`.replace(/\./g, '-'), {
        //     // name: 'Org DNS zone'.replace(/ /g, '-').toLowerCase(),
        //     project: networkProject.projectId,
        //     description: `Org level domain for organization ${org.spec.name}`,
        //     dnsName: `${org.spec.domain}`,
        //     labels: {
        //         'organization': org.spec.name.replace(/ /g, '-').toLowerCase(),
        //         'app': 'ops',
        //         'created_by': 'pulumi',
        //         // 'pulumi_last_reconciled': `${(moment(new Date())).format('YYYMMDD-HHmmss')}` <- this triggers a recreate and it fails
        //     },
        // },
        // {
        //     dependsOn: dnsApi ? [dnsApi] : []
        // });
    };
    org.spec.apps?.forEach(app => {
        if (app.spec.domainName && !domains.includes(app.spec.domainName)) {
            domains.push(app.spec.domainName);
            // const zone = new gcp.dns.ManagedZone(`${org.spec.id}-${app.spec.domainName}`.replace(/\./g, '-'), {
            //     // name: app.spec.name.replace(/ /g, '-').toLowerCase(),
            //     project: networkProject.projectId,
            //     description: `Domain for app ${app.spec.name}`,
            //     dnsName: `${app.spec.domainName}.`,
            //     labels: {
            //         'organization': org.spec.name.replace(/ /g, '-').toLowerCase(),
            //         'app': app.spec.name.replace(/ /g, '-').toLowerCase(),
            //         'created_by': 'pulumi',
            //         // 'pulumi_last_reconciled': `${(moment(new Date())).format('YYYMMDD-HHmmss')}` <- this triggers a recreate and it fails
            //     },
            // },
            // {
            //     dependsOn: dnsApi ? [dnsApi] : []
            // });
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