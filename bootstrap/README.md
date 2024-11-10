# 🚀 Bootstrap
This will take you from zero to having a GCP organization up and running following best practices and configure an automated infrastructure-as-code pipeline.

By the end of this guide you will be able to commit code to a repo and have GCP resources created automatically 🤘🏼

# 0. Dependencies
- Docker running
- docker buildx if you're on Apple silicon
- 1password installed and authenticated

# 1. Organisation setup 🏛

## Description
<details>
    <summary>click to expand</summary>

</details>

## Steps
### 1.1. Login
- Log in to GCP and create a project not tied to any organisation. `gcp-fran-bootstrap`
- Go to [APIs and services > Enabled APIs and services > Enable Service Usage API](https://console.cloud.google.com/apis/library/serviceusage.googleapis.com?project=gcp-fran-bootstrap)

### 1.2. Set up Cloud Identity account
- Go to [IAM > Identity & Organisation](https://console.cloud.google.com/iam-admin/cloudidentity/consumer?folder=&project=gcp-fran-bootstrap) and start the checklist
    - Sign up for Cloud Identity
    - Follow the prompts
    - Provide a domain name that you own
    - Create a user called `gcp-admin@american-broomstick.com`
- Verify domain
    - Follow the prompts
    - Use TXT verification
    - Copy the token provided
    - Go to the DNS settings of [your domain](https://account.squarespace.com/domains/managed/american-broomstick.com/dns/dns-settings)
    - Add a custom record @ TXT with the token provided(looks something like `google-site-verification=8kgjahs_g4kdsla_s_djf6ad2f`)
    - Verify domain (this may take a few minutes)
- Create a new user with your name. This will be your primary user with less permissions to avoid mistakes `francisco@american-broomstick.com`
- Sign in with your new admin user (`gcp-admin@american-broomstick.com`) and accept the free $300 because why not?
- Create a billing account
### 1.3. Config gcloud CLI and create root project
- install gcloud ([instructions](https://cloud.google.com/sdk/docs/install))
- run `gcloud init` and follow this configuration:
- [2] Create a new configuration
- Name it `fran-gcp-admin`
- Select log in with a new account
- Log in with the `gcp-admin@american-broomstick.com` created in step 2
- Create a new project
- Name it `gcp-fran-root`


# 2. Bootstrap initial configuration 🧱⛏
### Description
<details>
    <summary>click to expand</summary>

This step will configure the project `gcp-fran-root` created on the previous step. This project will be an admin zone and will serve as a host for:
- `[deprecated: using Pulumi now]` ~~Bucket to store the Terraform state files to deploy Infrastructure as Code.~~
- `[deprecated: using Pulumi now]` ~~Terraform service account with permissions at the organisation level to create/delete resources.~~
- `core-pipeline` service account. This permission will be used by the Core Pipeline to deploy org level stuff. As such it has very sensitive permissions.
- Cloud Build service account used by the build pipeline. This account will impersonate the ~~`Terraform`~~ `core-pipeline` service account mentioned above. ~~The only other permission it will have is access to the Terraform state bucket mentioned above.~~
- Build and push a core-pipeline-runner image to be used by the core pipeline.
- Cloud Build pipeline to deploy Infrastructure as Code based on this repo. [this is a manual process]

This is a very sensitive project and only members of the `gcp-organization-admins` group should have access to it.
</details>

## Steps
### 2.1. Set the following environment variables
| variable              | description |
|-----------------------|-------------|
| org_domain            | Domain of your organization. This is usually a DNS name you own. Example: `american-broomstick.com` |
| org_abbreviation      | A short abbreviation to be used as part of all the project IDs you create. Keeps names short. Example: `fran` |
| org_id                | The ID of the organization you created on step 1. Example: `123456789012` |
| billing_id            | The ID of the billing account you created on step 1.2. Example: `012ABC-DE3456-7890FA` |
| root_project_id       | The ID of the project you created on step 1.3. Example: `gcp-fran-root` |
| user_name             | The name of the primary user account with less privileges created on step 1.2. Example: `francisco` |
| core_pipeline_sa_name | A name for the service account used by the core pipeline. Example: `core-pipeline` |
| terraform_sa_name     | `[deprecated]` A name for the service account used by Terraform. Example `terraform` |
| cloud_build_sa_name   | A name for the service account used by Cloud Build. Example: `cloud-build` |

<details>
    <summary>click to see example</summary>
    
```bash
# Admin stuff
export org_domain='american-broomstick.com'
export org_abbreviation='fran'
export org_id='123456789012'
export billing_id='012ABC-DE3456-7890FA'
export root_project_id="gcp-${org_abbreviation}-root"
export user_name='francisco'
# Service Accounts
export core_pipeline_sa_name="core-pipeline"
export terraform_sa_name="terraform"
export cloud_build_sa_name="cloud-build"    
```

</details>

### 2.2. Execute the bootstrap script
```bash
./bootstrap.sh
```
### 2.3 Add yourself to some groups
This will give you access to see and work on projects from your own personal gmail account.
- Navigate to the [Google Admin](https://admin.google.com/) console
- Sign in with your `gcp-admin` account
- Add your personal gmail account to some groups. Recommendations are:
    - Developres
    - Viewers




# 3. Continuous delivery with Infra as Code
### Description
<details>
    <summary>click to expand</summary>

In this part you will configure a pipeline to automatically provision GCP resources when changes are made to this repo. This is the `core pipeline`.
</details>

## Steps
### 3.1 Create Pulumi account
- Create a free [Pulumi](app.pulumi.com) account
    - Login
    - Go to your profie > Settings > Access tokens
    - Create token
    - Copy the token and put it somewhere safe
### 3.2 Connect to GitHub
- Login to GCP as admin
    - Open the [GCP console](https://console.cloud.google.com)
    - login with the admin user creted in 1.2 (`gcp-admin@american-broomstick.com`)
    - select the admin project created in 1.3 (`gcp-fran-root`)
- Connect this GitHub repo
    - go to the [Cloud Build](https://console.cloud.google.com/cloud-build) section
    - go to Triggers > Manage Repositories > Connect repository
    - select GitHub (Cloud Build GitHub App)
    - enter your GitHub credentials and Authenticate
    - select this repository
### 3.3 Configure Cloud Build
- go to the [Cloud Build](https://console.cloud.google.com/cloud-build) page
- Create a `main` trigger
    - name: `core-pipeline-main`
    - event: Push to a branch
    - source: select the repo connected on 3.2
    - branch: `^main$`
    - configuration type: Cloud Build yaml
    - configuration location: `build/cloudbuild.yaml` 
    - Fill in the substitutions:
        - `_INSECURE_SUBSTITUTION_PULUMI_ACCESS_TOKEN`: your Pulumi token
        - `_INSECURE_SUBSTITUTION_GITHUB_ACCESS_TOKEN`: github token used to create repos. It needs `read:org, repo`
        - `_INSECURE_SUBSTITUTION_ORG_ID`: The ID of the organization you created on step 1
        - `_INSECURE_SUBSTITUTION_BILLING_ID`: billing id of the org created on 1.2
        - `_ORG_NAME`: full name
        - `_ORG_SHORT_NAME`: short prefix to be added to all projects
        - `_ORG_DESCRIPTION`: useful description
        - `_ORG_DOMAIN`: domain name
    - Send build logs to GitHub
    - Select the `core-pipeline` service account
    - Click Create
- It's recommended that you also create a `develop` trigger to test changes in the develop branch and configure it to deploy to a different organization.

# 4. Apply changes
- Make a change to this repo and push it
- See if Cloud Build gets triggerd
- See if the change is applied