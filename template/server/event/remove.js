module.exports = function(controller, id) {
	//remove
	controller
	.temp()
	.store()
	.remove(id, function(error, row) {
		//if there are errors
		if(error) {
			//trigger an error
			controller.trigger('temp-remove-error', error);
			return;
		}
		
		//trigger that we are good
		controller.trigger('temp-remove-success', row);
	});
};