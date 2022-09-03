const kustomization = function(
    resources: string[]
    ): string {

    return `---
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
${resources.map(resource => `\t- ${resource}`).join('\n')}
`
}

export { kustomization }
