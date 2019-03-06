/* globals $ */
import createClient from 'monsterr'

import html from './src/admin-client.html'
import './src/admin-client.css'
import {StageState, Group} from "./SharedFunctions";

let options = {
	canvasBackgroundColor: 'red',
	htmlContainerHeight: 1,
	hideChat: true,
	// HTML is included in options for admin
	html
}

let events = {
	'setClients': function (clientId, data) {
		setClients(data.clients);
	},
    'updateServerState': function (clientId, data) {
        updateServerStatus(data.serverState);
    },
    'updateDbCount': function (clientId, data) {
        updateDbCount(data.dbCount);
    },
    'sendDbData': function (clientId, data) {
        sendDbData(data);
    },
};

let commands = {}

const admin = createClient({
	events,
	commands,
	options
	// no need to add stages to admin
})

let state = Group.Unknown;

init();

function init(){
	$('#startButton').mouseup(e => {
		e.preventDefault();
		toggleServer();
	});


    $('#clearDBbtn').mouseup(e => {
        e.preventDefault();
        clearDB();
    });


    $('#downloadData').mouseup(e => {
        e.preventDefault();
        requestDbData();
    });


	getClients();

	getServerStatus();
	getDBcount();


}

function clearDB(){
    admin.sendCommand('clearDB');
}

function toggleServer(){
	console.log('Toggling server...');
	if(isServerRunning()){
		console.log('Server is running');
		stopServer();
	}else{
        console.log('Server is not running');
		let isNormalChecked = document.getElementById("radioNormal").checked;
        let isSemiChecked = document.getElementById("radioSemi").checked;
        let isFullChecked = document.getElementById("radioFull").checked;

        let groupType = Group.Unknown;

        let groupSize = 0;

        if(isNormalChecked){
        	console.log('Control is checked');
        	groupType = Group.Control;
		}
		else if(isSemiChecked){
            console.log('Semi is checked');
            groupType = Group.Semi;
		}
		else if(isFullChecked){
            console.log('Full is checked');
            groupType = Group.Full;

            let sizeContainer = document.getElementById("fullSize");
            if(!sizeContainer){
            	console.log('Warning - size container element not found!');
			}else{
            	console.log('Group Size set to : ' + sizeContainer.value);
                groupSize = sizeContainer.value;
			}

        }

		console.log('Calling startServer() with type: ' + groupType + ', groupSize: ' + groupSize);
		startServer(groupType, groupSize);
	}
}

function getDBcount(){
    admin.sendCommand('getDbCount');
}

function getServerStatus(){
    admin.sendCommand('updateServerStatus');
}

function startServer(groupType, groupSize){
    admin.sendCommand('startServer', [groupType, groupSize]);
}

function stopServer(){
	console.log('sending stop server');
    admin.sendCommand('stopServer');
}

function updateDbCount(amount){
	console.log('Updating dbCount');
    document.getElementById('dbCount').innerText = amount;
}

function updateServerStatus(newState){
	console.log('Updating Server Status: ' + newState);
    state = newState;

    let startButton = document.getElementById('startButton');
    let serverRunningText = document.getElementById('isRunning');

    serverRunningText.innerText = getStateText(state);

    let config = document.getElementById('config');

    if(isServerRunning()){
        startButton.innerText = "Stop";
        config.style.display = "none";
	}else{
        startButton.innerText = "Start";
        config.style.display = "block";
	}
}

function isServerRunning(){
	return state !== Group.Unknown;
}

function getStateText(state){
	if(state === Group.Unknown){
    	return 'Server is OFF';
	}

    let txt = "Server is running - ";

	switch (state) {

		case Group.Control: return txt + 'control';
		case Group.Semi: return txt + 'semi';
		case Group.Full: return txt + 'full';
		default: return 'Unknown State...';
    }
}

function getClients(){
	console.log('Retrieving clients from server...');
	admin.sendCommand('getConnections', 'yrdy');
	admin.sendCommand('getClients', 'testing...');
}

function setClients(clients) {
	console.log('Adding clients to table: ' + JSON.stringify(clients));

	let tableRef = document.getElementById('clientTable').getElementsByTagName('tbody')[0];

	clearTable(tableRef);

	for (let client of clients) {
		console.log('Adding client:' + JSON.stringify(client));

		let newRow   = tableRef.insertRow(tableRef.rows.length);

		addCell(newRow, client.cpr);
		addCell(newRow, '#' + client.booth);
		addCell(newRow, StageState.getState(client.currentState));
	}

}

function addCell(newRow, content){
	var newCell = newRow.insertCell(0);
	let newText  = document.createTextNode(content);
	newCell.appendChild(newText);
	newCell.setAttribute("class", "w3-center");
}

function clearTable(table){
	var tableHeaderRowCount = 1;
	
	var rowCount = table.rows.length;
	for (var i = tableHeaderRowCount; i < rowCount; i++) {
		table.deleteRow(tableHeaderRowCount);
	}
}

function requestDbData(){
	console.log('Requesting db download...');
	admin.sendCommand('downloadData');
}

function sendDbData(data){
    let clientData = data.clientData;

    download(clientData, 'clientData.json', 'text/plain')
}

function download(content, fileName, contentType) {
	console.log('Creating file and making download...');
    let a = document.createElement("a");
    let file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
