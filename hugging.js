const fetch = require('node-fetch');

// Replace with your Hugging Face API key
const API_KEY = 'your_API_KEY';

// Function to query the Hugging Face model
async function queryHuggingFaceModel(sentence) {
    const url = 'https://api-inference.huggingface.co/models/gpt2';
    const headers = {
        'Authorization': `Bearer ${API_KEY}`
    };
    const data = {
        inputs: sentence,
        parameters: {
            max_length: 70,
            temperature: 1.0,
   //         top_k: 50,
   //         top_p: 0.9,
   //         num_return_sequences: 1,
            repetition_penalty: 1.2,
   //         no_repeat_ngram_size: 2
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
        console.error('Error querying Hugging Face API:', error);
        return null;
    }
}

// Example usage
const sentence = "Who is the author of the Harry Potter books?";
queryHuggingFaceModel(sentence)
    .then(response => console.log(response))
    .catch(error => console.error(error));
