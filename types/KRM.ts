interface KRM {
    apiVersion: string;
    kind: string;
    metadata: {
        name: string;
        labels?: {
            [key: string]: string
        }[];
        annotations?: {
            [key: string]: string
        }[]
    };
};

export {KRM}