const argocdApplicationSetPatch = function(
    appName: string,
    repo: string,
    branch: string,
    env: string,
    ): string {

    return `---
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
    name: ${appName}-components
    namespace: argocd
spec:
    generators:
        - git:
            repoURL: https://github.com/${repo}.git
            revision: ${branch}
            directories:
                - path: 'managed/${appName}/components/*'
    template:
        spec:
            source:
                targetRevision: ${branch}
                path: '{{path}}/overlays/${env}'
    `
}

export { argocdApplicationSetPatch }

