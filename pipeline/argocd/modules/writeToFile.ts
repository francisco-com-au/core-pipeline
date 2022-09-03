// Packages
import { readFileSync, writeFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';

// ✅ write to file SYNCHRONOUSLY
function syncWriteFile(filename: string, data: any) {
  /**
   * flags:
   *  - w = Open file for reading and writing. File is created if not exists
   *  - a+ = Open file for reading and appending. The file is created if not exists
   */
  writeFileSync(filename, data, {
    flag: 'w',
  });

  const contents = readFileSync(filename, 'utf-8');
  // console.log(contents); // 👉️ "One Two Three Four"

  return contents;
}


const writeToFile = function(content: string, path: string) {
    syncWriteFile(path, content)
}

export { writeToFile }