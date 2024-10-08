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
const { handleRequestManifest } = require('./discovery'); // Adjust the path as necessary

// Function to read API Key synchronously for Agent PRO usage
function readApiKeySync() {
  try {
      const apiKey = fs.readFileSync('../api_key.txt', 'utf8'); // Adjust the file path as necessary
      return apiKey.trim();
  } catch (error) {
      console.error('Error reading API key file:', error);
      return null;
  }
}

// Middleware for API Key Authentication
function apiKeyAuthSync(req, res, next) {
  const apiKey = readApiKeySync();
  const requestApiKey = req.header('API_Key');

  if (!apiKey || requestApiKey !== apiKey) {
      return res.status(401).send('Unauthorized: Invalid API Key');
  }
  next();
}

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
                  "version": "0.9.2",
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
                  "version": "0.9.2",
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
                  "version": "0.9.2",
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
                  "version": "0.9.2",
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


// WEB SERVICES MANAGEMENT Hugging_Face Model

const { askModel } = require('./hugging_face.js'); // Adjust the path if necessary

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

  // New code: Check if there is a 'requestManifest' event
  // console.log("Before checking for 'requestManifest'");
  const hasRequestManifest = data.ovon.events.some(event => event.eventType === "requestManifest");
  // console.log("After checking for 'requestManifest':", hasRequestManifest);
  
  if (hasRequestManifest) {
      console.log("Handling requestManifest");
      handleRequestManifest(req, res);
      return; // Ensure no further processing is done for this request
  }  

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
      // Decode the question to replace non-ASCII character with space (i.e. %20, %21,...)
      question = decodeURIComponent(question);
			try {
				// Using HugFace model or OpenAI model
        //const { assistantResponse } = await askModel(question);
        const { assistantResponse } = await askModelOpenAI(question);
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
            "version": "0.9.2",
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
            "version": "0.9.2",
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
            "version": "0.9.2",
            "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
          },
					conversation: {
					  id: ovonConversationId
					},
					sender: {
					  from: "https://ovon.xcally.com/smartlibrary"
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
									value: "Hello from Athena, your Smart Library service! Please ask me anything about books and writers. If you prefer, you can also whisper me a valid ISDN number to look-up for a specific book information."
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
      res.status(404).send('Method Not Allowed');
   // }
  });

// ORDER MNG section with RAG

// Function to read from 'order.txt'
async function readOrderFile() {
  try {
      const data = fs.readFileSync('order.txt', 'utf8');
      return data;
  } catch (err) {
      console.error(err);
      return '';
  }
}

// Function to process the model's response and extract the relevant part
function processModelResponse(fullResponse, question) {
  const splitResponse = fullResponse.split(question).pop();
  return splitResponse ? splitResponse.trim() : '';
}

// Function to process the order info request using Hugging Face model
async function processOrderInfoRequest(request) {
  const orderData = await readOrderFile();

  if (orderData) {
      //concatenate the request (prompt) with the contect (content of the order text)
      const combinedInput = `${request.toString()}\n\n${orderData.toString()}`;

      const response = await askModel(combinedInput);
      if (response && response.fullResponse) {
          // Process the full response to extract only the answer
          return processModelResponse(response.fullResponse, combinedInput);
      } else {
          console.error("Unexpected response format from askModel:", response);
          return "Error: Unexpected response format.";
      }
  } else {
      throw new Error('No order data available');
  }
}

