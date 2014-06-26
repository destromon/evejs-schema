module.exports = function(controller, query) {
	//create the model and save
	controller
		.temporary()
		.store()
		.model(query)
		.save(function(error) {
			//if there are errors
			if(error) {
				//trigger an error
				controller.trigger('temporary-create-error', error);
				return;
			}
			
			//trigger that we are good
			controller.trigger('temporary-create-success');
		});
};