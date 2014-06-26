module.exports = function(controller, query) {
	//create the model and save
	controller
		.temp()
		.store()
		.model(query)
		.save(function(error) {
			//if there are errors
			if(error) {
				//trigger an error
				controller.trigger('temp-create-error', error);
				return;
			}
			
			//trigger that we are good
			controller.trigger('temp-create-success');
		});
};