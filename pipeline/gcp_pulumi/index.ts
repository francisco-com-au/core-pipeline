import * as pulumi from "@pulumi/pulumi";
import { Orgs } from "../../definitions/index"
import { makeFolders, makeProjects } from "./src/modules/foundations"

Orgs.forEach(org => {
    // Make folders
    const orgFolders = makeFolders(org);
    
    // Make projects
    makeProjects(org, orgFolders)
});