// Function to log messages to 'orderinfo.log'
function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${message}\n`;
  fs.appendFileSync('orderinfo.log', logEntry, 'utf8');
}

// Function to log messages every express received request
app.use((req, res, next) => {
  const logEntry = `Raw request received at ${new Date().toISOString()}: ${JSON.stringify(req.body)}\n`;
  fs.appendFile('requests.log', logEntry, (err) => {
      if (err) {
          console.error('Error writing to log file', err);
      }
  });
  next();
});

// New endpoint for 'orderinfo'
app.post('/orderinfo', async (req, res) => {
  try {

      // Log the incoming request
      logMessage(`Received POST request: ${JSON.stringify(req.body)}`);

      // Extract the orderToken from the request
      const orderToken = req.body.ovon.events.find(event => event.eventType === "utterance").parameters.dialogEvent.features.text.tokens[0];
      const orderInfoRequestEncoded = orderToken && orderToken.value;

      if (!orderInfoRequestEncoded) {
        throw new Error('Order information not found in the request');
        }

      // Decode the encoded order information request
      const orderInfoRequest = decodeURIComponent(orderInfoRequestEncoded);

      // Log the decoded request (without %20)
      logMessage(`Decoded POST request: ${orderInfoRequest}`);

      const orderInfoResponse = await processOrderInfoRequest(orderInfoRequest);

      // Log the decoded request (without %20)
      logMessage(`Process Info request: ${orderInfoResponse}`);

      const ovonResponse = {
          ovon: {
              schema: {
                  version: "0.9.2",
                  url: "https://openvoicenetwork.org/schema/dialog-envelope.json"
              },
              conversation: {
                  id: req.body.ovon.conversation.id
              },
              sender: {
                  from: "https://yourserver.com/orderinfo"
              },
              responseCode: {
                  code: 200,
                  description: "OK"
              },
              events: [
                  {
                      eventType: "orderInfoResponse",
                      parameters: {
                          dialogEvent: {
                              speakerId: "assistant",
                              span: {
                                  startTime: new Date().toISOString()
                              },
                              features: {
                                  text: {
                                      mimeType: "text/plain",
                                      tokens: [{ value: orderInfoResponse }]
                                  }
                              }
                          }
                      }
                  }
              ]
          }
      };
  
  // Log successful response
  logMessage(`Successfully processed request: ${JSON.stringify(ovonResponse)}`);

      res.status(200).json(ovonResponse);
  } catch (error) {
      console.error('Error in /orderinfo:', error);
      res.status(500).send('Internal Server Error');
  }
});

// BANK MNG section with RAG

const { askModelBank } = require('./hugging_face.js');

// Function to read from 'bank.txt'
async function readBankFile() {
  try {
      const data = fs.readFileSync('bank.txt', 'utf8');
      return data;
  } catch (err) {
      console.error(err);
      return '';
  }
}

// Function to process the model's response and extract the relevant part
function processModelResponse(fullResponse, question) {
  const splitResponse = fullResponse.split(question).pop();
  return splitResponse ? splitResponse.trim() : '';
}

// Function to process the bank info request using Hugging Face model
async function processBankInfoRequest(request) {
  const bankData = await readBankFile();

  if (bankData) {
      //concatenate the request (prompt) with the contect (content of the bank text)
      const combinedInput = `${request.toString()}\n\n${bankData.toString()}`;

      const response = await askModelBank(combinedInput);
      if (response && response.fullResponse) {
          // Process the full response to extract only the answer
          return processModelResponse(response.fullResponse, combinedInput);
      } else {
          console.error("Unexpected response format from askModel:", response);
          return "Error: Unexpected response format.";
      }
  } else {
      throw new Error('No bank data available');
  }
}

// Function to log messages to 'bankinfo.log'
function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${message}\n`;
  fs.appendFileSync('bankinfo.log', logEntry, 'utf8');
}

// Function to log messages every express received request
app.use((req, res, next) => {
  const logEntry = `Raw request received at ${new Date().toISOString()}: ${JSON.stringify(req.body)}\n`;
  fs.appendFile('requests.log', logEntry, (err) => {
      if (err) {
          console.error('Error writing to log file', err);
      }
  });
  next();
});

// New endpoint for 'bankinfo'
app.post('/bankinfo', async (req, res) => {
  try {

      // Log the incoming request
      logMessage(`Received POST request: ${JSON.stringify(req.body)}`);

      // Extract the bankToken from the request
      const bankToken = req.body.ovon.events.find(event => event.eventType === "utterance").parameters.dialogEvent.features.text.tokens[0];
      const bankInfoRequestEncoded = bankToken && bankToken.value;

      if (!bankInfoRequestEncoded) {
        throw new Error('Bank information not found in the request');
        }

      // Decode the encoded bank information request
      const bankInfoRequest = decodeURIComponent(bankInfoRequestEncoded);

      // Log the decoded request (without %20)
      logMessage(`Decoded POST request: ${bankInfoRequest}`);

      const bankInfoResponse = await processBankInfoRequest(bankInfoRequest);

      // Log the decoded request (without %20)
      logMessage(`Process Info request: ${bankInfoResponse}`);

      const ovonResponse = {
          ovon: {
              schema: {
                  version: "0.9.2",
                  url: "https://openvoicenetwork.org/schema/dialog-envelope.json"
              },
              conversation: {
                  id: req.body.ovon.conversation.id
              },
              sender: {
                  from: "https://yourserver.com/bankinfo"
              },
              responseCode: {
                  code: 200,
                  description: "OK"
              },
              events: [
                  {
                      eventType: "bankInfoResponse",
                      parameters: {
                          dialogEvent: {
                              speakerId: "assistant",
                              span: {
                                  startTime: new Date().toISOString()
                              },
                              features: {
                                  text: {
                                      mimeType: "text/plain",
                                      tokens: [{ value: bankInfoResponse }]
                                  }
                              }
                          }
                      }
                  }
              ]
          }
      };
  
  // Log successful response
  logMessage(`Successfully processed request: ${JSON.stringify(ovonResponse)}`);

      res.status(200).json(ovonResponse);
  } catch (error) {
      console.error('Error in /bankinfo:', error);
      res.status(500).send('Internal Server Error');
  }
});


