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

	addRoute = (inputIndex ,outputIndex, inputChannel=-1, outputChannel=-1) => {
		if((inputChannel < -1 || inputChannel > 15) || (outputChannel < -2 || outputChannel > 15)) { return; }
		console.log(this.routeTable);
		console.log(this.routes);
		// this.routes: Map(inputId, Map(iChannel , Map(outputId, Array(oChannel))))
		try {
			if (this.routes.get(inputIndex).get(inputChannel).get(outputIndex).indexOf(outputChannel) > -1) { return; }
		} catch (e) {
			if (! (e instanceof TypeError) ) throw e;
		}

		if (!this.routes.get(inputIndex)) {
			this.routes.set(inputIndex, new Map());
			this.inputs.at(inputIndex).onmidimessage = this.forwardMIDIMessage;
		}
		if (!this.routes.get(inputIndex).get(inputChannel)) this.routes.get(inputIndex).set(inputChannel, new Map());
		if (!this.routes.get(inputIndex).get(inputChannel).get(outputIndex)) this.routes.get(inputIndex).get(inputChannel).set(outputIndex, new Array());

		this.routes.get(inputIndex).get(inputChannel).get(outputIndex).push(outputChannel);

		this.routeTable.push({'input':this.inputs.at(inputIndex), inputChannel, 'output':this.outputs.at(outputIndex), outputChannel});

		console.log(this.routeTable);
		console.log(this.routes);

		this.onRouteChanged();
	}

	deleteRoute = (routeTableIndex) => {
		console.log("deleteRoute");
		console.log(this.routeTable);
		console.log(this.routes);
		console.log(routeTableIndex);

		let route = this.routeTable.at(routeTableIndex);
		console.log(route);

		// this.routeTable: Array({input, iChannel, output, oChannel});
		// this.routes: Map(inputId, Map(iChannel , Map(outputId, Array(oChannel))))

		let inputIndex = this.inputs.indexOf(route.input);
		let inputChannel = route.inputChannel;
		console.log(inputChannel);
		let outputIndex = this.outputs.indexOf(route.output);
		let outputChannel = route.outputChannel;
		console.log(outputChannel);
		console.log(this.routes);
		console.log(this.routes.get(inputIndex));
		console.log(this.routes.get(inputIndex).get(inputChannel));
		console.log(this.routes.get(inputIndex).get(inputChannel).get(outputIndex));
		
		let outputChannels = this.routes.get(inputIndex).get(inputChannel).get(outputIndex);
		outputChannels.splice(outputChannels.indexOf(outputChannel),1);
		if (outputChannels.length < 1) {
			this.routes.get(inputIndex).get(inputChannel).delete(outputIndex);
			if (this.routes.get(inputIndex).get(inputChannel).size < 1) {
				this.routes.delete(inputIndex);
				this.inputs.at(inputIndex).onmidimessage = null;
			}
		}else{
			this.routes.get(inputIndex).get(inputChannel).set(outputIndex,outputChannels);
		}

		this.routeTable.splice(routeTableIndex,1);
		console.log(this.routeTable);
		console.log(this.routes);

		this.onRouteChanged();
	}

	forwardMIDIMessage = (message) => {
		// this.routeTable = Array({inputId, iChannel, outputId, oChannel);
		// this.routes = Map(inputId, Map(iChannel , Map(outputId, Array(oChannel))))
		console.log('Received: ',message.srcElement.name, ' : ', message.data);

		console.log(message.data);
		
		ichannel = message.data[0] & 15;
		console.log('iChannel: ', ichannel);

		let route = this.routes.get(message.srcElement)
		console.log('route: ', route);

		// if input channel === -1, means listen all iChannels, it assume -1 in oChannel
		// need to be improved:
		// if oChannel = -1 : all duplicate message on all oChannels
		// if oChannel = -2 : thru to outputs
		// or forward to set ochannels by outputs
		console.log('iChannel all ? ', route.get(-1));
		if (route.get(-1)) {
		 	route.get(0).forEach((outputId) => {
				console.log('output: ', this.outputs.at(outputId), ' : ', message.data);
				this.outputs.get(outputId).send(message.data);
		 	});
			return;
		}

		route.get(ichannel).forEach((outputId) => {
			console.log('outputId: ', outputId);
			//need to add case if oChannel === -1: means All so duplicate message on each oChannels
			//need to add case if oChannel === -2: means thru, just send message as is to outputs
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
			if (oChannel === -1 || oChannel === -2) {
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
