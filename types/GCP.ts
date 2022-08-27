import { EnvironmentTypes } from "./Environments"

interface RoleBinding {
    member: string;
    roles: string[];
    environment?: EnvironmentTypes;
}

type Apis = string[];

export { RoleBinding, Apis }