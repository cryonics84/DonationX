import {StageState, Group} from "./SharedFunctions";
import {Events} from 'monsterr'

let server;

let currentGroupType = Group.Unknown;

class ClientData {
    constructor(){
        this.cpr = -1;
        this.donatedAmount = -1;
        this.currentState = StageState.Waiting;
        this.group = Group.Unknown;
        this.booth = -1;
    }
}

// The clientDataMap contains all active connections.
// When a client connects they get a new ClientData object,
// that is added to the clientDataMap.

// When they Login/Create CPR they get added to the database (DB).
// When they summit a donation, that user in DB gets updated.

// Map where CPR is key - you can't have a stored user without CPR.
let db = [];

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// Map where clientId is key
let clientDataMap;

export function init(serverInstance){
    console.log('initializing server...');

    server = serverInstance;

    clientDataMap = new Map();
}

function clientConnected(clientId){
    // Create client data and add client to map
    let clientData = new ClientData();
    clientData.currentState = StageState.Login;
    clientDataMap.set(clientId, clientData);
    
    printClientDataMap();
    
    //Set the client to the current stage
    let currentStage = server.getCurrentStage();
    if(currentStage){
        console.log('sending start stage event to client');
        server.send(Events.START_STAGE, server.getCurrentStage().number).toClient(clientId);
        sendClientData(clientId);
    }else{
        console.log('admin has not started stage yet');
    }
}

function clientReconnected(clientId){
    //Set the client to the current stage
    let currentStage = server.getCurrentStage();
    if(currentStage){
        server.send(Events.START_STAGE, server.getCurrentStage().number).toClient(clientId);

        //Update client data
        sendClientData(clientId);
    }

    printClientDataMap();
}

function clientDisconnected(clientId){
    clientDataMap.delete(clientId);
}

function dbCreateAddUser(userData){
    db.set(userData.cpr, userData);
}

function dbRemoveUser(userData){
    db.delete(userData.cpr);
}

function dbGetUserFromClientData(userData){
    return db.get(userData.cpr);
}

function dbGetUserFromCPR(cpr){
    return db.get(cpr);
}

function reset(){
    clientDataMap = new Map();
}

function onUserLogin(clientId, data){
    console.log('Received onUserLogin event from client with ID: ' + clientId);

    // Check if user already exists...
    let existingUser = dbGetUserFromCPR(data.cpr);

    if(existingUser){
        (clientDataMap.set(existingUser));
    }
    else{
        existingUser.currentState = StageState.Waiting;
        dbCreateAddUser(clientDataMap.get(clientId));
    }

    printClientDataMap();
}

function printClientDataMap(){
    console.log('Printing ClientDataMap...\n');

    for (const [key, value] of clientDataMap) {
        console.log('client: ' + key + ' = ' + JSON.stringify(value));
    }
}

function sendClientData(clientId){
    if(clientId){
        let clientData = clientDataMap.get(clientId);
        if(clientData){
            server.send('setClientData', clientData).toClient(clientId);
        }
    }else{
        for (const [key, value] of clientDataMap) {
            server.send('setClientData', value).toAll(key);
        }
    }
}

function onDonation(clientId, data){
    console.log('onDonation() called');

    let clientData = clientDataMap.get(clientId);
    clientData.donatedAmount = Number(data.amount);
    clientData.currentState = StageState.Overview;
    sendClientData(clientId);

    console.log('Making donations arr..')
    // Client needs all current donations
    let donations = [];
    for (const [key, value] of clientDataMap) {
        console.log('Processing clientData: ' + JSON.stringify(value));
        if(value.donatedAmount !== -1){
            donations.push(value.donatedAmount);
        }else{
            console.log('Client has not donated yet...');
        }
    }

    let dataMsg = {
        donations: donations
    };

    console.log('Sending donations to client: ' + donations);
    server.send('setDonations', dataMsg).toClient(clientId);
}

function loadTreatmentGroup2(){

}

export const serverEvents = {

    'onUserLogin': function (server, clientId, data) {
        onUserLogin(clientId, data);
    },

    'onDonation': function (server, clientId, data) {
        onDonation(clientId, data);
    },

    [Events.CLIENT_CONNECTED]: (monsterr, clientId) => {
        console.log(clientId, 'connected! Hello there :-)');

        // Set client state to server stage - this will invoke ClientConnected event on Client
        setTimeout(function(){
            clientConnected(clientId);
        }, 1000);

    },
    [Events.CLIENT_RECONNECTED]: (monsterr, clientId) => {
        console.log(clientId, 'reconnected! Welcome back :-)');

        // Set client state to server stage - this will invoke ClientConnected event on Client
        setTimeout(function(){
            clientReconnected(clientId);
        }, 1000);

    },
    [Events.CLIENT_DISCONNECTED]: (monsterr, clientId) => {
        console.log(clientId, 'disconnected! Bye bye...');
        clientDisconnected(clientId)
    },
    [Events.START_STAGE]: (server, _, ...args) => {
        console.log('Stage started...');
        sendClientData();
    }
};

function saveToDisk(gameDataJSON){
    console.log('Saving JSON data to file...');

    fs.writeFile('saveData.json', gameDataJSON, 'utf8', function(){
        console.log('Finished saving data to file!');
        }
    );

    //netframe.getServer().send('resJSON', gameDataJSON).toAdmin();
}

export const commands = {
    'getConnections': function (server, _, ...args) {
        console.log('getConnections command received. Sending to admin...');
        let msg = {clients: server.getPlayers()};
        server.send('resConnections', msg).toAdmin();
    },
    'reqGameData': function (server, _, ...args) {
        console.log('reqGameData command received on server..');
        sendGameData();
    },
    'start': function (server, _, ...data) {
        console.log('reqGameData command received on server..');
        start(data.users);
    }
};

function start(users){
    for (const user of users){

    }

    switch (user.Group) {
        case Group.Control:
            loadControl1();
            break;
        case Group.Semi:
            loadSemi1();
            break;
        case Group.Full:
            loadFull1();
            break;

        default:
            break;
    }

}

function setGroupType(type){
    currentGroupType = type;
}

function loadStage(clientId, name){
    if(clientId){
        server.send(name, null).toClient(clientId);
    }else{
        server.send(name, null).toAll();
    }

}

function loadControl1(clientId){
    loadStage(clientId, "loadControl1");
}

function loadControl2(clientId){
    loadStage(clientId, "loadControl2");
}

function loadSemi1(clientId){
    loadStage(clientId, "loadSemi1");
}

function loadSemi2(clientId){
    loadStage(clientId, "loadSemi2");
}

function loadFull1(clientId){
    loadStage(clientId, "loadFull1");
}

function loadFull2(clientId){
    loadStage(clientId, "loadFull2");
}
