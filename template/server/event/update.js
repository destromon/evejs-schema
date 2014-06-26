module.exports = function(controller, id, query) {
	//find and update
	controller
		.temporary()
		.store()
		.update(id, query, function(error) {
			//if there are errors
			if(error) {
				//trigger an error
				controller.trigger('temporary-update-error', error);
				return;
			}
			
			//trigger that we are good
			controller.trigger('temporary-update-success');
		});
};