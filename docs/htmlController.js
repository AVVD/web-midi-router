export class HtmlController {
	constructor(model, view) {
		this.model = model;
		this.view = view;

		this.view.bindRequestMidiAccess(this.handleRequestMidiAccess);
		this.view.bindAddRoute(this.handleAddRoute);
		this.model.bindOnDeviceChanged(this.onDeviceListChanged);
		this.model.bindOnRouteChanged(this.onRouteListChanged);
	}

	onDeviceListChanged = () => {
		this.view.refreshDevices(this.model.inputs, this.model.outputs);
	}

	onRouteListChanged = () => {
		console.log(this.model.routes);
		this.view.refreshRouteList(this.model.routes);
	}

	handleRequestMidiAccess = () => {
		this.model.initMIDI();
	}

	handleAddRoute = (inputID,outputID) => {
		this.model.addRoute(inputID,outputID)
	}
	//handleDeleteRoute
	//handleDisableRoute
	//handleEnableRoute
}
