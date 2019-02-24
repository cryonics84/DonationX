/* globals $ */
import createClient from 'monsterr'

import html from './src/admin-client.html'
import './src/admin-client.css'

let options = {
	canvasBackgroundColor: 'red',
	htmlContainerHeight: 0.5,
	// HTML is included in options for admin
	html
}

let events = {
	'setClients': function (clientId, data) {
		setClientData(data)
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
	admin.sendCommand('getClients');
}

function setClients(clients) {
	for(let client of clients){
		console.log('Adding client: ' + JSON.stringify(client));
	}
}