
const imageKustomization = function(
    name: string,
    tag: string,
    ): string {
    return `---
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
images:
  - name: ${name}
    newTag: ${tag}
`
}

export { imageKustomization }
