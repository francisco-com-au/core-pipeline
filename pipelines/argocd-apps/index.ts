/*
This is pretty awful and needs to be split into modules.
Takes app definitions and creates kube resources to deploy such applications.
It uses ArgoCD applications and kustomize to apply environment specific config.
*/

import { argocdProject } from "./manifests/argocdProject";
var fs = require('fs');
import { Orgs } from "../../definitions"
import { writeToFile } from "./modules/writeToFile";
import { join } from 'path';
import { argocdApplicationSet } from "./manifests/argocdApplicationSet";
import { kustomization } from "./manifests/kustomization";
import { argocdApplicationSetPatch } from "./manifests/argocdApplicationSetPatch";
import { certificate } from "./manifests/certificate";
import { certificatePatch } from "./manifests/certificatePatch";
import { service } from "./manifests/service";
import { ingress } from "./manifests/ingress";
import { deployment } from "./manifests/deployment";
import { ingressPatch } from "./manifests/ingressPatch";
import { deploymentPatch } from "./manifests/deploymentPatch";
import { configMap } from "./manifests/configMap";
import { onePasswordSecret } from "./manifests/onePasswordSecret";


const APPS_REPO = process.env.APPS_REPO || "";
const CONTAINER_REGISTRY_PROJECT = process.env.CONTAINER_REGISTRY_PROJECT || "";

// Helper to create a folder
function makeFolder(parts: string[]) {
    const path = join(...parts);
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
    };
};

const managedDir = join("platform-apps", "managed");
const appsDir = join(managedDir, "apps");
const imagesDir = join(managedDir, "images");

// Remove apps folder
console.log(`Removing apps directory "${appsDir}"...`)
fs.rmSync(appsDir, { recursive: true, force: true });
// Recreate managed folder
console.log(`Recreating apps directory "${appsDir}"...`)
makeFolder(appsDir.split('/'))

// Make folder for images (if not exists)
makeFolder(imagesDir.split('/'))

// k8s.apps.v1.Deployment
process.exit

