// Smart Library OVON universal API examples //
// SPDX-License-Identifier: Apache-2.0 //
// Diego Gosmar - 2023, 2024 //
// The purpose of this APIs is to supports some interaction responses via standard POST messages compatible with the //
// OVON Interoperable Conversation Envelope Specification, in order to provide an example of book information agent. //

const express = require('express');
const fs = require('fs'); // Import the full fs module
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const app = express();
const port = 443;
const https = require('https');

// URL as a constant for easy modification
//const externalApiUrl = 'https://localhost/smartlibrary';
const externalApiUrl = 'https://ovon.xcally.com/smartlibrary';

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from 'public' folder
app.use(express.static('public'));

app.use(express.json());

// AAA START

// Function to read credentials
async function readCredentials() {
  try {
      const username = await fs.promises.readFile('../usr_smart', 'utf8');
      const password = await fs.promises.readFile('../pwd_smart', 'utf8');
      return { username, password };
  } catch (error) {
      console.error('Error reading credentials:', error);
      throw error;
  }
}

// Authentication middleware
async function authenticate(req, res, next) {
    const { username, password } = await readCredentials();
    if (req.body.username === username && req.body.password === password) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

// Authentication route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = await readCredentials();
       // console.log(`Expected Username: ${username}, Expected Password: ${password}`); // Log credentials from files
       // console.log(`Received Username: ${req.body.username}, Received Password: ${req.body.password}`); // Log received credentials

        if (req.body.username === username.trim() && req.body.password === password.trim()) {
            res.send({ authenticated: true });
        } else {
            res.send({ authenticated: false });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});


// Serve static files
app.use(express.static('.'));

// Protect your main route
app.get('/', authenticate, (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// AAA END

// Prepare log file
const logToFileWeb = (message) => {
  try {
      const timestamp = new Date().toISOString();
      const logMessage = `${timestamp} - ${message}\n\n`;
      fs.appendFileSync('web.log', logMessage, 'utf8');
  } catch (error) {
      console.error('Error writing to log file:', error);
  }
};


app.post('/sendAction', async (req, res) => {
    // Log the incoming request
    logToFileWeb(`Received POST request on /sendAction: ${JSON.stringify(req.body)}`);
    //console.log('Request received on /sendAction');
    //console.log('Received Request:', req.body);
    const { userText, action, timest } = req.body; // Extract userText2 as well

    let postData;

    if (action === 'invite') {
        postData = {
            "ovon": {
                "schema": {
                  "version": "0.9.0",
                  "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
                },
                "conversation": {
                  "id": timest
                },
                "sender": {
                  "from": "https://organization_url_from",
                  "reply-to": "https://organization_url_to"
                },
                "responseCode": {
                  "code": 200,
                  "description": "OK"
                },
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
                  "version": "0.9.0",
                  "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
                },
                "conversation": {
                  "id": timest
                },
                "sender": {
                  "from": "https://organization_url_from",
                  "reply-to": "https://organization_url_to"
                },
                "responseCode": {
                  "code": 200,
                  "description": "OK"
                },
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
                  "version": "0.9.0",
                  "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
                },
                "conversation": {
                  "id": timest
                },
                "sender": {
                  "from": "https://organization_url_from",
                  "reply-to": "https://organization_url_to"
                },
                "responseCode": {
                  "code": 200,
                  "description": "OK"
                },
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
                  "version": "0.9.0",
                  "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
                },
                "conversation": {
                  "id": timest
                },
                "sender": {
                  "from": "https://organization_url_from",
                  "reply-to": "https://organization_url_to"
                },
                "responseCode": {
                  "code": 200,
                  "description": "OK"
                },
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
    }   else if (action === 'bye') {
        // Log the 'bye' action
        logToFileWeb(`Received 'Bye' action: ${JSON.stringify(req.body)}`);

        // Send a basic acknowledgment response
        res.json({ message: "Bye action received and ignored" });
        return; // Return to prevent further processing
    }

    // Set to false to create an agent that ignores SSL certificate errors
    const httpsAgent = new https.Agent({
    rejectUnauthorized: false 
});

    try {
        const response = await fetch(externalApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
            agent: httpsAgent  // Use the custom agent
        });
        const responseBody = await response.text();
        // console.log("Response Body",responseBody);
        // Log the response before sending it back
        logToFileWeb(`Sent POST response for /sendAction: ${responseBody}`);

        const jsonResponse = JSON.parse(responseBody);
        res.json(jsonResponse);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error in making request');
    }
});


