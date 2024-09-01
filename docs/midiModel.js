export class MidiModel {
	constructor() {
		this.inputs = new Array();
		this.outputs = new Array();
		// routeTable: Array({input, iChannel, output, oChannel});
		this.routeTable = new Array();
		// routes: Map(inputId, Map(iChannel , Map(outputId, Array(oChannel))))
		this.routes = new Map();
		this.midiAccess = null;
	}

	initMIDI = () => {
		this.onMidiStatusChanged('Loading...');
		navigator.requestMIDIAccess({'sysex':true,'software':false}).then(this.onMIDISuccess,this.onMIDIFailure);
	}

	onMIDISuccess = (midiAccess) => {
		this.midiAccess = midiAccess;
		this.onMidiStatusChanged('MIDI Access Success');
		this.refreshMIDI();
	}

	onMIDIFailure = () => {
		console.log('onMIDIFailure()');
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

		this.onRouteChanged();
	}

	deleteRoute = (routeTableIndex) => {
		let route = this.routeTable.at(routeTableIndex);

		let inputIndex = this.inputs.indexOf(route.input);
		let inputChannel = route.inputChannel;
		let outputIndex = this.outputs.indexOf(route.output);
		let outputChannel = route.outputChannel;
		
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

		this.onRouteChanged();
	}

	forwardMIDIMessage = (message) => {
		// All + Thru = keep source channel
		// All + All = duplicate message to all channels
		// All + # = get all message and forward to # channel
		// # + Thru = filter on # and keep source channel
		// # + All = filter on # and duplicate message to all channels
		// # + # = filter on # and forward to #

		let route = this.routes.get(this.inputs.indexOf(message.srcElement));
		let ichannel = message.data[0] & 15;
		let allChannels = [...Array(16).keys()];

		// Process input All
		if (route.get(-1)) {
		 	route.get(-1).forEach((oChannels, outputIndex) => {
				if (oChannels.indexOf(-1) > -1){ oChannels = allChannels; }
				oChannels.forEach((oChannel) => {
					if (oChannel === -2) {
						this.outputs.at(outputIndex).send(message.data);
					} else {
						let data = message.data;
						data[0] = (data[0] & 0xf0) + oChannel;
						this.outputs.at(outputIndex).send(data);
					}
				});
			});
			return; // No need to check other inputChannel
		}

		// Process input filtered
		if (route.get(ichannel)) {
			route.get(ichannel).forEach((oChannels, outputIndex) => {
				if (oChannels.indexOf(-1) > -1) { oChannels = allChannels; }
				oChannels.forEach((oChannel) => {
					if (oChannel === -2) {
						this.outputs.at(outputIndex).send(message.data);
					} else {
						let data = message.data;
						data[0] = (data[0] & 0xf0) + oChannel;
						this.outputs.at(outputIndex).send(data);
					}
				});
			});
		}
	}

	//TODO: to fix
	panic = () => {
		let channels = [...Array(16).keys()];
		this.outputs.forEach((output) => {
			channels.forEach((oChannel) => {
				output.send([(0xb0 + oChannel),0x78,0x00]);
			});
		});
	}

	//TODO: to fix
	allNoteOff = () => {
		let channels = [...Array(16).keys()];
		this.routeTable.forEach((route) => {
			let output = route[2];
			let oChannel = route[3];
			if (oChannel === -1 || oChannel === -2) {
				channels.forEach((channel) => {
					output.send([0xb0 + channel, 0x78, 0x00]);
				});
			} else {
				output.send([0xb0 + oChannel, 0x7b, 0x00]);
			}
		});
	}

	//TODO: to fix
	noteOff = (outputIndex) => {
		let channels = [...Array(16).keys()];
		channels.forEach((oChannel) => {
			this.outputs.at(outputIndex).send([0xb0 + oChannel, 0x78, 0x00]);
		});
	}
}
