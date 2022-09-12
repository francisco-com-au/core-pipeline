const onePasswordSecret = function(
    name: string,
    path: string,
    namespace: string,
    ): string {

    return`---
apiVersion: onepassword.com/v1
    kind: OnePasswordItem
metadata:
    name: ${name}
    namespace: ${namespace}
spec:
    itemPath: "${path}" 
`
}

export { onePasswordSecret }
