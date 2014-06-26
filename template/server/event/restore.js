module.exports = function(controller, id) {
	//remove
	controller
	.temp()
	.store()
	.restore(id, function(error, row) {
		//if there are errors
		if(error) {
			//trigger an error
			controller.trigger('temp-restore-error', error);
			return;
		}
		
		//trigger that we are good
		controller.trigger('temp-restore-success', row);
	});
};