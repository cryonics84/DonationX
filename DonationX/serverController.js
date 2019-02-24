import {StageState} from "./SharedFunctions";
import {Events} from 'monsterr'

let server;

class ClientData {
    constructor(){
        this.cpr = -1;
        this.donatedAmount = -1;
        this.currentState = StageState.Waiting;
    }
}

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
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

function reset(){
    clientDataMap = new Map();
}

function onUserLogin(clientId, data){
    console.log('Received onUserLogin event from client with ID: ' + clientId);

    clientDataMap.get(clientId).cpr = data.cpr;
    clientDataMap.get(clientId).currentState = StageState.PickAmount;

    printClientDataMap();
}

function printClientDataMap(){
    console.log('Printing ClientDataMap...\n');

    for (const [key, value] of clientDataMap) {
        console.log('client: ' + key + ' = ' + JSON.stringify(value));
    }
}

function sendClientData(clientId){
    let clientData = clientDataMap.get(clientId);
    if(clientData){
        server.send('setClientData', clientData).toClient(clientId);
    }
}

export const serverEvents = {

    'onUserLogin': function (server, clientId, data) {
        onUserLogin(clientId, data);
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

};

export const serverCommands = {
    [Events.START_STAGE]: (server, _, ...args) => {
        console.log('Stage started...');
    },
    'getClients': (server, _, ...args) => {
        console.log('getClients command received...');

        server.send('setClients', 'test').toAdmin();
    }
};