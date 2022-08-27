// Packages
import { readFileSync, writeFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';

// Import definitions
import { Orgs } from "../../definitions";

// ✅ write to file SYNCHRONOUSLY
function syncWriteFile(filename: string, data: any) {
  /**
   * flags:
   *  - w = Open file for reading and writing. File is created if not exists
   *  - a+ = Open file for reading and appending. The file is created if not exists
   */
  writeFileSync(join(__dirname, filename), data, {
    flag: 'w',
  });

  const contents = readFileSync(join(__dirname, filename), 'utf-8');
  console.log(contents); // 👉️ "One Two Three Four"

  return contents;
}

// Initiate a store
const reposToMake: string[] = [];
let repoFileContent = "#!/bin/bash\n";

// Read
Orgs.forEach(org => {
    org.spec.apps?.forEach(app => {
        app.spec.components?.forEach(component => {
            const repo = component.spec.source.repo;
            let org = component.spec.source.organization || app.spec.github.organization;
            // Check if repo exists
            repoFileContent += `git ls-remote git@github.com:test-hello-world/website.git || `
            // Create repo
            repoFileContent += `gh repo create ${org ? `${org}/` : "" }${repo} --private --description "Source code for ${app.spec.name}" --gitignore "Node" --license "MIT"\n`;
        })
    })
})


syncWriteFile('./makeRepos.sh', repoFileContent);
