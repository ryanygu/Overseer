'use strict';

const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const App = require('actions-on-google').DialogflowApp; // Google Assistant helper library
const firebase = require('firebase-admin');

//Arguments
const ACTIVITY_TYPE_ARGUMENT = 'activity_type';
const ACTIVITY_NAME_ARGUMENT = 'activity_name';
const USER_INFO_ARGUMENT = 'user_info';
const TIME_PERIOD_ARGUMENT = 'time_period';

//Actions
const END_STUDY_SESSION_ACTION = 'endStudySession';
const WELCOME_ACTION = 'welcome';

const ONE_STEP_START_BREAK_ACTION = 'oneStepStartBreak';
const TWO_STEP_START_BREAK_ACTION = 'twoStepStartBreak';

const ONE_STEP_START_STUDY_ACTION = 'oneStepStartStudy';
const TWO_STEP_START_STUDY_ACTION = 'twoStepStartStudy';

const ONE_STEP_START_EFFICIENCY_ACTION = 'oneStepStartEfficiency';
const TWO_STEP_START_EFFICIENCY_ACTION = 'twoStepStartEfficiency';

const ONE_STEP_START_STATS_ACTION = 'oneStepStartStats';
const TWO_STEP_START_STATS_ACTION = 'twoStepStartStats';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const app = new App({request, response})
    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));

    function addStudyActivity(app) {
        let type = 'study';
        let name = app.getArgument(ACTIVITY_NAME_ARGUMENT);
        // TODO: code here
        // Add info to database
        // app.tell(type + ", "+name);
        start_now(name);
        app.ask('Okay, got it. Happy studying!'); //TODO: randomize this
    }

    function addBreakActivity(app) {
        let type = 'break';
        let name = app.getArgument(ACTIVITY_NAME_ARGUMENT);
        // TODO: code here
        // Add info to database
        start_now(name);
        app.ask('Sounds good. Enjoy your break!'); //TODO: randomize this
    }

    function endStudySession(app) {
        // TODO: code here
        // add info to database
        var ref = firebase.database().ref('admin');

        ref.once("value", function(snapshot) {
           stop_activity(snapshot.val().active);
        });
        app.ask('That was a good study session! Come back soon!');
    }

    function getGreeting(app) {
        //TODO: code here
        //TODO: randomize this intro
        app.ask('Hi, you can call me Overseer! Are you going to start studying, take a break, or end your study session? Or maybe you want to view your statistics or efficiency?');
    }

    function getStats(app) {
        let userInfo = 'stats';
        let timePeriod = app.getArgument(TIME_PERIOD_ARGUMENT);
        // get_logs();
        app.ask('(Mock data) You spent 25% (1h) of your time on csc209, and 75% (3h) of your time on YouTube.'); //TODO: get real data
    }

    function getEfficiency(app) {
        let userInfo = 'efficiency';
        let timePeriod = app.getArgument(TIME_PERIOD_ARGUMENT);
        app.ask('(Mock data) You were 43% efficient today!'); //TODO: get real data
    }

    let actionMap = new Map();

    actionMap.set(ONE_STEP_START_BREAK_ACTION, addBreakActivity);
    actionMap.set(TWO_STEP_START_BREAK_ACTION, addBreakActivity);

    actionMap.set(ONE_STEP_START_STUDY_ACTION, addStudyActivity);
    actionMap.set(TWO_STEP_START_STUDY_ACTION, addStudyActivity);

    actionMap.set(ONE_STEP_START_EFFICIENCY_ACTION, getEfficiency);
    actionMap.set(TWO_STEP_START_EFFICIENCY_ACTION, getEfficiency);

    actionMap.set(ONE_STEP_START_STATS_ACTION, getStats);
    actionMap.set(TWO_STEP_START_STATS_ACTION, getStats);

    actionMap.set(END_STUDY_SESSION_ACTION, endStudySession);
    actionMap.set(WELCOME_ACTION, getGreeting);

app.handleRequest(actionMap);
});

firebase.initializeApp(functions.config().firebase);

//START ACTIVITY
function start_now(activity){
    firebase.database().ref("admin").once("value", function(snapshot){
      if(activity != snapshot.val().active){
        stop_activity(snapshot.val().active);
        console.log("STOP PREVIOUS ACTIVITY");
      }
    });
    firebase.database().ref().once('value', function(snapshot) {
    if (!snapshot.hasChild(activity)) {
  console.log("s");
      writeUserData(activity);
      console.log("DOESNT HAVE CHILD SO MAKENEW DAYA");
    }
    start_activity(activity);
    active_action(activity, true);
    console.log("START ACTIVITY");
  });
}

function active_action(activity, option){
  console.log("---active_action---");
  if(option){
    console.log("NEW ACTIVEACTIVITY");
    firebase.database().ref("admin").update({active:activity});
  }else{
    console.log("THERE ARE NO ACTIVE ACTIVITIES");
    firebase.database().ref("admin").update({active:""});
  }
}

//TRIGGER ACTIVE
function start_activity(activity){
  console.log("STARTED ACTIVITY");
  firebase.database().ref(activity).update({
      active: true,
      start: getTime()
  });
}

//MAKE NEW USER
function writeUserData(activity) {
  firebase.database().ref(activity).set({
    activity: activity,
    total : 0,
    active : false,
    start : 0
  });
  console.log("TESTHING______------");
}

// function get_logs(){
//   var ref = firebase.database().ref();
//     ref.once('value', function(snapshot) {
//     var messsage = 'You did ';
//     console.log(message);
//     snapshot.forEach(function(childSnapshot) {
//     if(childSnapshot.val().activity!= undefined){
//         console.log(childSnapshot.val().activity);
//         message = message + childSnapshot.val().activity + ' for total of ' +childSnapshot.val().total +'hours, ';
//     }
//     message = message.substring(0, message.length - 7);
//
//       });
//   console.log(message);
//   app.ask(message);
//     });
// }

function stop_activity(activityName) {
    var ref = firebase.database().ref(activityName);
    ref.once("value", function(snapshot) {
        //var temp = Number(snapshot.val().total) + Number((getTime() - snapshot.val().start));
//         console.log(temp);
        var a = (Number(snapshot.val().total) + Number((getTime() - snapshot.val().start))).toFixed(2);
        ref.update({
            total: a,
            active: false,
            start: 0
        });
    });
  active_action("", false);
}

function getTime() {
    var hours = new Date();
    var min = new Date();
    var current_minute = min.getMinutes();
    var current_hour = hours.getHours();
    if (current_hour < 5) {
        current_hour = 24 - (5 - current_hour);
        return Number(current_hour + (current_minute/100));
    }
    else {
        return Number((current_hour - 5) + (current_minute/100));
    }
}
