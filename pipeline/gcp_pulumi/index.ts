import { Orgs } from "../../definitions/index"
import * as Foundations from "./src/modules/foundations"
import * as PlatformOps from "./src/modules/platform-ops"
import { Readme } from "./src/modules/Readme"
import { OrgFolders } from "./src/types/folders";


let orgFolders: OrgFolders = {};

Orgs.forEach(org => {
    // Make platform-ops
    const {networkProject, ciProject} = PlatformOps.makePlatformOps(org);

    // Make folders
    orgFolders = Foundations.makeFolders(org, ciProject);
    
    // Make projects
    Foundations.makeProjects(org, orgFolders);
});

// export const readme = Readme(orgFolders);