// WEB SERVICES MANAGEMENT 

const { askModel } = require('./hugging_face'); // Adjust the path if necessary

app.use(bodyParser.json());

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
	if (req.protocol === 'http') {
	  res.redirect(301, `https://${req.headers.host}${req.url}`);
	} else {
	  next();
	}
  });

  const cors = require('cors');
  const PORT = 443; // Change to your desired HTTPS port
  app.use(cors());

  // Enable CORS for all routes
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*'); // You can replace '*' with your specific allowed origin
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
  });


// Set variable convid to the local timestamp
//var timest_id = new Date().getTime();
var timest = new Date().toLocaleString();

// Concatenate "conv_" before the timestamp
//var formattedTimestamp = "conv_" + timest;

// Create an array to store objects
var jsonArray = [];

// Store the received JSON data
let storedJsonData = null;

// Define the fetchData function
function fetchData(isbnValue) {
	const apiUrl = `https://openlibrary.org/isbn/${isbnValue}.json`;
  
	return fetch(apiUrl)
	  .then(response => {
		if (!response.ok) {
		  throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return response.json();
	  })
	  .then(data => {
		return JSON.stringify(data); // Stringify the data
	  });
  }
  
// Prepare log file
const logToFile = (message) => {
  try {
      const timestamp = new Date().toISOString();
      // Add a newline character at the end of each log message
      const logMessage = `${timestamp} - ${message}\n\n`;
      fs.appendFileSync('smlibrary.log', logMessage, 'utf8');
  } catch (error) {
      console.error('Error writing to log file:', error);
  }
};

// Check if data.ovon.events contains the eventType named "bye"
const hasByeEventType = data => data.ovon.events.some(event => event.eventType === "bye");

  // app.post START on /smartlibrary endpoint
  app.post('/smartlibrary', async (req, res) => {
	try {

    // Log the incoming request
    logToFile(`Received POST request on /smartlibrary: ${JSON.stringify(req.body)}`);

	  const data = req.body;
	  storedJsonData = data;
	  jsonArray.push(data);
  
	  const ovonConversationId = data.ovon.conversation.id;
	  const ovonevent = data.ovon.events;
	 //console.log('ConversationId:', ovonConversationId);

	// Check if data.ovon.events contains the eventType named "whisper"
	const hasWhisperEventType = data.ovon.events.some(event => event.eventType === "whisper");
	//console.log('Has Whisper:', hasWhisperEventType);

    // Check if data.ovon.events contains the eventType named "utterance"
    const hasUtteranceEventType = data.ovon.events.some(event => event.eventType === "utterance");
	//console.log('Has Utterance:', hasUtteranceEventType);

	  // Fetch data if ONLY the condition for WHISPER is met (intended for pure ISBN queries) 
	  let stringifiedDataWhisper = "";
	if (hasWhisperEventType && !hasUtteranceEventType) {
		const isbnToken = data.ovon.events.find(event => event.eventType === "whisper").parameters.dialogEvent.features.text.tokens[0];
		const isbnValue = isbnToken && isbnToken.value;
  
		if (isbnValue) {
		  stringifiedDataWhisper = await fetchData(isbnValue);
		  //console.log("isbnValue Data:", stringifiedDataWhisper);
		} else {
		  //console.log("ISBN_value not found in the JSON.");
		}
	}

	// Prepare data if both the condition for HUTTERANCE and WHISPER are met 
	let whisToken;  // Declare whisToken at a higher scope
	if (hasWhisperEventType && hasUtteranceEventType) {
		whisToken = data.ovon.events.find(event => event.eventType === "whisper").parameters.dialogEvent.features.text.tokens[0];
		// console.log("Whisper Token", whisToken);
	}
	  // Fetch data if the condition for UTTERANCE is met
	let stringifiedDataUT = "";
	
	if (hasUtteranceEventType) {
		const questionToken = data.ovon.events.find(event => event.eventType === "utterance").parameters.dialogEvent.features.text.tokens[0];
		let question = questionToken && questionToken.value;
	
		if (hasWhisperEventType) {
			question += " " + whisToken.value; // Concatenate stringifiedDataWhisper to question
			// console.log("question concat:", question);
		}
  
		if (question) {
			try {
				const { assistantResponse } = await askModel(question);
				LLM_response = assistantResponse;
				// console.log("LLM Response:", LLM_response);
		
				// Use LLM_response in fetchData
			//	stringifiedDataUT = await fetchData(LLM_response);
			//	console.log("Stringified Data:", stringifiedDataUT);
			} catch (error) {
				console.error(error);
			}
		} else {
			console.log("UTTERANCE_value not found in the JSON.");
		}
		
	}

	  // Preparing JSON RESPONSES

		let myJson;
          // Handle "Bye" event type
          if (hasByeEventType(data)) {
              // Respond with a simple message for "Bye" action
              res.json({ message: "Bye action received and ignored" });
              return; // Stop further processing
          } else if (hasWhisperEventType && !hasUtteranceEventType) {
			myJson = {
				ovon: {
          schema: {
            "version": "0.9.0",
            "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
          },
					conversation: {
						id: ovonConversationId
					},
					sender: {
						from: "Smart Library APIs"
					},
					responseCode: {
            "code": 200,
            "description": "OK"
          },
					events: [
						{
							eventType: "utterance",
							parameters: {
								dialogEvent: {
									speakerId: "assistant",
									span: {
										startTime: new Date().toISOString()
									},
									features: {
										text: {
											mimeType: "text/plain",
											tokens: [{ value: stringifiedDataWhisper }]
										}
									}
								}
							}
						}
					]
				}
			};
		} else if (hasUtteranceEventType) {
			myJson = {
				ovon: {
          schema: {
            "version": "0.9.0",
            "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
          },
					conversation: {
						id: ovonConversationId
					},
					sender: {
						from: "Smart Library APIs"
					},
					responseCode: {
            "code": 200,
            "description": "OK"
          },
					events: [
						{
							eventType: "utterance",
							parameters: {
								dialogEvent: {
									speakerId: "assistant",
									span: {
										startTime: new Date().toISOString()
									},
									features: {
										text: {
											mimeType: "text/plain",
											tokens: [{ value: JSON.stringify(LLM_response) }]
										}
									}
								}
							}
						}
					]
				}
			};
		} else {
			// Default logic or response for scenarios other than whisper or utterance
			myJson = {
				// Default JSON structure
				ovon: {
          schema: {
            "version": "0.9.0",
            "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
          },
					conversation: {
					  id: ovonConversationId
					},
					sender: {
					  from: "https://ovon.xcally.com"
					},
					responseCode: {
            "code": 200,
            "description": "OK"
          },
					events: [
					  {
						eventType: "utterance",
						parameters: {
						  dialogEvent: {
							speakerId: "assistant",
							span: {
							  startTime: new Date().toISOString()
							},
							features: {
							  text: {
								mimeType: "text/plain",
								tokens: [
								  {
									value: "Welcome to the OVON Smart Library service! I can look up information about books if you provide a valid ISBN number with a Whisper. If you prefer, you can also send me a Natural Language utterance and I'll reply you!"
								  }
								]
							  }
							}
						  }
						}
					  }
					]
				  }
			};
		};
		

	  // Convert the JSON object to a string for display or transmission
	  const jsonString = JSON.stringify(myJson);
  
	  // Log the result to the console
	  //console.log(jsonString);
    // Log the response before sending it back
    logToFile(`Sent POST response for /smartlibrary: ${jsonString}`);

	  // Send the jsonString as POST RESPONSE 201 success resource update
	  res.status(201).send(jsonString);
	} catch (error) {
	  //console.error('Error:', error);
	  res.status(500).send('Internal Server Error');
	}

	
  });
// POST Management END

// Define the route for handling GET requests to '/smartlibrary'
app.get('/smartlibrary', (req, res) => {
    // Check if there is stored JSON data
    //if (storedJsonData) {
      // Convert the stored JSON data to a string
      //const jsonStringGet = JSON.stringify(storedJsonData);
  
      // Send the JSON data as the response
      //res.status(200).send(jsonStringGet);
   // } else {
      // If no data is stored, send an appropriate response
      // For the moment do not allow this method
      res.status(404).send('Method Not Allowed');
   // }
  });

// SSL/TLS Certificates paths
const privateKey = fs.readFileSync('../certificates/your_key.key', 'utf8');
const certificate = fs.readFileSync('../certificates/your_cert.crt', 'utf8');

const credentials = { key: privateKey, cert: certificate };

// Creating HTTPS server
const httpsServer = https.createServer(credentials, app);

const HTTPS_PORT = 443;

httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
});
