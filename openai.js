// Smart Library OVON universal API examples //
// SPDX-License-Identifier: Apache-2.0 //
// Adapted for OpenAI GPT-4 - 2024 //

const fetch = require('node-fetch');
const fs = require('fs').promises;

async function getApiKey() {
    try {
        const key = await fs.readFile('../OpenAI.key', 'utf8');
        return key.trim();
    } catch (error) {
        console.error('Error reading API key file:', error);
        return null;
    }
}

async function queryModelOpenAI(messages, apiKey) {
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };

    const data = {
        model: 'gpt-4-1106-preview', // Replace with your chosen model ID
        messages: messages,
        temperature: 0.7,
        max_tokens: 100 // Max lenght of the response in tokens
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        // Log the full response for debugging
        console.log('OpenAI Response:', JSON.stringify(result, null, 2));

        return result;
    } catch (error) {
        console.error('Error querying model:', error);
        return null;
    }
}

async function askModelOpenAI(question) {
    const apiKey = await getApiKey();
    if (!apiKey) {
        console.error('API key is not available');
        return null;
    }

    const messages = [
        {"role": "system", "content": "You are a knowledgeable chatbot."},
        {"role": "user", "content": question}
    ];

    const response = await queryModelOpenAI(messages, apiKey);
    if (response && response.choices && response.choices.length > 0) {
        // Extracting the assistant's response
        const assistantResponse = response.choices[0].message.content;
        return { fullResponse: response, assistantResponse };
    } else {
        return { fullResponse: response, assistantResponse: null };
    }
}

module.exports = { askModelOpenAI };

// New model specialized in ORDER info

async function askModelOpenAIOrder(orderQuestion) {
    const apiKey = await getApiKey();
    if (!apiKey) {
        console.error('API key is not available');
        return null;
    }

    // Craft a prompt that specifies the context of handling order information
    const messages = [
        {"role": "system", "content": "You are an assistant specialized in handling order queries. If the users ask you something, lookup inside the orders you are aware of and reply to them with detailed information. If they ask you any information not related to orders, gently explain them that you are the smart order agent and you can provide only information related to provided orders."},
        {"role": "user", "content": orderQuestion}
    ];

    const response = await queryModelOpenAI(messages, apiKey);
    if (response && response.choices && response.choices.length > 0) {
        // Extracting the assistant's response
        const assistantResponse = response.choices[0].message.content;
        return { fullResponse: response, assistantResponse };
    } else {
        return { fullResponse: response, assistantResponse: null };
    }
}

module.exports = { askModelOpenAIOrder };