// Loop orgs
Orgs.forEach(org => {
    org.spec.apps?.forEach(app => {
        console.log(`Processing app ${app.spec.name}...`);
        
        // Render app level base
        const appDir = join(appsDir, app.spec.id);
        console.log(`Making app folder "${appDir}...`);
        makeFolder([appDir]);
        const imageAppDir = join(imagesDir, app.spec.id);
        makeFolder([imageAppDir]);

        // Base
        // ----------------------------------------
        const baseDir = join(appDir, 'base');
        console.log(`Making app base folder "${baseDir}...`);
        makeFolder([baseDir]);
        const resources: string[] = [];
        
        // ArgoCD Project
        const project = argocdProject(app.spec.id, app.spec.description);
        writeToFile(project, join(baseDir, 'project.yaml'));
        resources.push('project.yaml');
        
        // ArgoCD ApplicationSet for components
        if (app.spec.components?.length) {
            const applicationSet = argocdApplicationSet(app.spec.id, APPS_REPO);
            writeToFile(applicationSet, join(baseDir, 'components.yaml'));
            resources.push('components.yaml');
        };

        // App level configmap
        const appConfigMap = configMap(
            'app-level-config',
            app.spec.id,
            [
                ['APP_ID', app.spec.id],
                ['APP_NAME', app.spec.name],
                ['APP_DOMAIN', app.spec.domainName || ''],
            ]
        )
        writeToFile(appConfigMap, join(baseDir, 'app-level-config.yaml'))
        resources.push('app-level-config.yaml');
        
        const k = kustomization(resources, []);
        writeToFile(k, join(baseDir, 'kustomization.yaml'));

        // Overlays for the APP - need to override the components overlay
        // ----------------------------------------
        if (app.spec.environments?.length) {
            const overlaysDir = join(appDir, 'overlays');
            console.log(`Making app overlays folder "${overlaysDir}...`);
            makeFolder([overlaysDir]);
            app.spec.environments.forEach(environment => {
                const overlayDir = join(overlaysDir, environment.name);
                console.log(`Making app overlay folder "${overlayDir}...`);
                makeFolder([overlayDir]);
                const patchesDir = join(overlayDir, 'patches');
                console.log(`Making app patches folder "${patchesDir}...`);
                makeFolder([patchesDir]);
                // Object to store resources to include in the kustomization
                const resources: string[] = ['../../base'];
                const patches: string[] = [];

                // Render applicationSet patch
                const componentsPatch = argocdApplicationSetPatch(app.spec.id, APPS_REPO, process.env.PLATFORM_BRANCH || 'main', environment.name);
                writeToFile(componentsPatch, join(patchesDir, 'components.yaml'));
                patches.push('patches/components.yaml');
                
                // Env level configmap
                const envConfigMap = configMap(
                    'env-level-config',
                    app.spec.id,
                    [
                        ['ENV', environment.name],
                        ['ENV_TYPE', environment.type],
                        ['BRANCH', environment.branch || ''],
                    ]
                );
                writeToFile(envConfigMap, join(overlayDir, 'env-level-config.yaml'))
                resources.push('env-level-config.yaml')

                // Write kustomization
                const k = kustomization(resources, patches);
                writeToFile(k, join(overlayDir, 'kustomization.yaml'));
            });
        };
        

        // Make components
        const componentsDir = join(appDir, 'components')
        console.log(`Making components folder "${componentsDir}...`);
        makeFolder([componentsDir]);
        app.spec.components?.forEach(component => {
            const componentDir = join(componentsDir, component.spec.id);
            console.log(`Making component folder "${componentDir}...`);
            makeFolder([componentDir]);
            const imageComponentDir = join(imageAppDir, component.spec.id);
            makeFolder([imageComponentDir]);

            const componentDomainName = `${component.spec.domainPrefix ? `${component.spec.domainPrefix}.` : '' }${app.spec.domainName}`;

            // Base
            // ----------------------------------------
            const baseDir = join(componentDir, 'base');
            console.log(`Making component base folder "${baseDir}...`);
            makeFolder([baseDir]);
            const resources: string[] = [];

            // Component level configmap
            const componentConfigMap = configMap(
                `component-level-config-${component.spec.id}`,
                app.spec.id,
                [
                    ['COMPONENT_ID', component.spec.id],
                    ['COMPONENT_NAME', component.spec.name],
                    ['COMPONENT_DOMAIN_NAME', componentDomainName],
                ]
            );
            writeToFile(componentConfigMap, join(baseDir, `component-level-config-${component.spec.id}.yaml`))
            resources.push(`component-level-config-${component.spec.id}.yaml`)

            // Containers
            component.spec.containers?.forEach(container => {

                // Container level configmap
                const containerConfigMap = configMap(
                    `container-level-config-${component.spec.id}-${container.spec.id}`,
                    app.spec.id,
                    [
                        ['CONTAINER_ID', container.spec.id],
                        ['CONTAINER_NAME', container.spec.name],
                    ]
                );
                writeToFile(containerConfigMap, join(baseDir, `container-level-config-${component.spec.id}-${container.spec.id}.yaml`))
                resources.push(`container-level-config-${component.spec.id}-${container.spec.id}.yaml`)
                
                // Deployments
                const containerName = `${component.spec.id}-${container.spec.id}`;
                const image = container.spec.image || `gcr.io/${CONTAINER_REGISTRY_PROJECT}/${app.spec.id}/${component.spec.id}/main/${container.spec.id}:latest`
                const pullSecrets = ['image-pull-secret'];
                // if (!container.spec.image) {
                //     pullSecrets.push('image-pull-secret');
                // }
                const deploy = deployment(
                    containerName, // name
                    app.spec.id, // namespace
                    app.spec.id, // app id
                    component.spec.id, // component id
                    image, // image
                    container, // container
                    pullSecrets // pull secret
                );
                writeToFile(deploy, join(baseDir, `deploy-${containerName}.yaml`));
                resources.push(`deploy-${containerName}.yaml`);
                
                // Service
                container.spec.expose?.forEach(containerPort => {
                    const containerPortName = `${containerName}-${containerPort.name}`
                    const svc = service(
                        containerPortName, // name
                        `${containerPort.name}`, // port name
                        containerPort.port, // port
                        app.spec.id, // namespace
                        app.spec.id, // app id
                        component.spec.id, // component id
                        container.spec.id // container id
                    )
                    writeToFile(svc, join(baseDir, `svc-${containerPortName}.yaml`));
                    resources.push(`svc-${containerPortName}.yaml`);
                });

                // Secrets
                container.spec.secrets?.forEach(containerSecret => {
                    const secret = onePasswordSecret(
                        containerSecret.name, // name
                        containerSecret.onePasswordPath, // path
                        app.spec.id, // namespace
                    )
                    writeToFile(secret, join(baseDir, `secret-${containerSecret.name}.yaml`));
                    resources.push(`secret-${containerSecret.name}.yaml`);
                });
            });

            // Is any of this component's container's ports exposed externally?
            let patchIngress: boolean = false;
            if (component.spec.containers?.map(c => c.spec.expose?.filter(p => p.ingressPath)).length != 0) {
                patchIngress = true;
                // Cert
                const cert = certificate(
                    component.spec.id, // name
                    componentDomainName, //domain name
                    app.spec.id // namespace
                )
                writeToFile(cert, join(baseDir, `cert-${component.spec.id}.yaml`));
                resources.push(`cert-${component.spec.id}.yaml`);
                // Ingress
                const ing = ingress(
                    component.spec.id, // name
                    app.spec.id, // namespace
                    componentDomainName, // domain name
                    component.spec.containers || [],
                );
                writeToFile(ing, join(baseDir, `ingress-${component.spec.id}.yaml`));
                resources.push(`ingress-${component.spec.id}.yaml`);
            };
            
            const k = kustomization(resources, []);
            writeToFile(k, join(baseDir, 'kustomization.yaml'));
    
            // Overlays
            // ----------------------------------------
            if (app.spec.environments?.length) {
                const overlaysDir = join(componentDir, 'overlays');
                console.log(`Making app overlays folder "${overlaysDir}...`);
                makeFolder([overlaysDir]);
                app.spec.environments.forEach(environment => {
                    const overlayDir = join(overlaysDir, environment.name);
                    console.log(`Making component overlay folder "${overlayDir}...`);
                    makeFolder([overlayDir]);
                    const imageEnvDir = join(imageComponentDir, environment.name);
                    makeFolder([imageEnvDir]);

                    const patchesDir = join(overlayDir, 'patches');
                    console.log(`Making component patches folder "${patchesDir}...`);
                    makeFolder([patchesDir]);
                    // Object to store resources to include in the kustomization
                    const resources: string[] = ['../../base'];
                    const patches: string[] = [];
                    
                    // Patch ingress
                    if (patchIngress) {
                        const dnsPrefix = environment.name == 'main' ? '' : `${environment.name}.`;
                        const componentDomainName = `${component.spec.domainPrefix ? `${component.spec.domainPrefix}.` : '' }${dnsPrefix}${app.spec.domainName}`;
                        // Cert Patch
                        patchIngress = true;
                        // Cert
                        const certPatch = certificatePatch(
                            component.spec.id, // name
                            componentDomainName, //domain name
                            app.spec.id // namespace
                        )
                        writeToFile(certPatch, join(patchesDir, `cert-${component.spec.id}.yaml`));
                        patches.push(`patches/cert-${component.spec.id}.yaml`);        
                        // Ingress Patch
                        const ingPatch = ingressPatch(
                            component.spec.id,  // name
                            app.spec.id,        // namespace
                            componentDomainName, // domainName
                            component.spec.containers || [] // containers
                        );
                        writeToFile(ingPatch, join(patchesDir, `ingress-${component.spec.id}.yaml`));
                        patches.push(`patches/ingress-${component.spec.id}.yaml`);
                    }

                    // Containers
                    component.spec.containers?.forEach(container => {
                        
                        // Deployments
                        const imageQualifier = `${app.spec.id}/${component.spec.id}/${environment.name}/${container.spec.id}`
                        let tag = 'latest';
                        const imageFile = join(imagesDir, imageQualifier)
                        console.log(`imageFile: ${imageFile}`)
                        if (fs.existsSync(imageFile)) {
                            tag = fs.readFileSync(imageFile, {encoding:'utf8', flag:'r'});
                            console.log(`tag: ${tag}`)
                        }
                        const containerName = `${component.spec.id}-${container.spec.id}`;
                        const composedImageName = `gcr.io/${CONTAINER_REGISTRY_PROJECT}/${imageQualifier}:${tag}`;
                        const image = container.spec.image || composedImageName
                        const deployPatch = deploymentPatch(
                            containerName, // name
                            app.spec.id, // namespace
                            image, // image
                            container // container
                        );
                        writeToFile(deployPatch, join(patchesDir, `deploy-${containerName}.yaml`));
                        patches.push(`patches/deploy-${containerName}.yaml`);

                        // const imageContainerDir = join(imageEnvDir, container.spec.id);
                        // makeFolder([imageContainerDir]);
                        // if (!fs.existsSync(join(imageContainerDir, 'kustomization.yaml'))) {
                        //     // There is no kustomization here, probably the first time running this pipeline for this container/env.
                        //     // Means that no image has been built yet. Tag with latest.
                        //     const iK = imageKustomization(composedImageName, 'latest');
                        //     writeToFile(iK, join(imageContainerDir, 'kustomization.yaml'));
                        // };
                        // resources.push(`../../../../../../images/${imageQualifier}`);
                    });
                    

                    // const ing = ingress(
                    //     component.spec.id, // name
                    //     app.spec.id, // namespace
                    //     componentDomainName, // domain name
                    //     component.spec.containers || [],
                    // );
                    const k = kustomization(resources, patches);
                    writeToFile(k, join(overlayDir, 'kustomization.yaml'));
                });
            };

            // Application
        });
    });
});
