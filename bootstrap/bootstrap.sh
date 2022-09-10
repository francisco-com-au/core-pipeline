#!/bin/bash

source env/test-fran.env


##############################################################################
#
# Set up the Root project:
# - enable APIs
# - enable billing
#
##############################################################################

# Enable Resource Manager API (to be able to use other APIs)
gcloud services enable cloudresourcemanager.googleapis.com --project $root_project_id

# Enable IAM API (to create Service Accounts)
gcloud services enable iam.googleapis.com --project $root_project_id

# Enable Service Account Credentials API (to enable Service Account impersonation)
gcloud services enable iamcredentials.googleapis.com --project $root_project_id

# Enable billing
gcloud services enable cloudbilling.googleapis.com --project $root_project_id
gcloud alpha billing projects link $root_project_id --billing-account=$billing_id

# Enable Cloud Identity API (to create groups)
gcloud services enable cloudidentity.googleapis.com --project $root_project_id

# Enable Cloud Build API (for the core pipeline)
gcloud services enable cloudbuild.googleapis.com --project $root_project_id

# Enable DNS API (for domain name resolution)
gcloud services enable dns.googleapis.com --project $root_project_id

# [deprecated] Make a bucket to use as a terraform backend
gsutil mb \
    -b on \
    -c standard \
    -l australia-southeast1 \
    -p $root_project_id \
    gs://$root_project_id-terraform-backend


##############################################################################
#
# Set up org groups
# - organization admins
# - billing admins
# - developers
# - viewers
#
##############################################################################

# org admin
gcloud identity groups create \
    gcp-organization-admins@$org_domain \
    --organization="$org_domain" \
    --display-name="🔌 Organization Admins" \
    --description="Users in this group inherit admin permissions. This is a break-glass group. Use with caution."

# billing admin
gcloud identity groups create \
    gcp-billing-admins@$org_domain \
    --organization="$org_domain" \
    --display-name="💰 Billing Admins" \
    --description="Users in this group can create/update/remove billing information."

# network admin
gcloud identity groups create \
    gcp-network-admins@$org_domain \
    --organization="$org_domain" \
    --display-name="🥷🏻 Network Admins" \
    --description="Users in this group have admin access to network resources such as DNS."

# devops
gcloud identity groups create \
    gcp-devops@$org_domain \
    --organization="$org_domain" \
    --display-name="🧱 DevOps" \
    --description="Users in this group can modify build definitions."
gcloud identity groups memberships add \
    --group-email="gcp-developers@$org_domain" \
    --member-email="$user_name@$org_domain"

# developers
gcloud identity groups create \
    gcp-developers@$org_domain \
    --organization="$org_domain" \
    --display-name="🚀 Developers" \
    --description="Have loose permissions on dev environments to move fast 🚀"
gcloud identity groups memberships add \
    --group-email="gcp-developers@$org_domain" \
    --member-email="$user_name@$org_domain"

# viewers
gcloud identity groups create \
    gcp-viewers@$org_domain \
    --organization="$org_domain" \
    --display-name="🤷🏻‍♂️ Viewers" \
    --description="Can see every project."
gcloud identity groups memberships add \
    --group-email="gcp-viewers@$org_domain" \
    --member-email="$user_name@$org_domain"



##############################################################################
#
# Make a Service Account used by the core pipeline to deploy resources
#
##############################################################################

# Create service account
gcloud iam service-accounts create $core_pipeline_sa_name \
    --description="used by the core pipeline to deploy resources at the org level" \
    --display-name="$core_pipeline_sa_name" \
    --project $root_project_id
# Make key
mkdir -p ~/credentials/$root_project_id
gcloud iam service-accounts keys create ~/credentials/$root_project_id/$core_pipeline_sa_name.json \
    --iam-account $core_pipeline_sa_name@$root_project_id.iam.gserviceaccount.com \
    --project $root_project_id
cp ~/credentials/$root_project_id/$core_pipeline_sa_name.json ../$org_abbreviation-core-pipeline-key.json


# ------------------------------------------------
# Grant roles
# ------------------------------------------------
# Billing admin
gcloud organizations add-iam-policy-binding $org_id \
    --member=serviceAccount:$core_pipeline_sa_name@$root_project_id.iam.gserviceaccount.com \
    --role=roles/billing.admin
# Folder admin
gcloud organizations add-iam-policy-binding $org_id \
    --member=serviceAccount:$core_pipeline_sa_name@$root_project_id.iam.gserviceaccount.com \
    --role=roles/resourcemanager.folderAdmin
# Project creator
gcloud organizations add-iam-policy-binding $org_id \
    --member=serviceAccount:$core_pipeline_sa_name@$root_project_id.iam.gserviceaccount.com \
    --role=roles/resourcemanager.projectCreator
# Project deleter
gcloud organizations add-iam-policy-binding $org_id \
    --member=serviceAccount:$core_pipeline_sa_name@$root_project_id.iam.gserviceaccount.com \
    --role=roles/resourcemanager.projectDeleter
# Service usage admin
gcloud organizations add-iam-policy-binding $org_id \
    --member=serviceAccount:$core_pipeline_sa_name@$root_project_id.iam.gserviceaccount.com \
    --role=roles/serviceusage.serviceUsageAdmin
