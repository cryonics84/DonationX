import {StageState, Group} from "./SharedFunctions";
import {Events} from 'monsterr'
let fs  = require('fs');

let server;
let currentGroupType = Group.Unknown;
let fullGroupSize = 4;

class ClientData {
    constructor(){
        this.cpr = -1;
        this.donatedAmount = -1;
        this.donatedAmount2 = -1;
        this.currentState = StageState.Login;
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
let db;

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// Map where clientId is key
let clientDataMap;

export function init(serverInstance){
    console.log('initializing server...');

    server = serverInstance;

    clientDataMap = new Map();
    db = new Map();

    loadFromDisk();

    server.start();

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

    sendClientsToAdmin();
}

function clientReconnected(clientId){
    //Set the client to the current stage
    let currentStage = server.getCurrentStage();
    if(currentStage){
        server.send(Events.START_STAGE, server.getCurrentStage().number).toClient(clientId);

        sendClientData(clientId);
    }

    printClientDataMap();
}

function getDonations(clientId){
    console.log('Getting donations from all clients except: ' + clientId + ', with CPR: ' + clientDataMap.get(clientId).cpr);

    let donations = [];
    for (const [key, value] of clientDataMap) {
        console.log('..iterating cpr: ' + value.cpr);
        if(clientId !== key){
            console.log('adding donated amount to arr: ' + value.donatedAmount);
            donations.push(value.donatedAmount);
        }
    }

    console.log('returning donations: ' + donations);
    return donations;
}

function isRdyForFull2(){
    let rdy = true;
    let counter = 0;

    for (const value of clientDataMap.values()) {
        counter++;
        if(value.donatedAmount === -1){
            rdy = false;
        }
    }

    if(counter < fullGroupSize) return false;

    return rdy;
}

function clientDisconnected(clientId){
    clientDataMap.delete(clientId);

    sendClientsToAdmin();
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

function sendServerState(){
    server.send('updateServerState', {serverState: currentGroupType}).toAdmin();
}

function sendDbCount(){
    server.send('updateDbCount', {dbCount: db.size}).toAdmin();
}

function reset(){
    console.log('Resetting..');

    for(let clientId of clientDataMap.keys()){
        console.log('Resetting clientId: ' + clientId);
        clientDataMap.set(clientId, new ClientData());

    }

    currentGroupType = Group.Unknown;

}

function onUserLogin(clientId, data){
    console.log('Received onUserLogin event from client with ID: ' + clientId);

    // Check if user already exists...
    console.log('Checking if user exists in DB...');
    let existingUser = dbGetUserFromCPR(data.cpr);

    if(existingUser){
        console.log('user found');
        existingUser.group = currentGroupType;
        existingUser.booth = data.booth;
        clientDataMap.set(clientId, existingUser);
    }
    else{
        console.log('user not found');
        let clientData = clientDataMap.get(clientId);
        if(currentGroupType === Group.Unknown){
            clientData.currentState = StageState.Waiting1;
        }else{
            clientData.currentState = StageState.Pass1;
            clientData.group = currentGroupType;
        }

        clientData.cpr = data.cpr;
        clientData.booth = data.booth;

        dbCreateAddUser(clientData);

        //Update admin db count
        sendDbCount();
    }

    
    printClientDataMap();
    printDb();

    //loadClientGroup(clientId);
    sendClientData(clientId);


}

function printClientDataMap(){
    console.log('Printing ClientDataMap...\n');

    for (const [key, value] of clientDataMap) {
        console.log('client: ' + key + ' = ' + JSON.stringify(value));
    }
}

function printDb(){
    console.log('\nPrinting Db...\n');

    for (const [key, value] of db) {
        console.log('client: ' + key + ' = ' + JSON.stringify(value));
    }
}

function sendClientData(clientId){


    if(clientId){
        console.log('Sending Client Data to ' + clientId);
        let data = {
            clientData : clientDataMap.get(clientId)
        };

        if(currentGroupType === Group.Full && isRdyForFull2()){
            if(data.clientData.currentState === StageState.Pass2){
                data["donations"] = getDonations(clientId);
            }
        }

        server.send('setClientData', data).toClient(clientId);
    }else{

        console.log('Sending clientData to all clients... size: ' + clientDataMap.size);
        for(let [clientId, clientData] of clientDataMap.entries()){
            console.log('Iterating clientId: ' + clientId);

            let data = {
                clientData : clientData
            };

            if(currentGroupType === Group.Full && isRdyForFull2()){
                if(data.clientData.currentState === StageState.Pass2){
                    data["donations"] = getDonations(clientId);
                }
            }

            console.log('Sending Client Data ' + JSON.stringify(data) + '\n, to Client' + clientId);
            server.send('setClientData', data).toClient(clientId);
        }
    }

    sendClientsToAdmin();
}

function onNextState(clientId, data){
    let clientData = clientDataMap.get(clientId);

    switch (clientData.currentState) {
        case StageState.Waiting1:
            clientData.currentState = StageState.Pass1;
            break;
        case StageState.Waiting2:
            if(currentGroupType === Group.Full){
                if(isRdyForFull2()){
                    nudgeClientsWaiting2();
                }else{
                    clientData.currentState = StageState.Waiting2;
                }

            }else{
                clientData.currentState = StageState.Pass2;
            }
            break;
        case StageState.Login:
            onUserLogin(clientId, data);
            break;
        case StageState.Pass1:
            clientData.currentState = StageState.AfterPass1;
            onDonation(clientId, data);
            break;
        case StageState.AfterPass1:
            clientData.currentState = StageState.BeforePass2;
            break;
        case StageState.BeforePass2:
            if(currentGroupType === Group.Full){
                if(isRdyForFull2()){
                    nudgeClientsWaiting2();
                }else{
                    clientData.currentState = StageState.Waiting2;
                }

            }else{
                clientData.currentState = StageState.Pass2;
            }
            break;
        case StageState.Pass2:
            clientData.currentState = StageState.AfterPass2;

            onDonation2(clientId, data);
            break;
        case StageState.AfterPass2:
            break;
        case StageState.Intro:
            break;
    }



    sendClientData(clientId);

    if(clientData.currentState === StageState.AfterPass1){
        //Make it so that when the user has closed window after pass 1,
        // and reopens it after survey they will be in "Before Pass 2"
        clientData.currentState = StageState.BeforePass2;
    }

    saveToDisk();
}

function startServer(groupType, groupSize){
    console.log('Starting Server with groupType: ' + groupType + ', groupSize: ' + groupSize);
    currentGroupType = groupType;
    fullGroupSize = Number(groupSize);
    sendServerState();

    nudgeClientsWaiting1();
}

function nudgeClientsWaiting1(){
    console.log('Sending clients in waiting 1 state to next state...');
    for(const [clientId, clientData] of clientDataMap){
        if(clientData.currentState === StageState.Waiting1){
            clientData.group = currentGroupType;
            onNextState(clientId);
        }
    }
}

function nudgeClientsWaiting2(){
    console.log('Sending clients in waiting 2 state to next state...');
    for(const [clientId, clientData] of clientDataMap){
        clientData.currentState = StageState.Pass2;
        sendClientData(clientId);
    }
}

function stopServer(){
    reset();

    sendClientData();
    sendServerState();
}

function onDonation(clientId, data){
    console.log('onDonation() called');

    let clientData = clientDataMap.get(clientId);
    clientData.donatedAmount = Number(data.amount);

/*
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
    server.send('setDonations', dataMsg).toClient(clientId);*/
}


function onDonation2(clientId, data){
    console.log('onDonation() called');

    let clientData = clientDataMap.get(clientId);
    clientData.donatedAmount2 = Number(data.amount);

    /*
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
        server.send('setDonations', dataMsg).toClient(clientId);*/
}

export const serverEvents = {
    'onNextState': function (server, clientId, data) {
        onNextState(clientId, data);
    },

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

function loadFromDisk(){
    console.log('Loading JSON data from storage...');

    let data = fs.readFileSync('saveData.json', 'utf8');

    if(data){

        console.log('Loaded data: ' + data);
        console.log('Parsing...');

        let parsedData = JSON.parse(data);
        console.log('Parsed data: ' + JSON.stringify(data));

        if(!parsedData) return;

        for(const client of parsedData["users"]){

            console.log("Logging key value pairs of client...");
            for (let k in client) {
                console.log('key: ' + k + ', value: ' + client[k]);
            }

            console.log('Iterating user: ' + JSON.stringify(client));
            if(!client["cpr"]){
                console.log('CPR not found!');
            }else{
                db.set(client["cpr"], client);
            }

        }

        console.log('Added ' + parsedData.users.length + ' to db');

        printDb();

    }else{
        console.log('Something went wrong loading from storage...');
    }

}

function saveToDisk(){

    //let users = JSON.stringify(Array.from(db.values()));

    let users = Array.from(db.values());

    console.log('Saving users in DB to disk' + JSON.stringify(users));

    let data = {users: users};

    console.log('Saving JSON data to file...' + JSON.stringify(data));

    fs.writeFile('saveData.json', JSON.stringify(data), 'utf8', function(){
        console.log('Finished saving data to file!');
        }
    );

    //netframe.getServer().send('resJSON', gameDataJSON).toAdmin();
}

function clearDB(){
    db.clear();
    saveToDisk();
    sendDbCount();
}

function sendDbData(){
    console.log('sending db data to admin...');
    let data = JSON.stringify( Array.from(db.values()), dbDownloadReplacer);
    server.send('sendDbData', {clientData: data}).toAdmin();
}

export const serverCommands = {
    [Events.START_STAGE]: (server, _, ...args) => {
        console.log('Stage started...');
        sendClientData();
    },
    'getClients': (server, _, ...args) => {
        console.log('getClients command received...');

        sendClientsToAdmin();
    },
    'startServer': function (server, _, ...data) {
        console.log('startServer command received on server with data: [' + data[0] + ', ' + data[1] +']');
        startServer(data[0], data[1]); //groupType
    },

    'stopServer': function (server, _, ...data) {
        console.log('stopServer command received on server..');
        stopServer();
    },

    'updateServerStatus': function (server, _, ...data) {
        sendServerState();
    },
    'getDbCount': function (server, _, ...data) {
        sendDbCount();
    },
    'clearDB': function (server, _, ...data) {
        clearDB();
    },
    'downloadData': function (server, _, ...data) {
        sendDbData();
    },
};

function sendClientsToAdmin(){
    server.send('setClients', {clients: Array.from( clientDataMap.values() )}).toAdmin();
}

function dbDownloadReplacer(key,value)
{
    if (key==="currentState") return undefined;
    else if (key==="group") return Group.getGroupName(value);
    else return value;
}