class MIDIrouter {
	construct() {
		this.inputs = new Map();
		this.outputs = new Map();
		this.routes = new Map();
		this.midiAccess = null;
	}

	function initMIDI(midiAccess){
		this.midiAccess = midiAccess;
		refreshMIDI();
	}
	
	function refreshMIDI() {
		this.inputs = new Map();
		for (let input of this.midiAccess.inputs.values()){
			inputs.set(input.id, input);
		}
		this.outputs = new Map();
		for (let output of this.midiAccess.outputs.values()){
			outputs.set(output.id, output);
		}
	}

	function createRoute(input,output,inputChannel=null,outputchannel=null){
		if (routes.get(input)) {
			routes.get(input).append(output);
		}else{
			route.set(input,[output]);
			input.onmidimessage = forwareMIDIMessage;
		}
	}

	function deleteRoute(input,output,inputChannel=null,outputchannel=null){
		if (routes.get(input)){
			routes.get(input).remove(output);
			if routes.get(input).size < 1;
			input.onmidimessage = null;
		}
	}

	function forwardMIDIMessage(message){
		for (let output of routes.get(message.srcElement)){
			output.send(message.data)
		}
	}
}

export new MIDIrouter();
