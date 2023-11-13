const express = require('express');
const bodyParser = require('body-parser');

const app = express();
//app.use(express.json());
app.use(bodyParser.json());

// Set variable convid to the local timestamp
//var timest_id = new Date().getTime();
var timest = new Date().toLocaleString();

// Concatenate "conv_" before the timestamp
//var formattedTimestamp = "conv_" + timest;

// Create an array to store objects
var jsonArray = [];

// Store the received JSON data
let storedJsonData = null;

// app.post START on /welcome endpoint
app.post('/welcome',(req, res) => {
    const data = req.body;

    // Store the received JSON data
    storedJsonData = data;

    // Push the given JSON object into the array
    jsonArray.push(data);
    
 // Log the received POST REQUEST to the console
    console.log('Received JSON data:', data);

 // Log the resulting array to the console
    console.log('Array set to:', jsonArray);

    const ovonConversationId = data.ovon.conversation.id;
	const ovonevent = data.ovon.events;

 // Now ovonConversationId contains the value of ovon.conversation.id
    console.log("ovonConversationId:", ovonConversationId);
	console.log("ovoneventType:", ovonevent);

// Check if data.ovon.events contains the eventType named "whisper"
    const hasWhisperEventType = data.ovon.events.some(event => event.eventType === "whisper");

// Create the JSON object for the POST RESPONSE
// Set myJson based on the condition
myJson = hasWhisperEventType
? {
    // Set your primary structure here

	"ovon": {
		"conversation": {
            "id": ovonConversationId
		},
		"sender": {
			"from": "browser"
		},
		"responseCode": 200,
		"events": [
			{
				"eventType": "utterance",
				"parameters": {
					"dialogEvent": {
						"speakerId": "assistant",
						"span": {
							"startTime": timest
						},
						"features": {
							"text": {
								"mimeType": "text/plain",
								"tokens": [
									{
										"value": "Oscar Wilde is the author of many books!"
									}
								]
							}
						}
					}
				}
			}
		]
	}

  }

: {
	// Set your alternative structure here

	"ovon": {
		"conversation": {
            "id": ovonConversationId
		},
		"sender": {
			"from": "browser"
		},
		"responseCode": 200,
		"events": [
			{
				"eventType": "utterance",
				"parameters": {
					"dialogEvent": {
						"speakerId": "assistant",
						"span": {
							"startTime": timest
						},
						"features": {
							"text": {
								"mimeType": "text/plain",
								"tokens": [
									{
										"value": "Welcome to the OVON EU Authorship Library service! WHISPER me any Author Name please, and I'll recover some book infos for you!"
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
var jsonString = JSON.stringify(myJson);

// Log the result to the console
console.log(jsonString);   

 // Send the jsonString as POST RESPONSE
res.status(201).send(jsonString);

 //   return;
}); 
// app.post END

// Define the route for handling GET requests to '/welcome'
app.get('/welcome', (req, res) => {
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
  

app.listen({port:8080},() => {
    console.log('Server is running');
});
