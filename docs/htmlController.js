class HtmlController {
	constructor(model, view) {
		this.model = model;
		console.log(this);
		this.view = view;

		this.view.bindRequestMidiAccess(this.handleRequestMidiAccess);
		this.view.bindAddRoute(this.handleAddRoute);
	}

	onDeviceListChanged(){
		this.view.refreshDevices(this.model.inputs, this.model.outputs);
	}

	onRouteListChanged() {
		this.view.refreshRouteList(this.model.routes);
	}


	handleRequestMidiAccess() {
		console.log(this);
		this.model.initMIDI();
	}

	handleAddRoute(inputID,outputID){
		this.model.addRoute(inputID,outputID)
	}
	//handleDeleteRoute
	//handleDisableRoute
	//handleEnableRoute
}

export { HtmlController };
