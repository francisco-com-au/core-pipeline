import { Orgs } from "../../definitions/index"
import * as Foundations from "./src/modules/foundations"
import * as PlatformOps from "./src/modules/platform-ops"


Orgs.forEach(org => {
    // Make platform-ops
    const {networkProject, ciProject} = PlatformOps.makePlatformOps(org);

    // Make folders
    const orgFolders = Foundations.makeFolders(org, ciProject);
    
    // Make projects
    Foundations.makeProjects(org, orgFolders);
});
