import {HTMLStates} from "./HTMLStates";
import {StageState} from "../../../SharedFunctions";
//import logoImg from './images/Transcend-Running-Academy-Donation.png';
//import backgroundImg from './images/backgrounds-blank-blue-953214.jpg';

let client;
//let currentState = StageState.Login;

let logo;

export function init(clientInstance){
    client = clientInstance;

    //No need to change state as we will receive it from the server
    changeState(StageState.Login);

}

/*
function createImage(sourceImg){
    let img = document.createElement('img');
    img.style = {
        height: '80%'
    };

    img.src = logoImg.default;

    return img;
}
*/
function GetHTMLFromState(state){
    switch (state) {
        case StageState.Login:
            console.log('returning login html');
            return HTMLStates.stateLogin;
        case StageState.PickAmount:
            console.log('returning pick-amount html');
            return HTMLStates.statePickAmount;
        default:
            return HTMLStates.stateLogin;
    }
}

function changeState(state){
    insertHTML(GetHTMLFromState(state));

    switch (state) {
        case StageState.Waiting:
            //This should never be triggered...
            break;
        case StageState.Login:
            initStateLogin();
            break;
        case StageState.PickAmount:
            initStatePickAmount();
            break;
        default:
            console.log("Something went wrong...");
            break;
    }
}

function initStateLogin(){
    console.log("loading login state");

    let summitButton = document.getElementById("userButton");
    summitButton.onclick = (function(){
        onSummitCPR();
    });

    /*
    let logoElement = document.getElementById("logo");
    if(logoElement){
        console.log('Appending logo image to element: ' + logoElement);
        logoElement.appendChild(createImage(logoImg));
    }else{
        console.log('Failed to locate logo element');
    }*/
}

function initStatePickAmount(){
    console.log("loading pick-amount state");
}

function onSummitCPR(){
    console.log('Submitting data');

    let form = document.getElementById("userForm");
    console.log('Form Values: ' + form.elements);
    let cpr = form.fCpr.value;

    let data = {cpr: cpr};

    console.log('Sending User Data: ' + JSON.stringify(data));
    client.send('onUserLogin', data);

    changeState(StageState.PickAmount);
}

function insertHTML(html) {
    //console.log('loading html: ' + JSON.stringify(html));
    document.getElementById("content").innerHTML = (html);
}

function setClientData(clientData){
    changeState(clientData.currentState);

    switch (clientData.currentState) {
        case StageState.Waiting:
            //This should never be triggered...
            break;
        case StageState.Login:

            break;
        case StageState.PickAmount:
            document.getElementById("fAmount").value = clientData.donatedAmount;
            break;
        default:
            console.log("Something went wrong...");
            break;
    }
}

export const clientEvents = {
    'setClientData': function (clientId, data) {
        setClientData(data)
    }
};
