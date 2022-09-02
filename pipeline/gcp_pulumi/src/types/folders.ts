import { Output } from "@pulumi/pulumi";
import { RoleBinding } from "../../../../types/GCP";


interface OrgFolders {
    [orgId: string]: {
        gcpOrgId: string;
        roleBindings?: RoleBinding[];
        apps: {
            [appId: string]: {
                name: string;
                gcpFolderId?: Output<String>;
                roleBindings?: RoleBinding[];
                environments: {
                    [envId: string]: {
                        gcpFolderId?: Output<String>;
                        roleBindings?: RoleBinding[];
                    }
                }
            }
        }
    }
};

export {OrgFolders}
