'use strict';

const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const App = require('actions-on-google').DialogflowApp; // Google Assistant helper library

const ACTIVITY_TYPE_ARGUMENT = 'activity_type';
const ACTIVITY_NAME_ARGUMENT = 'activity_name';
const ADD_ACTIVITY_ACTION = 'add_activity';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const app = new App({request, response})
    console.log('Request headers: ' + JSON.stringify(request.headers));
console.log('Request body: ' + JSON.stringify(request.body));

function addActivity(app) {
    let activity_type = app.getArgument(ACTIVITY_TYPE_ARGUMENT);
    let activity_name = app.getArgument(ACTIVITY_NAME_ARGUMENT);
    app.tell('The activity type is ' + activity_type +
        ', and the activity name is ' + activity_name + '.');
}

let actionMap = new Map();
actionMap.set(ADD_ACTIVITY_ACTION, addActivity);

app.handleRequest(actionMap);
});