module.exports = function(controller, id) {
	//remove
	controller
		.temporary()
		.store()
		.remove(id, function(error, row) {
			//if there are errors
			if(error) {
				//trigger an error
				controller.trigger('temporary-remove-error', error);
				return;
			}
			
			//trigger that we are good
			controller.trigger('temporary-remove-success', row);
		});
};