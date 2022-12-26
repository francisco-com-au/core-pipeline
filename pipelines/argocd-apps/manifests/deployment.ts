import { Container } from "../../../types/Container"

const deployment = function(
    name: string,
    namespace: string,
    appId: string,
    componentId: string,
    image: string,
    container: Container,
    pullSecrets: string[],
    ): string {

    const plainEnv = container.spec.env?.filter(e => !e.secret && !e.configMap) || [];
    const secretEnv = container.spec.env?.filter(e => e.secret) || [];
    const configMapEnv = container.spec.env?.filter(e => !e.secret && e.configMap) || [];
    // const volumens = container.spec.secrets?.map(s => {return {
    //   a: s.
    // }}) || [];

    return`---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  namespace: ${namespace}
  annotations:
    reloader.stakater.com/auto: "true"
spec:
  selector:
    matchLabels:
      app: ${appId}
      component: ${componentId}
      container: ${container.spec.id}
  replicas: 1
  template:
    metadata:
      labels:
        app: ${appId}
        component: ${componentId}
        container: ${container.spec.id}
    spec:
      containers:
        - name: ${container.spec.id}
          image: ${image}
          imagePullPolicy: Always
          ${container.spec.expose ? `ports: ${container.spec.expose?.map(containerPort => `
            - containerPort: ${containerPort.port}`).join('')}` : ''}
          ${container.spec.env ? `env: ${plainEnv.map(e => `
            - name: ${e.name}
              value: "${e.value}"`).join('')}${secretEnv.map(e => `
            - name: ${e.name}
              valueFrom:
                secretKeyRef:
                  name: ${e.secret}
                  key: ${e.value}`).join('')}${configMapEnv.map(e => `
            - name: ${e.name}
              valueFrom:
                configMapKeyRef:
                  name: ${e.configMap}
                  key: ${e.value}`).join('')}` : ''}
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "250m"
              memory: "256Mi"${container.spec.readiness? `
          readinessProbe:
            httpGet:
              path: ${container.spec.readiness.path}
              port: ${container.spec.readiness.port}
              scheme: ${container.spec.readiness.scheme}
            initialDelaySeconds: 5
            periodSeconds: 10
            failureThreshold: 30
            successThreshold: 1` : ''}
          envFrom:
            - configMapRef:
                name: app-level-config
            - configMapRef:
                name: env-level-config
            - configMapRef:
                name: component-level-config-${componentId}
            - configMapRef:
                name: container-level-config-${componentId}-${container.spec.id}
          ${container.spec.secrets? `volumeMounts:${container.spec.secrets?.map(s => `
            - mountPath: "/etc/secrets/${s.name}"
              name: ${s.name}
              readOnly: true`).join('')}` : ''}
      ${container.spec.secrets? `volumes:${container.spec.secrets?.map(s => `
        - name: ${s.name}
          secret:
            secretName: ${componentId}-${container.spec.id}-${s.name}`).join('')}` : ''}
      ${pullSecrets.length ? `imagePullSecrets:${pullSecrets.map(p => `
        - name: ${p}`).join('')}` : ''}
`
}

export { deployment }
