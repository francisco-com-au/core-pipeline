import { Orgs } from "../../definitions/index"
import * as Foundations from "./src/modules/foundations"
import * as PlatformOps from "./src/modules/platform-ops"


Orgs.forEach(org => {
    // Make folders
    const orgFolders = Foundations.makeFolders(org);
    
    // Make projects
    Foundations.makeProjects(org, orgFolders)
});
