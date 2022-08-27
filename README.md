# Core Pipeline

# What is this?
This repo contains configuration for:
- GCP ORG level stuff (like policies, billing, IAM, etc)
- Configuration for Apps
- Code to make the configuration happen 🚀

# What's an App?
An application is a logical construct that makes sense from a developer point of view. It packages things such as:
- what containers am I running?
- where is the source code for such container images?
- what environments do I need?
- what branch do I want to deploy to each environment?
- do I need to expose a port on HTTPS with a domain name and certificate?
- what GCP resources do I need?

## Anatomy of an App
```
application
 ├── app level config
 └── components
      ├── component level config
      └── containers
           └─ container level config
```

# Cross-tool logical relationship 

| Logical component | Google Cloud | Kubernetes | GitHub       | ArgoCD      |
|:-----------------:|:------------:|:----------:|:------------:|:-----------:|
| App               | Folder       | Namespace  | Organization | Project     |
| Environment       | Project      | Cluster    | Branch       |             |
| Component         |              |            | Repository   | Application |
| Container         |              | Manifests  | Subfolder    |             |

# Dependencies
- GCP Organization must be created (bootstrap)
- Create GCP Service Account with enough privileges to deploy stuff at the org level
- Configure `GOOGLE_APPLICATION_CREDENTIALS` pointing at 👆🏼
- Pulumi installed and logged in
- GitHub CLI installed and logged in
- GitHub Organizations created for each App (cannot create GitHub Organizations programatically)

# Running
WORK IN PROGRESS

There will be different scripts for creating the GitHub repos, ArgoCD apps and GCP stuff.