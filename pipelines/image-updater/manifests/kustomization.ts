const kustomization = function(
    resources: string[],
    patches: string[],
    ): string {

    return `---
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
${resources.length ? 'resources:' : ''}
${resources.map(resource => `  - ${resource}`).join('\n')}
${patches.length ? 'patchesStrategicMerge:' : ''}
${patches.map(patch => `  - ${patch}`).join('\n')}

`
}

export { kustomization }
