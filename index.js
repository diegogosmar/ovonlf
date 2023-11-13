const express = require('express');
const bodyParser = require('body-parser');

const app = express();
//app.use(express.json());
app.use(bodyParser.json());

// Set variable convid to the local timestamp
//var convid = new Date().getTime();

// Concatenate "conv_" before the timestamp
//var formattedTimestamp = "conv_" + convid;

// Create an array to store objects
var jsonArray = [];

// Store the received JSON data
let storedJsonData = null;

// app.post START
app.post('/data',(req, res) => {
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

 // Now ovonConversationId contains the value of ovon.conversation.id
    console.log("ovonConversationId:", ovonConversationId);

 // Create the JSON object for the POST RESPONSE
var myJson = {
	"ovon": {
		"conversation": {
//			"id": formattedTimestamp
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
							"startTime": "2023-11-09 15:24:05"
						},
						"features": {
							"text": {
								"mimeType": "text/plain",
								"tokens": [
									{
										"value": "Thanks for the invitation, I am ready to assist!"
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

// Define the route for handling GET requests to '/data'
app.get('/data', (req, res) => {
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
    }
  });
  

app.listen({port:8080},() => {
    console.log('Server is running');
});
