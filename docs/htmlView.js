class HtmlView {
	createElement(tag, id) {
		const element = document.createElement(tag);
		if (id) element.id = id;
		return element;
	}
	getElement(id){
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
		this.title = this.createElement('h3');
		this.title.textContent = 'Inputs';
		this.inputDeviceTable = this.createElement('table','inputDeviceTable');
		this.inputDeviceTable.append(this.createElement('thead'));
		let newRow = this.inputDeviceTable.tHead.insertRow()
		newRow.insertCell().textContent = "Manufacturer";
		newRow.insertCell().textContent = "Name";
		newRow.insertCell().textContent = "Note";
		newRow.insertCell().textContent = "CC";
		newRow.insertCell().textContent = "PC";
		newRow.insertCell().textContent = "Clock";
		this.app.append(this.title, this.inputDeviceTable);

		//MIDI Output devices
		this.title = this.createElement('h3');
		this.title.textContent = 'Outputs';
		this.app.append();
		this.outputDeviceTable = this.createElement('table','outputDeviceTable');
		this.outputDeviceTable.append(this.createElement('thead'));
		newRow = this.outputDeviceTable.tHead.insertRow()
		newRow.insertCell().textContent = "Manufacturer";
		newRow.insertCell().textContent = "Name";
		newRow.insertCell().appendChild(this.createElement('button')).textContent = "Panic !";
		this.app.append(this.title, this.outputDeviceTable);

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
		this.newRouteOutput = this.createElement('select','newRouteOutput');
		this.addRouteButton = this.createElement('button','addRouteButton');
		this.addRouteButton.textContent = "Add";
		p.append(this.newRouteInput, this.newRouteOutput, this.addRouteButton);

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
		this.app.append(p, this.allNoteOffButton, this.routeListTable);
	}

	refreshAll(model){
		refreshDevices(model.inputs, model.outputs);
		refreshRouteList(model.routes);
	}

	setStatus(textStatus){
		this.textStatus.textContent = textStatus;
	}
	
	refreshDevices(inputs, outputs){
		this.inputDeviceTable.tBodies[0].replaceChildren();
		this.newRouteInput.replaceChildren();
		this.newRouteInput.options.add(new Option("Select Input",""));
		for (let input of inputs.values) {
			let newRow = this.inputDeviceTable.tBodies[0].insertRow();
			newRow.insertCell().textContent = input.manufacturer;
			newRow.insertCell().textContent = input.name; 
			newRow.insertCell().appendChild(document.createElement('input')).setAttribute('type','checkbox'); 
			newRow.insertCell().appendChild(document.createElement('input')).setAttribute('type','checkbox'); 
			newRow.insertCell().appendChild(document.createElement('input')).setAttribute('type','checkbox'); 
			newRow.insertCell().appendChild(document.createElement('input')).setAttribute('type','checkbox'); 
			
			this.newRouteInput.options.add(new Option(input.name,input.id));
		}

		this.outputDeviceTable.tBodies[0].replaceChildren();
		this.newRouteOutput.replaceChildren();
		this.newRouteInput.options.add(new Option("Select Output",""));
		for(let output of outputs.values()){
			let newRow = this.outputDeviceTable.tBodies[0].insertRow();
			newRow.insertCell().textContent = output.manufacturer;
			newRow.insertCell().textContent = output.name;
			newRow.insertCell().appendChild(document.createElement('button')).textContent = 'Note Off';

			this.newRouteOutput.options.add(new Option(output.name,output.id));
		}
	}

	refreshRouteList(routes) {
		this.routeListTable.tBodies[0].replaceChildren();
		for (let route in routes.entries()){
			routeListTable.tBodies[0].insterRow().textContent = route[0].name+' -> '+route[1].name;
		}
	}

	bindRequestMidiAccess(handler) {
		this.requestMIDIAccessButton.addEventListener('click', event => {
			event.preventDefault();
			handler();
		});
	}

	bindAddRoute(handler) {
		this.addRouteButton.addEventListener('click', event => {
			event.preventDefault();
			handler(this.newRouteInput,this.newRouteOutput);
		});
	}

}

export { HtmlView };
