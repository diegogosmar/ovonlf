const http = require('http');
const https = require('https');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
//app.use(express.json());
app.use(bodyParser.json());

const fetch = require('node-fetch');

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
	if (req.protocol === 'http') {
	  res.redirect(301, `https://${req.headers.host}${req.url}`);
	} else {
	  next();
	}
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
  
  // app.post START on /smartlibrary endpoint
  app.post('/smartlibrary', async (req, res) => {
	try {
	  const data = req.body;
	  storedJsonData = data;
	  jsonArray.push(data);
  
	  //console.log('Received JSON data:', data);
	  //console.log('Array set to:', jsonArray);
  
	  const ovonConversationId = data.ovon.conversation.id;
	  const ovonevent = data.ovon.events;
  
	  //console.log("ovonConversationId:", ovonConversationId);
	  //console.log("ovoneventType:", ovonevent);
  
	  // Check if data.ovon.events contains the eventType named "whisper"
	  const hasWhisperEventType = data.ovon.events.some(event => event.eventType === "whisper");
  
	  // Fetch data if the condition is met
	  let stringifiedData = "";
	  if (hasWhisperEventType) {
		const isbnToken = data.ovon.events.find(event => event.eventType === "whisper").parameters.dialogEvent.features.text.tokens[0];
		const isbnValue = isbnToken && isbnToken.value;
  
		if (isbnValue) {
		  stringifiedData = await fetchData(isbnValue);
		  //console.log("Stringified Data:", stringifiedData);
		} else {
		  //console.log("ISBN_value not found in the JSON.");
		}
	  }
  
	  // Create the JSON object for the POST RESPONSE
	  const myJson = hasWhisperEventType
		? {
		  ovon: {
			conversation: {
			  id: ovonConversationId
			},
			sender: {
			  from: "Smart Library APIs"
			},
			responseCode: 200,
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
					  json: {
						mimeType: "application/json",
						tokens: [{ value: stringifiedData }]
					  }
					}
				  }
				}
			  }
			]
		  }
		}
		: {
		  ovon: {
			conversation: {
			  id: ovonConversationId
			},
			sender: {
			  from: "browser"
			},
			responseCode: 200,
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
							value: "Welcome to the OVON Smart Library service! I can look up information about books if you provide a valid ISBN number."
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
  
	  // Convert the JSON object to a string for display or transmission
	  const jsonString = JSON.stringify(myJson);
  
	  // Log the result to the console
	  //console.log(jsonString);
  
	  // Send the jsonString as POST RESPONSE
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
  
//Use this in case of certificates not available
//PORT = 8080

//app.listen({port:PORT},() => {
//    console.log('Server is running');
//});

const httpServer = http.createServer(app);
const httpsOptions = {
  key: fs.readFileSync('../certificates/your_key.key'),
  cert: fs.readFileSync('../certificates/your_cert.crt'),
  //Use the following instead, in case of self-certificates
  //key: fs.readFileSync('path/to/your_key.pem'),
  //cert: fs.readFileSync('path/to/your_cert.pem'),
};
const httpsServer = https.createServer(httpsOptions, app);

const HTTP_PORT = 80;
const HTTPS_PORT = 443;

// HTTP server
httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP server running on http://yourdomain:${HTTP_PORT}`);
});

// HTTPS server
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS server running on https://yourdomain:${HTTPS_PORT}`);
});