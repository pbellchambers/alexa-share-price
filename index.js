/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

'use strict';

const Alexa = require('alexa-sdk');
var https = require('https');
var alexa;

const APP_ID = 'amzn1.ask.skill.70498491-196e-40ad-8763-3f77d7a35318';

const languageStrings = {
    'en': {
        translation: {
            SKILL_NAME: 'Share Price',
            GET_SHARE_PRICE_MESSAGE_1: 'The current share price for ',
            GET_SHARE_PRICE_MESSAGE_2: ' is: ',
            GET_INVALID_SHARE_PRICE_MESSAGE: 'Sorry, I couldn\'t get the share price for ',
            HELP_MESSAGE: 'You can say give me the share price for XYZ, or, you can say exit... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            UNHANDLED_MESSAGE: 'Sorry, I didn\t understand your request.',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('AMAZON.HelpIntent');
    },
    'GetSharePriceIntent': function () {
        var stockSymbol = this.event.request.intent.slots.Symbol.value;
        var sharePrice = '';
        var speechOutput = '';
        var sharePriceMessage1 = this.t('GET_SHARE_PRICE_MESSAGE_1');
        var sharePriceMessage2 = this.t('GET_SHARE_PRICE_MESSAGE_2');
        var invalidSharePriceMessage = this.t('GET_INVALID_SHARE_PRICE_MESSAGE');
        var skillName = this.t('SKILL_NAME');
        
        if(stockSymbol != encodeURIComponent(stockSymbol)) {
            speechOutput = invalidSharePriceMessage + stockSymbol;
            console.log('Speech Output: ' + speechOutput);
            alexa.emit(':tellWithCard', speechOutput, stockSymbol + ' ' + skillName, sharePrice);
            
        } else {
            httpGet(stockSymbol, function(response) {
                try {
                    var responseData = JSON.parse(response);
                
                    var lastRefreshed = responseData['Meta Data']['3. Last Refreshed'];
                    console.log('Last Refreshed: ' + lastRefreshed);
                    
                    sharePrice = responseData['Time Series (1min)'][lastRefreshed]['1. open'];
                    console.log('Share Price: ' + sharePrice);
                    
                } catch(err) {
                    console.error('Error parsing json response, likely request did not succeed');
                }
                
                // Create speech output
                if (sharePrice == '') {
                    speechOutput = invalidSharePriceMessage + stockSymbol;
                } else {
                    speechOutput = sharePriceMessage1 + stockSymbol + sharePriceMessage2 + sharePrice;
                }
                console.log('Speech Output: ' + speechOutput);
                
                alexa.emit(':tellWithCard', speechOutput, stockSymbol + ' ' + skillName, sharePrice);
            });
        }
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_REPROMPT');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'Unhandled': function () {
        this.emit(':tell', this.t('UNHANDLED_MESSAGE'));
    },
};

exports.handler = function (event, context, callback) {
    alexa = Alexa.handler(event, context);
    alexa.resources = languageStrings;
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

// Create a web request and handle the response.
function httpGet(query, callback) {
    console.log('Query: ' + query);

    var options = {
        host: 'www.alphavantage.co',
        path: '/query?function=TIME_SERIES_INTRADAY&symbol=LON:' + query + '&interval=1min&apikey=3E1HUGJQ89TUJZIH',
        method: 'GET'
    };

    var req = https.request(options, (res) => {

            var body = '';

    res.on('data', (d) => {
        body += d;
});

    res.on('end', function () {
        callback(body);
    });

});
    req.end();

    req.on('error', (error) => {
        console.error('ERROR: ' + error);
});
}