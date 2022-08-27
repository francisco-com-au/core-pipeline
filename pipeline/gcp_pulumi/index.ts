import * as pulumi from "@pulumi/pulumi";
import { Orgs } from "../../definitions/index"


import { readFileSync, writeFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';

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

syncWriteFile('./example.txt', 'One\nTwo\nThree\nFour');
