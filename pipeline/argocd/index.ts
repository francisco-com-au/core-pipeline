import * as k8s from "@pulumi/kubernetes";
import { argocdProject } from "./manifests/argocdProject";
var fs = require('fs');
import { Orgs } from "../../definitions"
import { writeToFile } from "./modules/writeToFile";
import { join } from 'path';

const repoBase = join("platform-apps", "managed");
console.log(repoBase)

repoBase.split('/').forEach((part, idx) => {
    let fullPath = ""
    for (let i=0; i<=idx; i++) {
        fullPath += `${repoBase.split('/')[i]}${i==idx ? '' : '/' }`;
    }
    makeFolder(fullPath);
})

// k8s.apps.v1.Deployment
function makeFolder(path1: string, path2?: string) {
    const path = `${path1}${path2 ? `/${path2}` : ''}`;
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
    }
}

// Loop orgs
Orgs.forEach(org => {
    org.spec.apps?.forEach(app => {
        // Render app level base
        // Make app folder
        const baseFolder = `${repoBase}/${app.spec.name}/base`
        makeFolder(repoBase, app.spec.name);
        makeFolder(repoBase, baseFolder);

        // ArgoCD Project
        const project = argocdProject(app.spec.name, app.spec.description);
        writeToFile(project, `${baseFolder}/project.yaml`)





        app.spec.components?.forEach(component => {
            // Render component level base
            // Application

        })
        app.spec.environments.forEach(environment => {
            // Render overlays
            
        })
    })
})
