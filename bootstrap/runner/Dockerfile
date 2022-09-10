FROM pulumi/pulumi

WORKDIR /usr/app

# Install Github CLI
RUN mkdir .tools
RUN curl -L https://github.com/cli/cli/releases/download/v2.14.7/gh_2.14.7_linux_386.tar.gz --output /tmp/gh.tar.gz
RUN tar -xf /tmp/gh.tar.gz -C /tmp
RUN rm /tmp/gh.tar.gz
RUN mv /tmp/gh*/bin/gh /usr/local/bin

# Install npm packages
RUN npm install -G @pulumi/gcp@">=6.36.0"
RUN npm install -G @pulumi/pulumi@">=3.0.0"
RUN npm install -G @pulumi/random@">=4.8.2"
RUN npm install -G moment@">=2.29.4"
RUN npm install -G @pulumi/kubernetes@">=3.21.0"
RUN npm install -G @types/node@">=18.7.13"
RUN npm install -G typescript@">=4.8.2"

# Entrypoint
ENTRYPOINT [ "/bin/bash" ]