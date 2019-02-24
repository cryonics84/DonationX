import { StageState } from '../../../SharedFunctions';
import { HTMLStates, getHTMLFromStateGroup } from "./HTMLStates";
// import logoImg from './images/Transcend-Running-Academy-Donation.png';
// import backgroundImg from './images/backgrounds-blank-blue-953214.jpg';

let client;
//let currentState = StageState.Login;

let logo;

export function init(clientInstance) {
	client = clientInstance;

	// No need to change state as we will receive it from the server
	//changeState(StageState.Login);

}
/*
function GetHTMLFromState(state) {
	switch (state) {
		case StageState.Login:
			console.log('returning login html');
			return HTMLStates.stateLogin;
		case StageState.Pass1:
			console.log('returning pick-amount html');
			return HTMLStates.statePickAmount;
		case StageState.Overview:
            console.log('returning overview html');
            return HTMLStates.stateOverview;
		default:
			return HTMLStates.stateLogin;
	}
}
*/

function changeState(state, group) {
	insertHTML(getHTMLFromStateGroup(state,group));

	switch (state) {
		case StageState.Waiting:
			//This should never be triggered...
			break;
		case StageState.Login:
			initStateLogin();
			break;
		case StageState.Pass1:
			initStatePass1();
			break;
		case StageState.Pass2:
            initStatePass2();
            break;
		default:
			console.log("Something went wrong...");
			break;
	}
}

function initStateLogin() {
	console.log("loading login state");

	let summitButton = document.getElementById("userButton");
	summitButton.onclick = (function () {
		onSummitCPR();
	});

}

function initStatePass1() {
	console.log("loading Pass1");

    let amountText = document.getElementById("amountContainer");
    let amountSlider = document.getElementById("amountSlider");
    amountText.innerHTML = amountSlider.value;

    // Update the current slider value (each time you drag the slider handle)
    amountSlider.oninput = function() {
        amountText.innerHTML = this.value;
    }

    let donateBtn = document.getElementById("donateButton");
    donateBtn.onclick = (function () {
        onDonate();
    });
}

function onDonate(){
    let amountSlider = document.getElementById("amountSlider");

	let data = { amount: amountSlider.value };

    console.log('Sending User Data: ' + JSON.stringify(data));
    client.send('onDonation', data);

    //changeState(StageState.Overview);
}

function initStatePass2(){
    console.log("loading overview state");

    let cancelBtn = document.getElementById("cancelButton");
    cancelBtn.onclick = (function () {
        onCancelDonation();
    });

    let summitBtn = document.getElementById("commitButton");
    summitBtn.onclick = (function () {
        onCommitDonation();
    });
}

function onCommitDonation(){

}

function onCancelDonation(){
	//changeState(StageState.PickAmount);
}


function onSummitCPR() {
	console.log('Submitting data');

	let form = document.getElementById("userForm");
	console.log('Form Values: ' + form.elements);
	let cpr = form.fCpr.value;

	let data = { cpr: cpr };

	console.log('Sending User Data: ' + JSON.stringify(data));
	client.send('onUserLogin', data);

	//changeState(StageState.PickAmount);
}

function insertHTML(html) {
	
	console.log('loading html: ' + JSON.stringify(html));
	document.getElementById("header").innerHTML = (HTMLStates.header);
	document.getElementById("content").innerHTML = (html);
}

function setClientData(clientData) {
	changeState(clientData.currentState, clientData.group);

	switch (clientData.currentState) {
		case StageState.Waiting:
			//This should never be triggered...
			break;
		case StageState.Login:

			break;
		case StageState.Pass1:
			document.getElementById("amountSlider").value = clientData.donatedAmount;
			break;
		case StageState.Pass2:
			break;
		default:
			console.log("Something went wrong...");
			break;
	}
}

function setDonations(donations){
    console.log("settings overview table");

    let tableRef = document.getElementById('donationTable').getElementsByTagName('tbody')[0];
    // Insert a row in the table at the last row

    console.log('iterating donations... ' + donations);
    for (let i = 0; i < donations.length; i++) {
        console.log('i = ' + i + ', item = ' + donations[i]);
        let newRow   = tableRef.insertRow(tableRef.rows.length);
        var newCell = newRow.insertCell(0);

        // Append a text node to the cell
        let newText  = document.createTextNode(donations[i]);
        newCell.appendChild(newText);
        //newCell.setAttribute("class", "w3-center");

/*
        // Insert a cell in the row at index 0
        let newCell  = newRow.insertCell(0);

        // Append a text node to the cell
        let newText  = document.createTextNode(donations[i]);
        newCell.appendChild(newText);*/
	}
}

export const clientEvents = {
	'setClientData': function (clientId, data) {
		setClientData(data)
	},
    'setDonations': function (clientId, data) {
        setDonations(data.donations)
    },



};
