const argocdProject = function(
    name: string,
    description: string,
    ): string {

    return `---
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: ${name}
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  description: ${description}
  sourceRepos:
    - '*'
  destinations:
    - namespace: ${name}
      server: https://kubernetes.default.svc
    - namespace: '*'
      server: https://kubernetes.default.svc
  clusterResourceWhitelist:
    - group: '*'
      kind: '*'
  namespaceResourceWhitelist:
    - group: '*'
      kind: '*'
`
}

export { argocdProject }