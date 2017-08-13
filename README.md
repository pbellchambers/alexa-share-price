# alexa-share-price

A skill for Amazon Alexa that looks up the current share price for a given stock symbol.

## Requires
- NodeJS 6.10+

## Current Limitations
- Only works for London Stock Exchange shares
- Only works for stock symbols, can't lookup by full name

## Local Testing
Events can be tested locally using the sample event json and lambda-local:

```
lambda-local -l index.js -e event-samples/successful/successful.json
```