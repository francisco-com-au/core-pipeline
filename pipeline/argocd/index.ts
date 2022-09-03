import * as k8s from "@pulumi/kubernetes";
import { argocdProject } from "./manifests/argocdProject";
var fs = require('fs');
import { Orgs } from "../../definitions"
import { writeToFile } from "./modules/writeToFile";
import { join } from 'path';
import { argocdApplicationSet } from "./manifests/argocdApplicationSet";
import { kustomization } from "./manifests/kustomization";


const APPS_REPO = process.env.APPS_REPO || "";

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
        const baseDir = join(appDir, 'base');
        console.log(`Making app base folder "${baseDir}...`);
        makeFolder([baseDir]);
        
        // Object to store resources to include in the kustomization
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
        }
        const k = kustomization(resources);
        writeToFile(k, join(baseDir, 'kustomization.yaml'));

        // Overlays
        if (app.spec.environments?.length) {
            const overlaysDir = join(appDir, 'overlays');
            console.log(`Making app overlays folder "${overlaysDir}...`);
            makeFolder([overlaysDir]);
            app.spec.environments.forEach(environment => {
                const overlayDir = join(overlaysDir, environment.name);
                console.log(`Making app overlay folder "${overlayDir}...`);
                makeFolder([overlayDir]);
                // Object to store resources to include in the kustomization
                const resources: string[] = [];
                resources.push('../../base');
                const k = kustomization(resources);
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
            const baseDir = join(componentDir, 'base');
            console.log(`Making component base folder "${baseDir}...`);
            makeFolder([baseDir]);

            // Overlays
            if (app.spec.environments?.length) {
                const overlaysDir = join(componentDir, 'overlays');
                console.log(`Making app overlays folder "${overlaysDir}...`);
                makeFolder([overlaysDir]);
                app.spec.environments.forEach(environment => {
                    const overlayDir = join(overlaysDir, environment.name);
                    console.log(`Making component overlay folder "${overlayDir}...`);
                    makeFolder([overlayDir]);
                    // Object to store resources to include in the kustomization
                    const resources: string[] = [];
                    resources.push('../../base');
                    const k = kustomization(resources);
                    writeToFile(k, join(overlayDir, 'kustomization.yaml'));
                });
            };

            // Application
        });
    });
});
