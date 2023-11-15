# Smart Library Service
## A Universal API example using OVON Message Envelopes
=======
#### Open Voice Network, Linux Foundation AI & Data

The purpose of this APIs is to supports some interaction responses via standard POST messages compatible with the OVON Interoperable Conversation Envelope Specification, in order to provide an example of book information agent.

The code is based on node.js and express.

Minimal POST REQUEST example:

To be sent to an endpoint like https://yourcodehostingdomain/smartlibrary

{
  "ovon": {
    "schema": {
      "version": "1.0.1",
      "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
    },
    "conversation": {
      "id": "conv_1699812834779"
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
}

If everything goes smooth, you should receive the following JSON POST RESPONSE:

{"ovon":{"conversation":{"id":"conv_1699812834779"},"sender":{"from":"browser"},"responseCode":200,"events":[{"eventType":"utterance","parameters":{"dialogEvent":{"speakerId":"assistant","span":{"startTime":"2023-11-14T08:53:20.553Z"},"features":{"text":{"mimeType":"text/plain","tokens":[{"value":"Welcome
to the OVON Smart Library service! WHISPER me any valid Book ISBN code please, and I'll recover many book info for
you!"}]}}}}}]}}


Whisper POST REQUEST example to send the ISDN code:

To be sent to an endpoint like https://yourcodehostingdomain/smartlibrary

{
    "ovon": {
      "schema": {
        "version": "1.0.1",
        "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
      },
      "conversation": {
        "id": "conv_1699812834794"
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
                "span": { "startTime": "2023-11-14 02:06:07+00:00" },
                "features": {
                  "text": {
                    "mimeType": "text/plain",
                    "tokens": [ { "ISBN_value": "9781408855652" } ] 
                  }
                }
              }
            }
          }
      ]
    }
  }

If everything goes smooth, you should receive the following JSON POST RESPONSE:

{"ovon":{"conversation":{"id":"conv_1699812834794"},"sender":{"from":"Smart Library
APIs"},"responseCode":200,"events":[{"eventType":"utterance","parameters":{"dialogEvent":{"speakerId":"assistant","span":{"startTime":"2023-11-14T08:53:10.051Z"},"features":{"json":{"mimeType":"application/json","tokens":[{"value":"{\"publishers\":[\"Bloomsbury\"],\"number_of_pages\":342,\"source_records\":[\"amazon:1408855658\",\"bwb:9781408855652\"],\"title\":\"Harry
Potter and the Philosopher's
Stone\",\"identifiers\":{\"wikidata\":[\"Q58242028\"]},\"covers\":[8535565],\"full_title\":\"Harry Potter and the
Philosopher's Stone\",\"publish_date\":\"September 1,
2014\",\"key\":\"/books/OL26843077M\",\"authors\":[{\"key\":\"/authors/OL23919A\"}],\"works\":[{\"key\":\"/works/OL82563W\"}],\"type\":{\"key\":\"/type/edition\"},\"isbn_10\":[\"1408855658\"],\"isbn_13\":[\"9781408855652\"],\"classifications\":{},\"series\":[\"Harry
Potter
#1\"],\"physical_format\":\"Paperback\",\"lc_classifications\":[\"\"],\"latest_revision\":11,\"revision\":11,\"created\":{\"type\":\"/type/datetime\",\"value\":\"2019-04-09T19:21:35.534942\"},\"last_modified\":{\"type\":\"/type/datetime\",\"value\":\"2021-09-13T09:35:04.489973\"}}"}]}}}}}]}}

###Miscellaneus

Setup your self-certificate, to have the node.js code working properly with https:<br>
<br>
cd path/to/your/directory<br>
openssl genpkey -algorithm RSA -out your_key.pem<br>
openssl req -new -key your_key.pem -out your_csr.pem<br>
openssl x509 -req -in your_csr.pem -signkey your_key.pem -out your_cert.pem<br>

node.js important packages to be installed (i.e. on Debian):<br>
<br>
sudo apt update<br>
sudo apt install nodejs<br>
sudo apt install npm<br>
<br>
npm i express<br>
npm install express body-parser<br>
npm install -g pm2<br>
npm install node-fetch@2<br>
npm install cors<br>