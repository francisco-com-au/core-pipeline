const kustomization = function(
    resources: string[]
    ): string {

    return `---
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
${resources.length ? 'resources:' : ''}
${resources.map(resource => `  - ${resource}`).join('\n')}
`
}

export { kustomization }
