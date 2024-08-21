inputs = new Map();
outputs = new Map();
routes = new Map();

document.getElementById('requestMIDIAccess').addEventListener('click', () => {
	navigator.requestMIDIAccess({'sysex':true,'software':false}).then(onMIDISuccess,onMIDIFailure);
});
document.getElementById('addRouteButton').addEventListener('click', createRoute);

function onMIDISuccess(midiAccess){
	const statusElement = document.getElementById('status');
	statusElement.textContent = 'MIDI Access Success';

	const newRouteInput = document.getElementById('newRouteInput');
	for (let input of midiAccess.inputs.values()){
		console.log(input)
		inputs.set(input.id, input);
		newRouteInput.options.add(new Option(input.name,input.id));
		//input.onmidimessage = getMIDIMessage;
	}
	const newRouteOutput = document.getElementById('newRouteOutput');
	for (let output of midiAccess.outputs.values()){
		console.log(output)
		outputs.set(output.id, output);
		newRouteOutput.options.add(new Option(output.name,output.id));
	}
	refreshDeviceTable();
}

function refreshDeviceTable() {
	const inputDeviceTable = document.getElementById('inputDeviceTable');
	for(let input of inputs.values()){
		inputDeviceTable.insertRow().textContent = input.name; 
	}
	const outputDeviceTable = document.getElementById('outputDeviceTable');
	for(let output of outputs.values()){
		outputDeviceTable.insertRow().textContent = output.name; 
	}
}

function onMIDIFailure(){
	const statusElement = document.getElementById('status');
	statusElement.textContent = 'Failed  to get MIDI access - please check your browser supports WebMIDI.';
}

function createRoute(){
	const inputID = document.getElementById('newRouteInput').value;
	const outputID = document.getElementById('newRouteOutput').value;
	routes.set(inputs.get(inputID), outputs.get(outputID));
	inputs.get(inputID).onmidimessage = forwardMIDIMessage; 
	refreshRouteList();
}

function refreshRouteList(){
	const routeListTable = document.getElementById('routeListTable');
	for(let route of routes.entries()){
		routeListTable.insertRow().textContent = route[0].name+' -> '+route[1].name; 
	}
}

function forwardMIDIMessage(message){
	routes.get(message.srcElement).send(message.data);
}

function getMIDIMessage(message){
	if (message.data[0] < 0xf8){
		console.log(message);
		console.log(message.data);
	}
}

if ('serviceWorker' in navigator){
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('service-worker.js').then(registration => {
			console.log('Service Worker registered with scope:', registration.scope);
		}).catch(error => {
			console.log('Service Worker registration failed', error);
		});
	});
}
