import { Output } from "@pulumi/pulumi";

interface Role {
    member: string;
    roles: string[];
};

interface OrgFolders {
    [orgId: string]: {
        gcpOrgId: string;
        apps: {
            [appId: string]: {
                name: string;
                gcpFolderId?: Output<String>;
                roles?: Role[];
                environments: {
                    [envId: string]: {
                        gcpFolderId?: Output<String>;
                        roles?: Role[];
                    }
                }
            }
        }
    }
};

export {OrgFolders}
