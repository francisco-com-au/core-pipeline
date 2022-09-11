const argocdApplicationSet = function(
    appName: string,
    repo: string,
    ): string {

    return `---
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: ${appName}-components
  namespace: argocd
  # finalizers:
  #   - resources-finalizer.argocd.argoproj.io
spec:
  generators:
    - git:
        repoURL: https://github.com/${repo}.git
        revision: main
        directories:
          - path: 'managed/${appName}/components/*'
  template:
    metadata:
      name: '${appName}-{{path.basename}}'
    spec:
      project: ${appName}
      source:
        repoURL: https://github.com/${repo}.git
        targetRevision: main
        path: '{{path}}/overlays/prod'
      destination:
        server: https://kubernetes.default.svc
        namespace: ${appName}
      syncPolicy:
        automated:
          selfHeal: true
          prune: true
        syncOptions:
          - CreateNamespace=true
`
}

export { argocdApplicationSet }