export class MidiModel {
	constructor() {
		this.inputs = new Map();
		this.outputs = new Map();
		this.routes = new Map();
		this.midiAccess = null;
	}

	initMIDI = () => {
		//const statusElement = document.getElementById('status');
		//statusElement.textContent = 'Loading...';
		navigator.requestMIDIAccess({'sysex':true,'software':false}).then(this.onMIDISuccess,this.onMIDIFailure);
	}

	onMIDISuccess = (midiAccess) => {
		this.midiAccess = midiAccess;
		//const statusElement = document.getElementById('status');
		//statusElement.textContent = 'MIDI Access Success';
		this.refreshMIDI();
	}

	onMIDIFailure = () => {
		console.log('onMIDIFailure()');
		//const statusElement = document.getElementById('status');
		//statusElement.textContent = 'Failed  to get MIDI access - please check your browser supports WebMIDI.';
	}
	
	bindOnDeviceChanged = (callback) => {
		this.onDeviceChanged = callback;
	}

	bindOnRouteChanged = (callback) => {
		this.onRouteChanged = callback;
	}
	
	refreshMIDI = () => {
		this.inputs = new Map();
		for (let input of this.midiAccess.inputs.values()){
			this.inputs.set(input.id, input);
		}
		this.outputs = new Map();
		for (let output of this.midiAccess.outputs.values()){
			this.outputs.set(output.id, output);
		}
		this.onDeviceChanged();
	}

	addRoute = (inputID,outputID,inputChannel=null,outputchannel=null) => {
		let input = this.inputs.get(inputID);
		let output = this.outputs.get(outputID);

		if (this.routes.get(input)) {
			this.routes.get(input).push(output);
		}else{
			this.routes.set(input,[output]);
			input.onmidimessage = this.forwareMIDIMessage;
		}
		this.onRouteChanged();
	}

	deleteRoute = (input,output,inputChannel=null,outputchannel=null) => {
		if (routes.get(input)){
			routes.get(input).remove(output);
			if (routes.get(input).size < 1){
				input.onmidimessage = null;
			}
		}
		this.onRouteChanged();
	}

	forwardMIDIMessage = (message) => {
		for (let outputs of routes.get(message.srcElement)) {
			for (let output of outputs) {
				output.send(message.data)
			}
		}
	}
}
