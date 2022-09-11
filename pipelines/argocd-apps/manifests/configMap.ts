import { Container } from "../../../types/Container"

const configMap = function(
    name: string,
    namespace: string,
    keyValue: string[][],
    ): string {
    return `---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${name}
  namespace: ${namespace}
data:${keyValue.map(kv => `
  ${kv[0]}: ${kv[1]}`).join('')}
`
}

export { configMap }

