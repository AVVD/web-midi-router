class MidiModel {
	constructor() {
		this.inputs = new Map();
		this.outputs = new Map();
		this.routes = new Map();
		this.midiAccess = null;
	}

	initMIDI() {
		console.log('initMIDI()');
		//const statusElement = document.getElementById('status');
		//statusElement.textContent = 'Loading...';
		navigator.requestMIDIAccess({'sysex':true,'software':false}).then(onMIDISuccess,onMIDIFailure);
	}

	onMIDISuccess(midiAccess){
		console.log('onMIDISuccess()');
		this.midiAccess = midiAccess;
		//const statusElement = document.getElementById('status');
		//statusElement.textContent = 'MIDI Access Success';
		refreshMIDI();
	}

	onMIDIFailure(){
		console.log('onMIDIFailure()');
		//const statusElement = document.getElementById('status');
		//statusElement.textContent = 'Failed  to get MIDI access - please check your browser supports WebMIDI.';
	}
	
	refreshMIDI() {
		this.inputs = new Map();
		for (let input of this.midiAccess.inputs.values()){
			inputs.set(input.id, input);
		}
		console.log(inputs);
		this.outputs = new Map();
		for (let output of this.midiAccess.outputs.values()){
			outputs.set(output.id, output);
		}
		console.log(outputs);
	}

	createRoute(input,output,inputChannel=null,outputchannel=null) {
		console.log('createRoute()');
		if (routes.get(input)) {
			routes.get(input).append(output);
		}else{
			route.set(input,[output]);
			input.onmidimessage = forwareMIDIMessage;
		}
	}

	deleteRoute(input,output,inputChannel=null,outputchannel=null) {
		if (routes.get(input)){
			routes.get(input).remove(output);
			if (routes.get(input).size < 1){
				input.onmidimessage = null;
			}
		}
	}

	forwardMIDIMessage(message) {
		for (let output of routes.get(message.srcElement)) {
			output.send(message.data)
		}
	}
}

export { MidiModel };
