module.exports = function(controller, id, query) {
	//find and update
	controller
	.temp()
	.store()
	.update(id, query, function(error) {
		//if there are errors
		if(error) {
			//trigger an error
			controller.trigger('temp-update-error', error);
			return;
		}
		
		//trigger that we are good
		controller.trigger('temp-update-success');
	});
};