# Logging admin
gcloud organizations add-iam-policy-binding $org_id \
    --member=serviceAccount:$core_pipeline_sa_name@$root_project_id.iam.gserviceaccount.com \
    --role=roles/logging.admin
# Storage
gcloud organizations add-iam-policy-binding $org_id \
    --member=serviceAccount:$core_pipeline_sa_name@$root_project_id.iam.gserviceaccount.com \
    --role=roles/storage.admin





# ##############################################################################
# #
# # Make a Service Account used by terraform to deploy resources
# #
# ##############################################################################

# # Create terraform service account
# gcloud iam service-accounts create $terraform_sa_name \
#     --description="used to deploy resources" \
#     --display-name="$terraform_sa_name" \
#     --project $root_project_id
# # Make key
# mkdir -p ~/credentials/$root_project_id
# gcloud iam service-accounts keys create ~/credentials/$root_project_id/$terraform_sa_name.json \
#     --iam-account $terraform_sa_name@$root_project_id.iam.gserviceaccount.com \
#     --project $root_project_id
# cp ~/credentials/$root_project_id/$terraform_sa_name.json ../$org_abbreviation-terraform-key.json

# # Gran roles
# # Billing admin
# gcloud organizations add-iam-policy-binding $org_id \
#     --member=serviceAccount:$terraform_sa_name@$root_project_id.iam.gserviceaccount.com \
#     --role=roles/billing.admin
# # Folder admin
# gcloud organizations add-iam-policy-binding $org_id \
#     --member=serviceAccount:$terraform_sa_name@$root_project_id.iam.gserviceaccount.com \
#     --role=roles/resourcemanager.folderAdmin
# # Project creator
# gcloud organizations add-iam-policy-binding $org_id \
#     --member=serviceAccount:$terraform_sa_name@$root_project_id.iam.gserviceaccount.com \
#     --role=roles/resourcemanager.projectCreator
# # Service usage admin
# gcloud organizations add-iam-policy-binding $org_id \
#     --member=serviceAccount:$terraform_sa_name@$root_project_id.iam.gserviceaccount.com \
#     --role=roles/serviceusage.serviceUsageAdmin
# # Logging admin
# gcloud organizations add-iam-policy-binding $org_id \
#     --member=serviceAccount:$terraform_sa_name@$root_project_id.iam.gserviceaccount.com \
#     --role=roles/logging.admin
# # Storage
# gcloud organizations add-iam-policy-binding $org_id \
#     --member=serviceAccount:$terraform_sa_name@$root_project_id.iam.gserviceaccount.com \
#     --role=roles/storage.admin


# ##############################################################################
# #
# # Make a Service Account used by cloud build to deploy resources.
# # This account will impersonate the Terraform service account created above.
# #
# ##############################################################################

# # Create cloud build service account
# gcloud iam service-accounts create $cloud_build_sa_name \
#     --description="Used by cloud build to deploy resources. Will impersonate the core pipeline service account." \
#     --display-name="$cloud_build_sa_name" \
#     --project $root_project_id
# # Allow it to impersonate the core pipeline service account. This is done by modifying the policy of the host service account (that is, the core pipeline service account).
# etag_line=$(gcloud iam service-accounts get-iam-policy $core_pipeline_sa_name@$root_project_id.iam.gserviceaccount.com --format json | grep etag)
# new_policy="{
#     \"bindings\": [
#         {
#             \"role\": \"roles/iam.serviceAccountUser\",
#             \"members\": [
#                 \"serviceAccount:$cloud_build_sa_name@$root_project_id.iam.gserviceaccount.com\"
#             ]
#         },
#         {
#             \"role\": \"roles/iam.serviceAccountTokenCreator\",
#             \"members\": [
#                 \"serviceAccount:$cloud_build_sa_name@$root_project_id.iam.gserviceaccount.com\"
#             ]
#         }
#     ],
#     $etag_line
# }"
# echo $new_policy > policy.json
# gcloud iam service-accounts set-iam-policy $core_pipeline_sa_name@$root_project_id.iam.gserviceaccount.com policy.json
# rm policy.json
# # Grant it access to the terraform state bucket
# gsutil iam ch \
#     serviceAccount:$cloud_build_sa_name@$root_project_id.iam.gserviceaccount.com:roles/storage.objectAdmin \
#     gs://$root_project_id-terraform-backend
# gsutil iam ch \
#     serviceAccount:$core_pipeline_sa_name@$root_project_id.iam.gserviceaccount.com:roles/storage.objectAdmin \
#     gs://$root_project_id-terraform-backend

# # Make key
# mkdir -p ~/credentials/$root_project_id
# gcloud iam service-accounts keys create ~/credentials/$root_project_id/$cloud_build_sa_name.json \
#     --iam-account $cloud_build_sa_name@$root_project_id.iam.gserviceaccount.com \
#     --project $root_project_id
# cp ~/credentials/$root_project_id/$cloud_build_sa_name.json ../$org_abbreviation-cloud-build-key.json


##############################################################################
#
# Make an image to run the core pipeline
# This will save time as a bunch of stuff will be preinstalled
#
##############################################################################

tag=0.0.0
runner_image_name="gcr.io/$root_project_id/core-pipeline-runner"
docker build \
    -t $runner_image_name:$tag \
    -t $runner_image_name:latest \
    -f runner/Dockerfile runner
docker push $runner_image_name:$tag
docker push $runner_image_name:latest