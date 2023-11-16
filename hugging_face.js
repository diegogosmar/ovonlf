const fetch = require('node-fetch');
const fs = require('fs').promises;

async function getApiKey() {
    try {
        const key = await fs.readFile('../API_Hug.key', 'utf8');
        return key.trim();
    } catch (error) {
        console.error('Error reading API key file:', error);
        return null;
    }
}

const model = 'HuggingFaceH4/zephyr-7b-beta';

async function queryModel(prompt, apiKey) {
    const url = `https://api-inference.huggingface.co/models/${model}`;
    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };
    const data = {
        inputs: prompt,
        options: {
            max_new_tokens: 256,
            do_sample: true,
            temperature: 0.7,
            top_k: 50,
            top_p: 0.95
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        return result[0].generated_text;
    } catch (error) {
        console.error('Error querying model:', error);
        return null;
    }
}

const messages = [
    {
        "role": "system",
        "content": "You are a knowledgeable chatbot.",
    },
    {"role": "user", "content": "Who wrote Harry Potter?"}
];
const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

let modelResponse = '';
let modelResponseAssistant = '';

getApiKey().then(apiKey => {
    if (apiKey) {
        queryModel(prompt, apiKey)
            .then(response => {
                console.log(response);
                modelResponse = response;
                
                const assistantResponseStart = response.lastIndexOf("assistant:") + "assistant:".length;
                modelResponseAssistant = response.substring(assistantResponseStart).trim();

                console.log("Assistant's Response:", modelResponseAssistant);
            })
            .catch(error => console.error(error));
    }
}).catch(error => console.error('Error with API key:', error));