// WEB SERVICES MANAGEMENT OpenAI Model (pro)

const { askModelOpenAI, askModelOpenAIOrder, askModelOpenAIBank } = require('./openai.js'); // OpenAI GPT-4 general and specilized on order models

app.use(bodyParser.json());

// Prepare log file for smartagent inside smagent.log
const logToFileAgent = (message) => {
  try {
      const timestamp = new Date().toISOString();
      const logMessage = `${timestamp} - ${message}\n\n`;
      fs.appendFileSync('smagent.log', logMessage, 'utf8');
  } catch (error) {
      console.error('Error writing to log file:', error);
  }
};

// Duplicate and modify the /smartlibrary endpoint for OpenAI
app.post('/smartagent', apiKeyAuthSync, async (req, res) => {

    try {
        
    // Log the incoming request
    logToFileAgent(`Received POST request on /smartagent: ${JSON.stringify(req.body)}`);

	  const data = req.body;
	  storedJsonData = data;
	  jsonArray.push(data);

    let cleanedResponse = ""; // Declare the variable
  
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
            const response = await askModelOpenAI(question); // Using OpenAI's GPT-4
            const LLM_response = response.assistantResponse;
            // Log the assistantResponse
            console.log('LLM_response', LLM_response);
            // Replace special characters and double quotes with spaces
            cleanedResponse = LLM_response.replace(/[^\w\s]+/g, ' ').trim();
            console.log('cleanedResponse', cleanedResponse);

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
      "version": "0.9.2",
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
      "version": "0.9.2",
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
                //tokens: [{ value: "test" }]
                tokens: [{ value: JSON.stringify(cleanedResponse) }]
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
      "version": "0.9.2",
      "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
    },
    conversation: {
      id: ovonConversationId
    },
    sender: {
      from: "https://ovon.xcally.com/smartlibrary"
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
            value: "Hello from Athena, your Smart Library service! Please ask me anything about books and writers. If you prefer, you can also whisper me a valid ISDN number to look-up for a specific book information."
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


console.log("Response:", myJson);
// Convert the JSON object to a string for display or transmission
const jsonString = JSON.stringify(myJson);
console.log("Stringified Response:", jsonString);

// Log the result to the console
//console.log(jsonString);
// Log the response before sending it back
logToFileAgent(`Sent POST response for /smartagent: ${JSON.stringify(myJson)}`);

// Send the jsonString as POST RESPONSE 201 success resource update
res.status(201).send(jsonString);
} catch (error) {
    // Log error to smagent.log
    logToFileAgent(`Error in /smartagent: ${error}`);
    res.status(500).send('Internal Server Error');
}
});

// POST Management END

// Define the route for handling GET requests to '/smartlibrary'
app.get('/smartagent', (req, res) => {
    res.status(404).send('Method Not Allowed');
 // }
});

app.get('/smartlibrary', (req, res) => {
  res.status(404).send('Method Not Allowed');
// }
});

app.get('/smartorder', (req, res) => {
  res.status(404).send('Method Not Allowed');
// }
});

app.get('/smartorderpro', (req, res) => {
  res.status(404).send('Method Not Allowed');
// }
});


// ORDER MNG RAG with OpenAI

function processOpenAIModelResponse(response) {
  // Check if the expected properties exist in the response
  if (response && response.fullResponse && response.assistantResponse) {
      return response.assistantResponse;
  } else {
      console.error("Unexpected response format from OpenAI model:", response);
      return "Error: Unexpected response format from OpenAI model.";
  }
}


async function processOrderInfoRequest(request, useOpenAI = false) {
  const orderData = await readOrderFile();

  if (orderData) {
      const combinedInput = `${request.toString()}\n\n${orderData.toString()}`;

      if (useOpenAI) {
          const response = await askModelOpenAIOrder(combinedInput);
          return processOpenAIModelResponse(response);
      } else {
          const response = await askModel(combinedInput);
          if (response && response.fullResponse) {
              return processModelResponse(response.fullResponse, combinedInput);
          } else {
              console.error("Unexpected response format from Hugging Face model:", response);
              return "Error: Unexpected response format.";
          }
      }
  } else {
      throw new Error('No order data available');
  }
}

