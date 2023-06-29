import { readFileSync, writeFileSync } from 'fs';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage, AIChatMessage, FunctionChatMessage } from "langchain/schema";
import { Orgs } from '../../definitions/index';

const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;

// const QUESTION = 'I want to add a new microservice to the AI app. Should be built from the /chat directory in the repo and it should be exposed on chat.{domain}/api/v1. The container serves traffic on port 8081';
// const QUESTION = 'Can you go through the config and tell me if you can find any errors?';
const QUESTION = 'Write a summary of the configuration using markdown. This will be the README.md file of the repo. Show the hierarchy of services from org to endpoints';


// Load orgs
const stringOrg = JSON.stringify(Orgs);
console.log(`Org has ${stringOrg.length} characters`);


const SYSTEM_INIT_PROMPT = `You are a helpful Platform Engineer. You will assist users with questions about the platform.
The interface to the platform is custom TypeScript objects that will result in the creation of GCP projects, image build triggers, ArgoCD manifests with deployments, config maps, etc.

# What's an App?
An application is a logical construct that makes sense from a developer point of view. It packages things such as:
- what containers am I running?
- where is the source code for such container images?
- what environments do I need?
- what branch do I want to deploy to each environment?
- do I need to expose a port on HTTPS with a domain name and certificate?
- what GCP resources do I need?

## Anatomy of an App
application
 ├── app level config
 └── components
      ├── component level config
      └── containers
           └─ container level config

# Cross-tool logical relationship 

| Logical component | Google Cloud | Kubernetes | GitHub       | ArgoCD      | Traffic       |
|:-----------------:|:------------:|:----------:|:------------:|:-----------:|:-------------:|
| App               | Folder       | Namespace  | Organization | Project     | domain name   |
| Environment       | Project      | Cluster    | Branch       |             | ?             |
| Component         | Project      |            | Repository   | Application | domain prefix |
| Container         |              | Manifests  | Subfolder    |             | path          |

Users can ask you:
- explain the current configuration: you should read the configuration and answer the questions.
- create new configuration: you will decide what objects need to be created and generate that code.
- modify configuration: you will decide what objects need creation/deletion/modification and generate that code.
`;

function syncWriteFile(filename: string, data: any) {
    writeFileSync(filename, data, {
        flag: 'w',
    });
}
const writeToFile = function (content: string, path: string) {
    syncWriteFile(path, content);
}
const readFile = async (path: string) => {
    const buf = await readFileSync(path);
    return buf.toString();
}


export const app = async () => {
    // Read types and include in prompt
    const types = await readFile('./src/types.ts');
    console.log(`Types have ${types.length} characters`);

    const chat = new ChatOpenAI({
        openAIApiKey: OPEN_AI_API_KEY,
        temperature: 0,
        // modelName: 'gpt-3.5-turbo-0613',
        modelName: 'gpt-3.5-turbo-16k',
        maxTokens: -1
    });


    try {
        const response = await chat.call([
            new SystemChatMessage(SYSTEM_INIT_PROMPT),
            new SystemChatMessage(`These are the types for defining configuration: ${types}`),
            new SystemChatMessage(`This is the current configuration: ${stringOrg}`),
            new HumanChatMessage(QUESTION)
        ]);
        console.log(response);

        await writeToFile(`Question: ${QUESTION}\n\nAnswer:\n${response.text}`, `response_${new Date().toISOString()}.txt`);
    } catch (error) {
        console.log('Error');
        console.log(error);
    }
};