import { OrgFolders } from "../types/folders";

export function Readme(orgFolders: OrgFolders) {
    let readme = `# Core Pipeline
## Apps
`;

    Object.keys(orgFolders).forEach((orgId, orgIdx) => {
        const org = orgFolders[orgId];
        const lastOrg = Object.keys(orgFolders).length == orgIdx+1;
        readme += `${lastOrg ? "    └" : "    ├"}── ${orgId}: ${org.gcpOrgId}\n`;
        Object.keys(org.apps).forEach((appId, appIdx) => {
            const app = org.apps[appId];
            const lastApp = Object.keys(org.apps).length == appIdx+1;
            readme += app.gcpFolderId?.apply(folderId => `${lastOrg ? "     " : "    |"}${lastApp ? "    └" : "    ├"}── ${app.name}: ${folderId}\n`);
            Object.keys(app.environments).forEach((envId, envIdx) => {
                const env = app.environments[envId];
                const lastEnv = Object.keys(app.environments).length == envIdx+1;
                readme += env.gcpFolderId?.apply(folderId => `${lastOrg ? "     " : "    |"}${lastApp ? "     " : "    |"}${lastEnv ? "    └" : "    ├"}── ${envId}: ${folderId}\n`);
            });
        });
    });
    console.log(readme)
    return readme
}