export class MidiRoute {
	constructor(input,output,inputChannel=0,outputChannel=0) {
		this.input = input;
		this.inputChannel = inputChannel;
		this.output = output;
		this.outputChannel = outputChannel;
	}
}

export class MidiModel {
	constructor() {
		this.inputs = new Array();
		this.outputs = new Array();
		// this.routeTable: Array({inputId, iChannel, outputId, oChannel});
		this.routeTable = new Array();
		// this.routes: Map(inputId, Map(iChannel , Map(outputId, Uint8Array(oChannel))))
		this.routes = new Map();
		this.midiAccess = null;
	}

	initMIDI = () => {
		this.onMidiStatusChanged('Loading...');
		//const statusElement = document.getElementById('status');
		//statusElement.textContent = 'Loading...';
		navigator.requestMIDIAccess({'sysex':true,'software':false}).then(this.onMIDISuccess,this.onMIDIFailure);
	}

	onMIDISuccess = (midiAccess) => {
		this.midiAccess = midiAccess;
		//const statusElement = document.getElementById('status');
		//statusElement.textContent = 'MIDI Access Success';
		this.onMidiStatusChanged('MIDI Access Success');
		this.refreshMIDI();
	}

	onMIDIFailure = () => {
		console.log('onMIDIFailure()');
		//const statusElement = document.getElementById('status');
		//statusElement.textContent = 'Failed  to get MIDI access - please check your browser supports WebMIDI.';
		this.onMidiStatusChanged('Failed  to get MIDI access - please check your browser supports WebMIDI.');
	}
	
	bindOnMidiStatusChanged = (callback) => {
		this.onMidiStatusChanged = callback;
	}

	bindOnDeviceChanged = (callback) => {
		this.onDeviceChanged = callback;
	}

	bindOnRouteChanged = (callback) => {
		this.onRouteChanged = callback;
	}
	
	refreshMIDI = () => {
		this.inputs = new Array();
		for (let input of this.midiAccess.inputs.values()){
			this.inputs.push(input);
		}
		this.outputs = new Array();
		for (let output of this.midiAccess.outputs.values()){
			this.outputs.push(output);
		}
		this.onDeviceChanged();
	}

	addRoute = (inputId ,outputId, inputChannel=0, outputChannel=0) => {
		// this.routes: Map(inputId, Map(iChannel , Map(outputId, Uint8Array(oChannel))))
		try {
			if (this.routes.get(inputId).get(inputChannel).get(outputId).indexOf(outputChannel)) return;
		} catch (e) {
			if (! (e instanceof TypeError) ) throw e;
		}

		if (!this.routes.get(inputId)) {
			this.routes.set(inputId, new Map());
			this.inputs.get(inputId).onmidimessage = this.forwardMIDIMessage;
		}
		if (!this.routes.get(inputId).get(inputChannel)) this.routes.get(inputId).set(inputChannel, new Map());
		if (!this.routes.get(inputId).get(inputChannel).get(outputId)) this.routes.get(inputId).get(inputChannel).set(outputId, new Uint8Array());

		this.routes.get(inputId).get(inputChannel).get(outputId).push(outputChannel);

		this.routeTable.push({inputId, inputChannel, outputId, outputChannel});

		this.onRouteChanged();
	}

	deleteRoute = (routeTableIndex) => {
		let route = this.routeTable.get(routeTableIndex);

		// this.routeTable: Array({inputId, iChannel, outputId, oChannel});
		// this.routes: Map(inputId, Map(iChannel , Map(outputId, Uint8Array(oChannel))))
		

		this.routes.get(inputId).get(inputChannel).set(outputId, outputChannel);
		if (!this.routes.get(inputId).get(inputChannel).get(outputId)) this.routes.get(inputId).get(inputChannel).set(outputId, );
		if (!this.routes.get(inputId).get(inputChannel)) this.routes.get(inputId).set(inputChannel, new Map());
		if (!this.routes.get(inputId)) {
			this.routes.set(inputId, new Map());
			this.inputs.get(inputId).onmidimessage = this.forwardMIDIMessage;
		}

		this.routeTable.push({inputId, inputChannel, outputId, outputChannel});

		//
		if (this.routes.get(input)){
			this.routes.get(input).remove(output);
			if (this.routes.get(input).size < 1){
				input.onmidimessage = null;
			}
		}


		this.onRouteChanged();
	}

	forwardMIDIMessage = (message) => {
		// this.routeTable = Array({inputId, iChannel, outputId, oChannel);
		// this.routes = Map(inputId, Map(iChannel , Map(outputId, oChannel)))
		
		/* ichannel = message.data[0] & 15;
		 * route = this.routes.get(message.srcElement)
		 * route.get(0).map();
		 *
		 * route.get((ichannel).map((output) => {
		 * 	output.map((ochannel) => {
		 * 		output.send(message.data); // but replace channel with & or |
		 * 	});
		 * });
		 *
		 *
		 *
		 *
		 * for (ichannel of this.routes.get(message.srcElement)) {
		 * 	for (output of ichannel) {
		 * 		for (ochannel of output) {
		 * 			output.send(message.data & ochannel);
		 * 		}
		 * 	}
		 * }
		 */
		for (let output of this.routes.get(message.srcElement)) {
			output.send(message.data)
		}
	}

	panic = () => {
		throw("panic() not implemented yet.")
	}

	allNoteOff = () => {
		throw("allNoteOff() not implemented yet.")
	}
}
