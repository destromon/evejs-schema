module.exports = function(controller, id) {
	//remove
	controller
		.temporary()
		.store()
		.restore(id, function(error, row) {
			//if there are errors
			if(error) {
				//trigger an error
				controller.trigger('temporary-restore-error', error);
				return;
			}
			
			//trigger that we are good
			controller.trigger('temporary-restore-success', row);
		});
};