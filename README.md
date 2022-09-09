# Core Pipeline

# What is this?
This repo contains configuration for:
- Bootstraping a GCP Org from zero to hero - [`bootstrap`](/bootstrap/)
- GCP ORG level stuff (like policies, billing, IAM, etc)
- Configuration for Apps - [`definitions`](/definitions/)
- Code to make the configuration happen 🚀 - [`pipeline`](/pipeline/)

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

| Logical component | Google Cloud | Kubernetes | GitHub       | ArgoCD      | Traffic       |
|:-----------------:|:------------:|:----------:|:------------:|:-----------:|:-------------:|
| App               | Folder       | Namespace  | Organization | Project     | domain name   |
| Environment       | Project      | Cluster    | Branch       |             | ?             |
| Component         | Project      |            | Repository   | Application | domain prefix |
| Container         |              | Manifests  | Subfolder    |             | path          |

# Dependencies
- GCP Organization must be created (see [`bootstrap`](/bootstrap/))
- GitHub Organizations created for each App (cannot create GitHub Organizations programatically)
- ~~Create GCP Service Account with enough privileges to deploy stuff at the org level~~
- ~~Configure `GOOGLE_APPLICATION_CREDENTIALS` pointing at 👆🏼~~
- ~~Pulumi installed and logged in~~
- ~~GitHub CLI installed and logged in~~

# Running
WORK IN PROGRESS

There will be different scripts for creating the GitHub repos, ArgoCD apps and GCP stuff.
