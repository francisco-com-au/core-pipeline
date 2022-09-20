import { Container } from "../../../types/Container"

const deploymentPatch = function(
    name: string,
    namespace: string,
    image: string,
    container: Container,
    ): string {

    return`---
apiVersion: argoproj.io/v1alpha1
kind: Rollout
# apiVersion: apps/v1
# kind: Deployment
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  template:
    spec:
      containers:
        - name: ${container.spec.id}
          image: ${image}
`
}

export { deploymentPatch }
