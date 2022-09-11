# ---------------------------------------------------------------
# Base image to download stuff and borrow the pulumi binary
# ---------------------------------------------------------------

FROM pulumi/pulumi as pulumi

# Download Github
RUN curl -L https://github.com/cli/cli/releases/download/v2.14.7/gh_2.14.7_linux_386.tar.gz --output /tmp/gh.tar.gz
RUN tar -xf /tmp/gh.tar.gz -C /tmp
RUN mv /tmp/gh*/bin/gh /tmp


# ---------------------------------------------------------------
# Final image based on alpine
# ---------------------------------------------------------------

FROM node:16-alpine

WORKDIR /usr/app

# Install git
RUN apk add git

# Install Github CLI
COPY --from=pulumi /tmp/gh /usr/local/bin/gh

# Borrow the Pulumi CLI from the base image
COPY --from=pulumi /usr/bin/pulumi /usr/bin/pulumi
COPY --from=pulumi /usr/bin/pulumi-language-nodejs /usr/bin/pulumi-language-nodejs

# Install npm packages
RUN npm install -G @pulumi/gcp@">=6.36.0"
RUN npm install -G @pulumi/pulumi@">=3.0.0"
RUN npm install -G @pulumi/random@">=4.8.2"
RUN npm install -G moment@">=2.29.4"
RUN npm install -G @types/node@">=18.7.13"
RUN npm install -G typescript@">=4.8.2"

# Entrypoint
ENTRYPOINT [ "/bin/sh" ]