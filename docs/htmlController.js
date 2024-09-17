export class HtmlController {
	constructor(model, view) {
		this.model = model;
		this.view = view;

		this.model.bindOnMidiStatusChanged(this.onMidiStatusChanged);
		this.model.bindOnDeviceChanged(this.onDeviceListChanged);
		this.model.bindOnRouteChanged(this.onRouteListChanged);
		this.view.bindRequestMidiAccess(this.handleRequestMidiAccess);
		this.view.bindAddRoute(this.handleAddRoute);
		this.view.bindPanicButton(this.handlePanic);
		this.view.bindNoteOffButtons(this.handleNoteOff)
		this.view.bindAllNoteOffButton(this.handleAllNoteOff)
		this.view.bindDeleteRouteButtons(this.handleDeleteRoute);
	}

	onMidiStatusChanged = (statusText) => {
		this.view.setStatus(statusText);
	}

	onDeviceListChanged = () => {
		this.view.refreshDevices(this.model.inputs, this.model.outputs);
	}

	onRouteListChanged = () => {
		this.view.refreshRouteList(this.model.routeTable);
	}

	handleRequestMidiAccess = () => {
		this.model.initMIDI();
	}

	handleAddRoute = (inputID,outputID,iChannel,oChannel) => {
		this.model.addRoute(inputID,outputID,iChannel,oChannel);
	}
	
	//handleDisableRoute
	//handleEnableRoute

	handlePanic = () => {
		this.model.panic();
	}

	handleNoteOff = (outputIndex) => {
		this.model.noteOff(outputIndex);
	}

	handleAllNoteOff = () => {
	        this.model.allNoteOff();
	}

	handleDeleteRoute = (routeTableIndex) => {
		this.model.deleteRoute(routeTableIndex);
	}
}
