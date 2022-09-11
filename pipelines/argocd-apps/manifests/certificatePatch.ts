const certificatePatch = function(
    name: string,
    dnsName: string,
    namespace: string,
    ): string {

    return `---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  dnsNames:
    - ${dnsName}
`
}

export { certificatePatch }
