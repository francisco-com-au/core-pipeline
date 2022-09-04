const service = function(
    name: string,
    portName: string,
    namespace: string,
    port: string,
    ): string {

    return `---
kind: "Service"
apiVersion: "v1"
metadata:
  name: "${name}"
  namespace: ${namespace}
spec:
  ports:
    - name: "${portName}"
      protocol: "TCP"
      port: ${port}
`
}

export { service }
