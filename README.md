# Smart Library Service
## A Universal API example using OVON Message Envelopes
=======
#### Open Voice Network, Linux Foundation AI & Data

The purpose of this APIs is to supports some interaction responses via standard POST messages compatible with the OVON Interoperable Conversation Envelope Specification, in order to provide an example of interoperability agents.

The code is based on node.js and express.

## Endpoints:
/smartlibrary --> Agent using basic LLM to provide information about Books<br>
/orderinfo --> Agent using basic LLM to provide information about a specific Order (RAG example)<br>
/orderinfopro --> Agent using advanced LLM to provide information about a specific Order (RAG example) - API Key required<br>
/smartagent --> Agent using advanced LLM for general purpose information - API Key required<br>

The following examples are related to the smartlibrary endpoint (same POST request can be applied with the other endpoints)<br><br>

## Minimal POST REQUEST example (INVITE):

To be sent to an endpoint like https://yourcodehostingdomain/smartlibrary<br>

{
  "ovon": {
    "schema": {
      "version": "0.9.0",
      "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
    },
    "conversation": {
      "id": "conv_1700231272268"
    },
    "sender": {
      "from": "https://organization_url_from",
      "reply-to": "https://organization_url_to"
    },
    "responseCode": {
                  "code": 200,
                  "description": "OK everything fine"
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
}
<br>
If everything goes smooth, you should receive the following JSON POST RESPONSE:
<br>
{"ovon":{"schema":{"version":"0.9.0","url":"https://openvoicenetwork.org/schema/dialog-envelope.json"},"conversation":{"id":"conv_1700231272268"},"sender":{"from":"https://ovon.xcally.com"},"responseCode":{"code":200,"description":"OK"},"events":[{"eventType":"utterance","parameters":{"dialogEvent":{"speakerId":"assistant","span":{"startTime":"2024-01-19T15:03:21.107Z"},"features":{"text":{"mimeType":"text/plain","tokens":[{"value":"Welcome
to the OVON Smart Library service! I can look up information about books if you provide a valid ISBN number with a
Whisper. If you prefer, you can also send me a Natural Language utterance and I'll reply you!"}]}}}}}]}}


## WHISPER POST REQUEST example to send the ISDN code:<br>
<br>
To be sent to an endpoint like https://yourcodehostingdomain/smartlibrary
<br>
{
    "ovon": {
      "schema": {
        "version": "0.9.0",
        "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
      },
      "conversation": {
        "id": "conv_1699812834794"
      },
      "sender": {
        "from": "https://organization_url_from",
        "reply-to": "https://organization_url_to"
      },
      "responseCode": {
                  "code": 200,
                  "description": "OK everything fine"
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
                "span": { "startTime": "2023-11-14 02:06:07+00:00" },
                "features": {
                  "text": {
                    "mimeType": "text/plain",
                    "tokens": [ { "value": "978-0099908401" } ] 
                  }
                }
              }
            }
          }
      ]
    }
  }
<br>
If everything goes smooth, you should receive the following JSON POST RESPONSE:<br>

{"ovon":{"schema":{"version":"0.9.0","url":"https://openvoicenetwork.org/schema/dialog-envelope.json"},"conversation":{"id":"conv_1699812834794"},"sender":{"from":"Smart
Library
APIs"},"responseCode":{"code":200,"description":"OK"},"events":[{"eventType":"utterance","parameters":{"dialogEvent":{"speakerId":"assistant","span":{"startTime":"2024-01-19T14:25:51.715Z"},"features":{"text":{"mimeType":"text/plain","tokens":[{"value":"{\"publishers\":[\"Arrow
Books\"],\"source_records\":[\"bwb:9780099908401\"],\"title\":\"The Old Man and the
Sea\",\"number_of_pages\":112,\"languages\":[{\"key\":\"/languages/eng\"}],\"full_title\":\"Old Man and the
Sea\",\"publish_date\":\"1993\",\"key\":\"/books/OL28426328M\",\"authors\":[{\"key\":\"/authors/OL13640A\"}],\"works\":[{\"key\":\"/works/OL63073W\"}],\"type\":{\"key\":\"/type/edition\"},\"subjects\":[\"American
fiction (fictional works by one author)\",\"Cuba,
fiction\"],\"covers\":[12840558],\"identifiers\":{},\"classifications\":{},\"physical_dimensions\":\"17.75 x 11 x 0.8
centimeters\",\"first_sentence\":\"He was an old man who fished alone in a skiff in the Gulf Stream and he had gone
eighty-four days now without taking a fish.\",\"series\":[\"Ernest Hemingway in Arrow\"],\"publish_places\":[\"London,
United Kingdom\"],\"contributors\":[{\"name\":\"Brian
Grimwood\",\"role\":\"Illustrator\"}],\"notes\":{\"type\":\"/type/text\",\"value\":\"An Arrow Classic\\r\\nFirst
published in the United Kingdom by Jonathan Cape Ltd,
1952\"},\"physical_format\":\"Paperback\",\"copyright_date\":\"1952\",\"description\":\"Set in the Gulf Stream off the
coast of Havana, Hemingway's magnificent fable is the story of an old man, a young boy and a giant fish. It was The Old
Man and the Sea that won for Hemingway the Nobel Prize for Literature. Here, in a perfectly crafted story, is a unique
and timeless vision of the beauty and grief of man's challenge to the elements in which he
lives.\",\"isbn_10\":[\"0099908409\"],\"isbn_13\":[\"9780099908401\"],\"oclc_numbers\":[\"920159329\",\"491363695\"],\"lc_classifications\":[\"PS3515.E37\"],\"latest_revision\":6,\"revision\":6,\"created\":{\"type\":\"/type/datetime\",\"value\":\"2020-07-31T22:05:17.964211\"},\"last_modified\":{\"type\":\"/type/datetime\",\"value\":\"2023-09-12T17:35:02.955359\"}}"}]}}}}}]}}
<br><br>
The following two options require proper Hugging Face API Key:
<br><br>

## UTTERANCE POST REQUEST example to send the ISDN code:<br>

<br>
To be sent to an endpoint like https://yourcodehostingdomain/smartlibrary<br>
<br>
{
    "ovon": {
      "schema": {
        "version": "0.9.0",
        "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
      },
      "conversation": {
        "id": "conv_1699812834794"
      },
      "sender": {
        "from": "https://organization_url_from",
        "reply-to": "https://organization_url_to"
      },
      "responseCode": {
                  "code": 200,
                  "description": "OK everything fine"
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
                "span": { "startTime": "2023-11-14 02:06:07+00:00" },
                "features": {
                  "text": {
                    "mimeType": "text/plain",
                    "tokens": [ { "value": "I'd like to know your wrote Harry Potter" } ] 
                  }
                }
              }
            }
          }
      ]
    }
  }
  <br>
