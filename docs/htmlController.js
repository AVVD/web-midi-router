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
		this.view.bindAllNoteOffButton(this.handleAllNoteOff)
	}

	onMidiStatusChanged = (statusText) => {
		this.view.setStatus(statusText);
	}

	onDeviceListChanged = () => {
		this.view.refreshDevices(this.model.inputs, this.model.outputs);
	}

	onRouteListChanged = () => {
		this.view.refreshRouteList(this.model.routes);
	}

	handleRequestMidiAccess = () => {
		this.model.initMIDI();
	}

	handleAddRoute = (inputID,outputID) => {
		this.model.addRoute(inputID,outputID);
	}
	//handleDeleteRoute
	//handleDisableRoute
	//handleEnableRoute

	handlePanic = () => {
		this.model.panic();
	}

	handleAllNoteOff = () => {
	        this.model.allNoteOff();
	}
}
