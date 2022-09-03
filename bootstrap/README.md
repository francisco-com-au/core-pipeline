# 🚀 Bootstrap
This will take you from zero to having a GCP organization up and running following best practices and configure an automated infrastructure-as-code pipeline.

By the end of this guide you will be able to commit code to a repo and have GCP resources created automatically 🤘🏼

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
    - Create a user called `gcp-admin@francisco.com.au`
- Verify domain
    - Follow the prompts
    - Use TXT verification
    - Copy the token provided
    - Go to the DNS settings of [your domain](https://domains.google.com/registrar/francisco.com.au/dns)
    - Add a custom record @ TXT with the token provided(looks something like `google-site-verification=8kgjahs_g4kdsla_s_djf6ad2f`)
    - Verify domain (this may take a few minutes)
- Create a new user with your name. This will be your primary user with less permissions to avoid mistakes `francisco@francisco.com.au`
- Sign in with your new admin user (`gcp-admin@francisco.com.au`) and accept the free $300 because why not?
- Create a billing account
### 1.3. Config gcloud CLI and create root project
- install gcloud ([instructions](https://cloud.google.com/sdk/docs/install))
- run `gcloud init` and follow this configuration:
- [2] Create a new configuration
- Name it `fran-gcp-admin`
- Select log in with a new account
- Log in with the `gcp-admin@francisco.com.au` created in step 2
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
- Cloud Build pipeline to deploy Infrastructure as Code based on this repo.

This is a very sensitive project and only members of the `gcp-organization-admins` group should have access to it.
</details>

## Steps
### 2.1. Set the following environment variables
| variable              | description |
|-----------------------|-------------|
| org_domain            | Domain of your organization. This is usually a DNS name you own. Example: `francisco.com.au` |
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
export org_domain='francisco.com.au'
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
### 3.3 Configure Cloud Build

# 4. Apply Terraform
- Edit the backend.tf file to point to the new bucket.
- Run ./entrypoint.sh