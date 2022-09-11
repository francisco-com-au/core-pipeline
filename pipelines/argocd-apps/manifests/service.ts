const service = function(
    name: string,
    portName: string,
    port: number,
    namespace: string,
    appId: string,
    componentId: string,
    containerId: string,
    ): string {

    return `---
kind: "Service"
apiVersion: "v1"
metadata:
  name: "${name}"
  namespace: ${namespace}
spec:
  selector:
    app: ${appId}
    component: ${componentId}
    container: ${containerId}
  ports:
    - name: "${portName}"
      protocol: "TCP"
      port: ${port}
`
}

export { service }
