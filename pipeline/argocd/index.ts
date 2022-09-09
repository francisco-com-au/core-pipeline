import * as k8s from "@pulumi/kubernetes";
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
console.log(managedDir)

// Remove managed folder
console.log(`Removing managed directory "${managedDir}"...`)
fs.rmSync(managedDir, { recursive: true, force: true });
// Recreate managed folder
console.log(`Recreating managed directory "${managedDir}"...`)
makeFolder(managedDir.split('/'))

// k8s.apps.v1.Deployment

// Loop orgs
Orgs.forEach(org => {
    org.spec.apps?.forEach(app => {
        console.log(`Processing app ${app.spec.name}...`);
        // Render app level base
        const appDir = join(managedDir, app.spec.id);
        console.log(`Making app folder "${appDir}...`);
        makeFolder([appDir]);

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
        // // Certs
        // if (app.spec.domainName) {
        //     const cert = certificate(app.spec.id, app.spec.domainName, app.spec.name);
        //     writeToFile(cert, join(baseDir, 'certificate.yaml'));
        //     resources.push('certificate.yaml');
        // }
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
                const componentsPatch = argocdApplicationSetPatch(app.spec.id, APPS_REPO, 'main', environment.name);
                writeToFile(componentsPatch, join(patchesDir, 'components.yaml'));
                patches.push('patches/components.yaml');
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
            
            const componentDomainName = `${component.spec.domainPrefix ? `${component.spec.domainPrefix}.` : '' }${app.spec.domainName}`;

            // Base
            // ----------------------------------------
            const baseDir = join(componentDir, 'base');
            console.log(`Making component base folder "${baseDir}...`);
            makeFolder([baseDir]);
            const resources: string[] = [];

            // // Certs
            // if (app.spec.domainName) {
            //     component.spec.domainPrefix
            //     const cert = certificate(
            //         `${component.spec.id}-${app.spec.id}`, // name
            //         `${component.spec.domainPrefix ? `${component.spec.domainPrefix}.` : '' }${app.spec.domainName}`, // dns name
            //         app.spec.name // namespace
            //     );
            //     writeToFile(cert, join(baseDir, 'certificate.yaml'));
            //     resources.push('certificate.yaml');
            // }

            // Containers
            component.spec.containers?.forEach(container => {
                
                // Deployments
                const containerName = `${component.spec.id}-${container.spec.id}`;
                const image = container.spec.image || `gcr.io/${CONTAINER_REGISTRY_PROJECT}/${app.spec.id}/${component.spec.id}/main/${container.spec.id}:latest`
                const deploy = deployment(
                    containerName, // name
                    app.spec.id, // namespace
                    app.spec.id, // app id
                    component.spec.id, // component id
                    image, // image
                    container // container
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
                    // Service
                    writeToFile(svc, join(baseDir, `svc-${containerPortName}.yaml`));
                    resources.push(`svc-${containerPortName}.yaml`);

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
                        const containerName = `${component.spec.id}-${container.spec.id}`;
                        const image = container.spec.image || `gcr.io/${CONTAINER_REGISTRY_PROJECT}/${app.spec.id}/${component.spec.id}/${environment.name}/${container.spec.id}:latest`
                        const deployPatch = deploymentPatch(
                            containerName, // name
                            app.spec.id, // namespace
                            image, // image
                            container // container
                        );
                        writeToFile(deployPatch, join(patchesDir, `deploy-${containerName}.yaml`));
                        patches.push(`patches/deploy-${containerName}.yaml`);
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
