const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const app = express();
const port = 8080;
const https = require('https');

// URL as a constant for easy modification
//const externalApiUrl = 'https://localhost/smartlibrary';
const externalApiUrl = 'https://ovon.xcally.com/smartlibrary';

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from 'public' folder
app.use(express.static('public'));

app.use(express.json());

app.post('/sendAction', async (req, res) => {
    console.log('Request received on /sendAction');
    console.log('Received Request:', req.body);
    const { userText, action, timest } = req.body; // Extract userText2 as well

    let postData;

    if (action === 'invite') {
        postData = {
            "ovon": {
                "schema": {
                  "version": "1.0.1",
                  "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
                },
                "conversation": {
                  "id": timest
                },
                "sender": {
                  "from": "https://organization_url_from",
                  "reply-to": "https://organization_url_to"
                },
                "responseCode": 200,
                "events": [
                    {
                        "eventType": "invite",
                        "parameters": {
                            "to": {
                                "url": "https://ovon.xcally.com"
                            }
                        }
                    }
                ]
            }
        };
    } else if (action === 'utterance') {
        postData = {
            "ovon": {
                "schema": {
                  "version": "1.0.1",
                  "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
                },
                "conversation": {
                  "id": timest
                },
                "sender": {
                  "from": "https://organization_url_from",
                  "reply-to": "https://organization_url_to"
                },
                "responseCode": 200,
                "events": [
                    {
                        "eventType": "utterance",
                        "parameters": {
                            "dialogEvent": {
                                "speakerId": "humanOrAssistantID",
                                "span": { 
                                    "startTime": new Date().toISOString() 
                                },
                                "features": {
                                    "text": {
                                        "mimeType": "text/plain",
                                        "tokens": [{ "value": userText }]
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        };
    } else if (action === 'whisperOnly') {
        postData = {
            "ovon": {
                "schema": {
                  "version": "1.0.1",
                  "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
                },
                "conversation": {
                  "id": timest
                },
                "sender": {
                  "from": "https://organization_url_from",
                  "reply-to": "https://organization_url_to"
                },
                "responseCode": 200,
                "events": [
                  {
                    "eventType": "invite",
                    "parameters": {
                      "to": {
                        "url": "https://ovon.xcally.com"
                      }
                     }
                   },
                    {
                    "eventType": "whisper",
                      "parameters": {
                        "dialogEvent": {
                          "speakerId": "humanOrAssistantID",
                          "span": { "startTime": new Date().toISOString()  },
                          "features": {
                            "text": {
                              "mimeType": "text/plain",
                              "tokens": [ { "value": userText } ] 
                            }
                          }
                        }
                      }
                    }
                ]
              }
            };
    } else if (action === 'whispUtter') {
        postData = {
            "ovon": {
                "schema": {
                  "version": "1.0.1",
                  "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
                },
                "conversation": {
                  "id": timest
                },
                "sender": {
                  "from": "https://organization_url_from",
                  "reply-to": "https://organization_url_to"
                },
                "responseCode": 200,
                "events": [
                  {
                    "eventType": "invite",
                    "parameters": {
                      "to": {
                        "url": "https://ovon.xcally.com"
                      }
                     }
                   },
                    {
                    "eventType": "utterance",
                      "parameters": {
                        "dialogEvent": {
                          "speakerId": "humanOrAssistantID",
                          "span": { "startTime": new Date().toISOString() },
                          "features": {
                            "text": {
                              "mimeType": "text/plain",
                              "tokens": [ { "value": userText } ] 
                            }
                          }
                        }
                      }
                    },
                    {
                    "eventType": "whisper",
                      "parameters": {
                        "dialogEvent": {
                          "speakerId": "humanOrAssistantID",
                          "span": { "startTime": new Date().toISOString() },
                          "features": {
                            "text": {
                              "mimeType": "text/plain",
                              "tokens": [ { userText } ] 
                            }
                          }
                        }
                      }
                    }
                ]
              }
            };
    }

    // Set to false to create an agent that ignores SSL certificate errors
    const httpsAgent = new https.Agent({
    rejectUnauthorized: true 
});

    try {
        const response = await fetch(externalApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
            agent: httpsAgent  // Use the custom agent
        });
        const responseBody = await response.text();
        console.log("Response Body",responseBody);

        const jsonResponse = JSON.parse(responseBody);
        res.json(jsonResponse);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error in making request');
    }
});

app.listen(port, () => {
    console.log(`Server running at PORT: ${port}`);
});
