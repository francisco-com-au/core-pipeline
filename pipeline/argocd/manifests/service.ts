const service = function(
    name: string,
    portName: string,
    port: number,
    namespace: string,
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
