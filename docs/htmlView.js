export class HtmlView {
	createElement = (tag, id) => {
		const element = document.createElement(tag);
		if (id) element.id = id;
		return element;
	}
	getElement = (id) => {
		const element = document.getElementById(id);
		return element;
	}

	constructor() {
		let title, p;
		this.app = this.getElement('root');

		//Title and midiAccess Control
		title = this.createElement('h1');
		title.textContent = 'MIDI router PWA';
		this.app.append(title);
		this.switchDarkModeButton = this.createElement('button');
		this.switchDarkModeButton.textContent = 'Dark/Light';
		this.bindSwitchDarkMode();
		this.app.append(this.switchDarkModeButton);

		p = this.createElement('p');
		p.textContent = "Status: ";
		this.textStatus = this.createElement('span','status');
		this.textStatus.textContent = 'Stopped';
		p.append(this.textStatus);
		this.app.append(p);

		p = this.createElement('p');
		this.requestMIDIAccessButton = this.createElement('button','requestMIDIAccess');
		this.requestMIDIAccessButton.textContent = 'Request MIDI Access';
		p.append(this.requestMIDIAccessButton);
		this.app.append(p);

		//MIDI Device section
		title = this.createElement('h2');
		title.textContent = 'Devices';
		this.app.append(title);

		//MIDI Input devices
		title = this.createElement('h3');
		title.textContent = 'Inputs';
		this.inputDeviceTable = this.createElement('table','inputDeviceTable');
		this.inputDeviceTable.append(this.createElement('thead'));
		let newRow = this.inputDeviceTable.tHead.insertRow()
		newRow.insertCell().textContent = "Manufacturer";
		newRow.insertCell().textContent = "Name";
		newRow.insertCell().textContent = "Note";
		newRow.insertCell().textContent = "CC";
		newRow.insertCell().textContent = "PC";
		newRow.insertCell().textContent = "Clock";
		this.inputDeviceTable.append(this.createElement('tbody'));
		this.app.append(title, this.inputDeviceTable);

		//MIDI Output devices
		title = this.createElement('h3');
		title.textContent = 'Outputs';
		this.outputDeviceTable = this.createElement('table','outputDeviceTable');
		this.outputDeviceTable.append(this.createElement('thead'));
		newRow = this.outputDeviceTable.tHead.insertRow()
		newRow.insertCell().textContent = "Manufacturer";
		newRow.insertCell().textContent = "Name";
		this.panicButton = this.createElement('button');
		this.panicButton.textContent = "Panic !";
		newRow.insertCell().appendChild(this.panicButton);
		this.outputDeviceTable.append(this.createElement('tbody'));
		this.app.append(title, this.outputDeviceTable);

		//MIDI Route section
		title = this.createElement('h2');
		title.textContent = 'Routes';
		this.app.append(title);
		
		//New route control
		title = this.createElement('h3');
		title.textContent = 'Add route';
		this.app.append(title);

		p = this.createElement('p');
		this.newRouteInput = this.createElement('select','newRouteInput');
		this.newRouteInputChannel = this.createElement('select','newRouteInputChannel');
		this.newRouteOutput = this.createElement('select','newRouteOutput');
		this.newRouteOutputChannel = this.createElement('select','newRouteOutputChannel');
		this.addRouteButton = this.createElement('button','addRouteButton');
		this.addRouteButton.textContent = "Add";
		this.newRouteInputChannel.options.add(new Option('All', -1));
		this.newRouteOutputChannel.options.add(new Option('Thru', -2));
		this.newRouteOutputChannel.options.add(new Option('All', -1));
		[...Array(16).keys()].forEach((channel) => {
			this.newRouteInputChannel.options.add(new Option(channel+1, channel));
			this.newRouteOutputChannel.options.add(new Option(channel+1, channel));
		});
		p.append(this.newRouteInput, ':', this.newRouteInputChannel, ' -> ', this.newRouteOutput, ':', this.newRouteOutputChannel, ' ', this.addRouteButton);

		//All Note Off control
		this.allNoteOffButton = this.createElement('button','allNoteOff');
		this.allNoteOffButton.textContent = "All Note Off";

		//MIDI Route list
		this.routeListTable = this.createElement('table','routeListTable');
		this.routeListTable.append(this.createElement('thead'));
		newRow = this.routeListTable.tHead.insertRow()
		newRow.insertCell().textContent = "Enabled";
		newRow.insertCell().textContent = "Route";
		newRow.insertCell().textContent = "Delete";
		this.routeListTable.append(this.createElement('tbody'));
		this.app.append(p, this.allNoteOffButton, this.routeListTable);
	}

	refreshAll = (model) => {
		refreshDevices(model.inputs, model.outputs);
		refreshRouteList(model.routes);
	}

	setStatus = (textStatus) =>{
		this.textStatus.textContent = textStatus;
	}
	
	refreshDevices = (inputs, outputs) => {
		this.inputDeviceTable.tBodies[0].replaceChildren();
		this.newRouteInput.replaceChildren();
		this.newRouteInput.options.add(new Option("Select Input",""));
		for (let index_input of inputs.entries()) {
			let index = index_input[0];
			let input = index_input[1];
			let newRow = this.inputDeviceTable.tBodies[0].insertRow();
			newRow.id = index;
			newRow.insertCell().textContent = input.manufacturer;
			newRow.insertCell().textContent = input.name; 
			newRow.insertCell().appendChild(this.createElement('input')).setAttribute('type','checkbox'); 
			newRow.insertCell().appendChild(this.createElement('input')).setAttribute('type','checkbox'); 
			newRow.insertCell().appendChild(this.createElement('input')).setAttribute('type','checkbox'); 
			newRow.insertCell().appendChild(this.createElement('input')).setAttribute('type','checkbox'); 
			
			this.newRouteInput.options.add(new Option(input.name, index));
		}

		this.outputDeviceTable.tBodies[0].replaceChildren();
		this.newRouteOutput.replaceChildren();
		this.newRouteOutput.options.add(new Option("Select Output",""));
		for(let index_output of outputs.entries()){
			let index = index_output[0];
			let output = index_output[1];
			let newRow = this.outputDeviceTable.tBodies[0].insertRow();
			newRow.id = index;
			newRow.insertCell().textContent = output.manufacturer;
			newRow.insertCell().textContent = output.name;
			let noteOffButton = this.createElement('button');
			noteOffButton.textContent = 'Note Off';
			newRow.insertCell().appendChild(noteOffButton);
			noteOffButton.addEventListener('click', event => {
				this.noteOffButtons(noteOffButton.parentElement.parentElement.id);
			});

			this.newRouteOutput.options.add(new Option(output.name,index));
		}
	}

	refreshRouteList = (routes) => {
		this.routeListTable.tBodies[0].replaceChildren();
		for (let index_route of routes.entries()){
			let index = index_route[0];
			let route = index_route[1]
			let newRow = this.routeListTable.tBodies[0].insertRow();
			newRow.id = index;
			newRow.insertCell().appendChild(this.createElement('input')).setAttribute('type','checkbox');
			let ichan = route['inputChannel'];
			switch (ichan){
				case -1: ichan = 'All'; break;
				default: ichan += 1;
			}
			let ochan = route['outputChannel'];
			switch (ochan) {
				case -2: ochan = "Thru"; break;
				case -1: ochan = 'All'; break;
				default: ochan += 1;
			}
			newRow.insertCell().textContent = route['input'].name+':'+ichan+' -> '+route['output'].name+':'+ochan;
			let deleteButton = newRow.insertCell().appendChild(this.createElement('button'));
			deleteButton.textContent = 'X';
			deleteButton.addEventListener('click', event => {
				this.deleteRouteButton(deleteButton.parentElement.parentElement.id);
			});
		}
	}

	bindSwitchDarkMode = () => {
		this.switchDarkModeButton.addEventListener('click', event => {
			event.preventDefault();
			for (let rule of document.styleSheets[0].cssRules){
				if (rule.selectorText === 'html') {
					if (rule.style.color === 'black'){
						rule.style.color = 'lightgrey';
						rule.style.backgroundColor = 'black';
					} else {
						rule.style.color = 'black';
						rule.style.backgroundColor = 'white';
					}
				}
			}
		});
	}

	bindRequestMidiAccess = (handler) => {
		this.requestMIDIAccessButton.addEventListener('click', event => {
			event.preventDefault();
			handler();
		});
	}

	bindPanicButton = (handler) => {
		this.panicButton.addEventListener('click', event => {
			event.preventDefault();
			handler();
		});
	}

	bindNoteOffButtons = (handler) => {
		this.noteOffButtons = handler;
	}

	bindAddRoute = (handler) => {
		this.addRouteButton.addEventListener('click', event => {
			event.preventDefault();
			handler(parseInt(this.newRouteInput.value), parseInt(this.newRouteOutput.value), parseInt(this.newRouteInputChannel.value), parseInt(this.newRouteOutputChannel.value));
		});
	}

	bindAllNoteOffButton = (handler) => {
		this.allNoteOffButton.addEventListener('click', event => {
			event.preventDefault();
			handler();
		});
	}

	bindDeleteRouteButtons = (handler) => {
		this.deleteRouteButton = handler;
	}

}
