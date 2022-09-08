import { Orgs } from "../../definitions/index"
import * as Foundations from "./src/modules/foundations"
import * as Ops from "./src/modules/ops"
// import { Readme } from "./src/modules/Readme"
import { OrgFolders } from "./src/types/folders";


let orgFolders: OrgFolders = {};

Orgs.forEach(org => {
    // Make ops
    const {networkProject, ciProject} = Ops.makePlatformOps(org);

    // Make folders
    orgFolders = Foundations.makeFolders(org, ciProject);
    
    // Make projects
    Foundations.makeProjects(org, orgFolders);
});

// export const readme = Readme(orgFolders);