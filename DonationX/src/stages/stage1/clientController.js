import { StageState, Group } from '../../../SharedFunctions';
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


function initStateBeforePass2(){
    console.log("loading after pass 1");

    let nextButton = document.getElementById("nextButton");
    nextButton.onclick = (function () {
        getNextState({});
    });
}

function initStateLogin() {
	console.log("loading login state");

	let summitButton = document.getElementById("userButton");
	summitButton.onclick = (function () {
		onSummitCPR();
	});

}


function initStatePass1(data) {
    console.log("loading Pass1 control");

    let amountText = document.getElementById("amountContainer");
    let amountSlider = document.getElementById("amountSlider");

    if(!amountSlider) console.log('Could not find slider!');

    amountText.innerHTML = amountSlider.value + "%";

    // Update the current slider value (each time you drag the slider handle)
    amountSlider.oninput = function() {
        amountText.innerHTML = this.value + "%";
    };

    let donateBtn = document.getElementById("confirmButton");
    donateBtn.onclick = (function () {
        onConfirm();
    });
}

function onConfirm(){
    let amountSlider = document.getElementById("amountSlider");
	let data = { amount: amountSlider.value };
    getNextState(data);
}

function getNextState(data){
    console.log('Sending User Data: ' + JSON.stringify(data));
    client.send('onNextState', data);
}

function initStatePass2(data){
    console.log("loading pass2 state");

    let amountText = document.getElementById("amountContainer");
    let amountSlider = document.getElementById("amountSlider");
    let earningsText = document.getElementById("earnings");
    if(!amountSlider) console.log('Could not find slider!');

    amountSlider.value = data.clientData.donatedAmount;
    amountText.innerText = data.clientData.donatedAmount + "%";
    earningsText.innerText = data.clientData.donatedAmount + "%";

    // Update the current slider value (each time you drag the slider handle)
    amountSlider.oninput = function() {
        amountText.innerHTML = this.value + "%";
    };

    if(data.clientData.group === Group.Full){
        setDonations(data.donations);
    }

    let summitBtn = document.getElementById("confirmButton");
    summitBtn.onclick = (function () {
        onConfirm();
    });
}

function onSummitCPR() {
	console.log('Submitting data');

	let cpr = document.getElementById("cprInput").value;
    let booth = document.getElementById("boothInput").value;

	let data = { cpr: cpr, booth: booth };

	getNextState(data);
}

function serverStopped(){

}

function insertHTML(html) {
	
	console.log('loading html: ' + JSON.stringify(html));
	document.getElementById("header").innerHTML = (HTMLStates.header);
	document.getElementById("content").innerHTML = (html);
}

function setClientData(data) {

    insertHTML(getHTMLFromStateGroup(data.clientData.currentState, data.clientData.group));

	switch (data.clientData.currentState) {
		case StageState.Waiting1:
			console.log('Waiting for server to start...');
			break;
        case StageState.Waiting2:
            console.log('Waiting for full group to finish survey...');
            break;
		case StageState.Login:
            initStateLogin();
			break;
		case StageState.Pass1:
            initStatePass1();
			break;
        case StageState.AfterPass1:
            break;
        case StageState.BeforePass2:
            initStateBeforePass2();
            break;
		case StageState.Pass2:
            initStatePass2(data);
			break;
		default:
			console.log("Something went wrong...");
			break;
	}
}

function setDonations(donations){
    if(donations){
        if(donations[0]){
            let cell = document.getElementById('participantAcell');
            if(cell){
                cell.innerHTML = donations[0] + "%";
            }else{
                console.log('A Cell not found...');
            }

        }
        else{
            document.getElementById('participantAheader').style.display = "none";
            document.getElementById('participantAcell').style.display = "none";
        }
        if(donations[1]){
            let cell = document.getElementById('participantBcell');
            if(cell){
                cell.innerHTML = donations[1] + "%";
            }else{
                console.log('B Cell not found...');
            }
        }
        else{
            document.getElementById('participantBheader').style.display = "none";
            document.getElementById('participantBcell').style.display = "none";
        }
        if(donations[2]){
            let cell = document.getElementById('participantCcell');
            if(cell){
                cell.innerHTML = donations[2] + "%";
            }else{
                console.log('C Cell not found...');
            }
        }
        else{
            document.getElementById('participantCheader').style.display = "none";
            document.getElementById('participantCcell').style.display = "none";
        }
    }else{
        document.getElementById('participantAheader').style.display = "none";
        document.getElementById('participantAcell').style.display = "none";

        document.getElementById('participantBheader').style.display = "none";
        document.getElementById('participantBcell').style.display = "none";

        document.getElementById('participantCheader').style.display = "none";
        document.getElementById('participantCcell').style.display = "none";
    }
}


/*
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

	}
}
*/
export const clientEvents = {
	'setClientData': function (clientId, data) {
		setClientData(data);
	},

    /*
	'setDonations': function (clientId, data) {
        setDonations(data.donations)
    },
*/
};
