import * as k8s from "@pulumi/kubernetes";
import { argocdProject } from "./manifests/argocdProject";
var fs = require('fs');
import { Orgs } from "../../definitions"
import { writeToFile } from "./modules/writeToFile";
import { join } from 'path';


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
console.log(`Removing managed directory "${managedDir}...`)
fs.rmSync(managedDir, { recursive: true, force: true });
// Recreate managed folder
console.log(`Recreating managed directory "${managedDir}...`)
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

        // ArgoCD Project
        const project = argocdProject(app.spec.id, app.spec.description);
        writeToFile(project, join(baseDir, 'project.yaml'));


        app.spec.components?.forEach(component => {
            // Render component level base
            // Application
        });
        app.spec.environments.forEach(environment => {
            // Render overlays
            const overlayDir = join(appDir, environment.name);
            console.log(`Making app overlay folder "${overlayDir}...`);
            makeFolder([overlayDir]);
        });
    });
});
