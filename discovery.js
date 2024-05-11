// discovery.js //
// Smart Library OVON universal API examples //
// SPDX-License-Identifier: Apache-2.0 //
// Diego Gosmar - 2023, 2024 //
// Discovery funtions for requestManifest, publishManifest, findAssistant, candidateAssistant event management //

const fs = require('fs').promises; // Use the promises API for better async handling
const path = require('path');

// Async function to handle the manifest request
async function handleRequestManifest(req, res) {
    try {
        // Read the manifest file
        const manifestContent = await fs.readFile(path.join(__dirname, 'public', 'Manifest.json'), 'utf8');
        const manifestJSON = JSON.parse(manifestContent);

        // Construct the response object
        const response = {
            "ovon": {
                "schema": {
                    "version": "0.9.2"
                },
                "conversation": {
                    "id": req.body.ovon.conversation.id  // Use the same conversation ID received
                },
                "sender": {
                    "from": "https://ovon.xcally.com",
                    "to": req.body.ovon.sender.from  // Use the sender's URL from the request
                },
                "events": [
                    {
                        "eventType": "publishManifest",
                        "parameters": {
                            "manifest": manifestJSON  // Include the manifest content
                        }
                    }
                ]
            }
        };

        // Send the response
        res.json(response);
    } catch (error) {
        console.error('Failed to process the manifest request:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    handleRequestManifest
};