If everything goes smooth, you should receive the following JSON POST RESPONSE:<br>

{"ovon":{"schema":{"version":"0.9.0","url":"https://openvoicenetwork.org/schema/dialog-envelope.json"},"conversation":{"id":"conv_1699812834794"},"sender":{"from":"Smart
Library
APIs"},"responseCode":{"code":200,"description":"OK"},"events":[{"eventType":"utterance","parameters":{"dialogEvent":{"speakerId":"assistant","span":{"startTime":"2024-01-19T14:59:59.639Z"},"features":{"text":{"mimeType":"text/plain","tokens":[{"value":"\"Absolutely!
\\\"Harry Potter and the Philosopher's Stone\\\" is the first book in the beloved Harry Potter series, written by J.K.
Rowling. It was originally published in 1997 and has since become a worldwide phenomenon, with over 120 million copies
sold. The book follows the story of Harry Potter, an or\""}]}}}}}]}}
<br>
<br>

## UTTERANCE + WHISPER POST REQUEST example to send the ISDN code:<br>

<br>
To be sent to an endpoint like https://yourcodehostingdomain/smartlibrary<br>
<br>
{
    "ovon": {
      "schema": {
        "version": "0.9.0",
        "url": "https://openvoicenetwork.org/schema/dialog-envelope.json"
      },
      "conversation": {
        "id": "conv_1699812834794"
      },
      "sender": {
        "from": "https://organization_url_from",
        "reply-to": "https://organization_url_to"
      },
      "responseCode": {
                  "code": 200,
                  "description": "OK everything fine"
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
                "span": { "startTime": "2023-11-14 02:06:07+00:00" },
                "features": {
                  "text": {
                    "mimeType": "text/plain",
                    "tokens": [ { "value": "harry potter" } ] 
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
                "span": { "startTime": "2023-11-14 02:06:07+00:00" },
                "features": {
                  "text": {
                    "mimeType": "text/plain",
                    "tokens": [ { "value": "2nd book" } ] 
                  }
                }
              }
            }
          }
      ]
    }
  }
    <br>
If everything goes smooth, you should receive the following JSON POST RESPONSE:<br><br>

{{"ovon":{"schema":{"version":"0.9.0","url":"https://openvoicenetwork.org/schema/dialog-envelope.json"},"conversation":{"id":"conv_1699812834794"},"sender":{"from":"Smart
Library
APIs"},"responseCode":{"code":200,"description":"OK"},"events":[{"eventType":"utterance","parameters":{"dialogEvent":{"speakerId":"assistant","span":{"startTime":"2024-01-19T15:03:35.654Z"},"features":{"text":{"mimeType":"text/plain","tokens":[{"value":"\"Absolutely!
J.K. Rowling, whose full name is Joanne Rowling, is a British author, philanthropist, film producer, television
producer, and television writer. She rose to fame in the late 1990s as the author of the Harry Potter fantasy series,
which has sold over 500 million copies worldwide, making\""}]}}}}}]}}

## Usage

pm2 start server443index.js<br>

## Miscellaneus
<br>

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
npm install openai<br>

