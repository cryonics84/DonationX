/* globals $ */
import createClient from 'monsterr'

import html from './src/admin-client.html'
import './src/admin-client.css'
import {StageState, Group} from "./SharedFunctions";

let options = {
	canvasBackgroundColor: 'red',
	htmlContainerHeight: 1,
	// HTML is included in options for admin
	html
}

let events = {
	'setClients': function (clientId, data) {
		setClients(data.clients);
	}
}

let commands = {}

const admin = createClient({
	events,
	commands,
	options
	// no need to add stages to admin
})

init();

function init(){
	$('#admin-button-start').mouseup(e => {
		e.preventDefault()
		admin.sendCommand('start')
	})
	
	$('#admin-button-reset').mouseup(e => {
		e.preventDefault()
		admin.sendCommand('reset')
	})

	getClients();
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