app.post('/orderinfopro', apiKeyAuthSync, async (req, res) => {
  try {
      // Log the incoming request
      logMessage(`Received POST request on /orderinfopro: ${JSON.stringify(req.body)}`);

      // Extract the orderToken from the request
      const orderToken = req.body.ovon.events.find(event => event.eventType === "utterance").parameters.dialogEvent.features.text.tokens[0];
      const orderInfoRequestEncoded = orderToken && orderToken.value;

      if (!orderInfoRequestEncoded) {
          throw new Error('Order information not found in the request');
      }

      const orderInfoRequest = decodeURIComponent(orderInfoRequestEncoded);
      logMessage(`Decoded POST request: ${orderInfoRequest}`);

      // Use OpenAI's model for this endpoint
      const orderInfoResponse = await processOrderInfoRequest(orderInfoRequest, true);

      logMessage(`Process Info request: ${orderInfoResponse}`);

      // Construct the response as per your original structure
      const ovonResponse = {
        ovon: {
            schema: {
                version: "0.9.2",
                url: "https://openvoicenetwork.org/schema/dialog-envelope.json"
            },
            conversation: {
                id: req.body.ovon.conversation.id
            },
            sender: {
                from: "https://yourserver.com/orderinfopro"
            },
            responseCode: {
                code: 200,
                description: "OK"
            },
            events: [
                {
                    eventType: "orderInfoResponse",
                    parameters: {
                        dialogEvent: {
                            speakerId: "assistant",
                            span: {
                                startTime: new Date().toISOString()
                            },
                            features: {
                                text: {
                                    mimeType: "text/plain",
                                    tokens: [{ value: orderInfoResponse }]
                                }
                            }
                        }
                    }
                }
            ]
        }
    };    

      logMessage(`Successfully processed request for /orderinfopro: ${JSON.stringify(ovonResponse)}`);
      res.status(200).json(ovonResponse);
  } catch (error) {
      console.error('Error in /orderinfopro:', error);
      res.status(500).send('Internal Server Error');
  }
});


// BANK MNG RAG with OpenAI
  
async function processBankInfoRequest(request, useOpenAI = false) {
  const bankData = await readBankFile();

  if (bankData) {
      const combinedInput = `${request.toString()}\n\n${bankData.toString()}`;

      if (useOpenAI) {
          const response = await askModelOpenAIBank(combinedInput);
          return processOpenAIModelResponse(response);
      } else {
          const response = await askModel(combinedInput);
          if (response && response.fullResponse) {
              return processModelResponse(response.fullResponse, combinedInput);
          } else {
              console.error("Unexpected response format from Hugging Face model:", response);
              return "Error: Unexpected response format.";
          }
      }
  } else {
      throw new Error('No bank data available');
  }
}

app.post('/bankinfopro', apiKeyAuthSync, async (req, res) => {
  try {
      // Log the incoming request
      logMessage(`Received POST request on /bankinfopro: ${JSON.stringify(req.body)}`);

      // Extract the bankToken from the request
      const bankToken = req.body.ovon.events.find(event => event.eventType === "utterance").parameters.dialogEvent.features.text.tokens[0];
      const bankInfoRequestEncoded = bankToken && bankToken.value;

      if (!bankInfoRequestEncoded) {
          throw new Error('Bank information not found in the request');
      }

      const bankInfoRequest = decodeURIComponent(bankInfoRequestEncoded);
      logMessage(`Decoded POST request: ${bankInfoRequest}`);

      // Use OpenAI's model for this endpoint
      const bankInfoResponse = await processBankInfoRequest(bankInfoRequest, true);

      logMessage(`Process Info request: ${bankInfoResponse}`);

      // Construct the response as per your original structure
      const ovonResponse = {
        ovon: {
            schema: {
                version: "0.9.2",
                url: "https://openvoicenetwork.org/schema/dialog-envelope.json"
            },
            conversation: {
                id: req.body.ovon.conversation.id
            },
            sender: {
                from: "https://yourserver.com/bankinfopro"
            },
            responseCode: {
                code: 200,
                description: "OK"
            },
            events: [
                {
                    eventType: "bankInfoResponse",
                    parameters: {
                        dialogEvent: {
                            speakerId: "assistant",
                            span: {
                                startTime: new Date().toISOString()
                            },
                            features: {
                                text: {
                                    mimeType: "text/plain",
                                    tokens: [{ value: bankInfoResponse }]
                                }
                            }
                        }
                    }
                }
            ]
        }
    };    

      logMessage(`Successfully processed request for /bankinfopro: ${JSON.stringify(ovonResponse)}`);
      res.status(200).json(ovonResponse);
  } catch (error) {
      console.error('Error in /bankinfopro:', error);
      res.status(500).send('Internal Server Error');
  }
});


//

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
