export class MidiModel {
	constructor() {
		this.inputs = new Array();
		this.outputs = new Array();
		// this.routeTable: Array({input, iChannel, output, oChannel});
		this.routeTable = new Array();
		// this.routes: Map(inputId, Map(iChannel , Map(outputId, Array(oChannel))))
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

	addRoute = (inputId ,outputId, inputChannel=-1, outputChannel=-1) => {
		if((inputChannel < -1 || inputChannel > 15) || (outputChannel < -1 || outputChannel > 15)) return;
		// this.routes: Map(inputId, Map(iChannel , Map(outputId, Array(oChannel))))
		try {
			if (this.routes.get(inputId).get(inputChannel).get(outputId).indexOf(outputChannel)) return;
		} catch (e) {
			if (! (e instanceof TypeError) ) throw e;
		}

		if (!this.routes.get(inputId)) {
			this.routes.set(inputId, new Map());
			this.inputs.at(inputId).onmidimessage = this.forwardMIDIMessage;
		}
		if (!this.routes.get(inputId).get(inputChannel)) this.routes.get(inputId).set(inputChannel, new Map());
		if (!this.routes.get(inputId).get(inputChannel).get(outputId)) this.routes.get(inputId).get(inputChannel).set(outputId, new Array());

		this.routes.get(inputId).get(inputChannel).get(outputId).push(outputChannel);

		this.routeTable.push({'input':this.inputs.at(inputId), inputChannel, 'output':this.outputs.at(outputId), outputChannel});
		console.log(this.routeTable);

		this.onRouteChanged();
	}

	deleteRoute = (routeTableIndex) => {
		console.log(routeTableIndex);
		let route = this.routeTable.at(routeTableIndex);
		console.log(route);

		// this.routeTable: Array({input, iChannel, output, oChannel});
		// this.routes: Map(inputId, Map(iChannel , Map(outputId, Array(oChannel))))
		
		throw('Not Implemented yet: deleteRoute');
		// TODO
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
		// this.routes = Map(inputId, Map(iChannel , Map(outputId, Array(oChannel))))

		console.log(message.data);
		
		ichannel = message.data[0] & 15;
		console.log('iChannel: ', ichannel);

		route = this.routes.get(message.srcElement)
		console.log('route: ', route);

		console.log('iChannel all ? ', route.get(-1));
		if (route.get(-1)) {
		 	route.get(0).forEach((outputId) => {
				console.log('outputId: ', outputId);
		 		console.log('data: ', message.data);
				//outputs.get(outputId).send(message.data);
		 	});
		}

		route.get(ichannel).forEach((outputId) => {
			console.log('outputId: ', outputId);
		 	outputId.forEach((oChannel) => {
				console.log('oChannel: ', oChannel);
				console.log('data: ',message.data);
				let data = message.data;
		 		data[0] = (data[0] & 0xf0) + oChannel;
				console.log('newData: ', data);
		 		outputs.get(outputId).send(data);
		 	});
		});
		
		/* 
		 * if (route.get(0)) {
		 * 	route.get(0).forEach((outputId) => {
		 * 		outputs.get(outputId).send(message.data);
		 * 	});
		 * }
		 *
		 * route.get(ichannel).forEach((outputId) => {
		 * 	output.forEach((ochannel) => {
		 * 		message.data[0] = (message.data[0] & 0xf0) + (ochannel - 1);
		 * 		outputs.get(outputId).send(message.data);
		 * 	});
		 * });
		 *
		 * for (ichannel of this.routes.get(message.srcElement)) {
		 * 	for (output of ichannel) {
		 * 		for (ochannel of output) {
		 * 			output.send(message.data & ochannel);
		 * 		}
		 * 	}
		 * }
		 */

		/*
		for (let output of this.routes.get(message.srcElement)) {
			output.send(message.data)
		}
		*/
	}

	panic = () => {
		let channels = [...Array(16).keys()];
		this.outputs.forEach((output) => {
			channels.forEach((oChannel) => {
				output.send([(0xb0 + oChannel),0x7b,0x00]);
			});
		});
	}

	allNoteOff = () => {
		let channels = [...Array(16).keys()];
		this.routeTable.forEach((route) => {
			let output = route[2];
			let oChannel = route[3];
			if (oChannel === -1) {
				channels.forEach((channel) => {
					output.send([0xb0 + channel, 0x7b, 0x00]);
				});
			} else {
				output.send([0xb0 + oChannel, 0x7b, 0x00]);
			}
		});
	}

	noteOff = (outputIndex) => {
		let channels = [...Array(16).keys()];
		channels.forEach((ochannel) => {
			this.outputs.at(outputIndex).send([0xb0 + ochannel, 0x7b, 0x00]);
		});
	}
}
