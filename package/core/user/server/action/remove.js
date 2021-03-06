module.exports = (function() { 
	var c = function(controller, request, response) {
        this.__construct.call(this, controller, request, response);
    }, public = c.prototype;

	/* Public Properties
    -------------------------------*/
    public.controller  	= null;
    public.request   	= null;
    public.response  	= null;
    
	/* Private Properties
    -------------------------------*/
    /* Loader
    -------------------------------*/
    public.__load = c.load = function(controller, request, response) {
        return new c(controller, request, response);
    };
    
	/* Construct
    -------------------------------*/
	public.__construct = function(controller, request, response) {
		//set request and other usefull data
		this.controller = controller;
		this.request  	= request;
		this.response  	= response;
	};
	
	/* Public Methods
    -------------------------------*/
	public.render = function() {
		//if no ID
		if(!this.request.variables[0]) {
			//setup an error response
			this.response.message = JSON.stringify({ 
				error: true, 
				message: 'No ID set' });
			
			//trigger that a response has been made
			this.controller.trigger('user-action-response', this.request, this.response);
			
			return;
		}
		
		var self = this;

		this.controller
			//when there is an error
			.once('user-remove-error', function(error) {
				//setup an error response
				self.response.message = JSON.stringify({ 
					error: true, 
					message: error.message });
					
				//dont listen for success anymore
				self.controller.unlisten('user-remove-success');
				//trigger that a response has been made
				self.controller.trigger('user-action-response', self.request, self.response);
			})
			//when it is successfull
			.once('user-remove-success', function(row) {
				//set up a success response
				self.response.message = JSON.stringify({ error: false, results: row });
				//dont listen for error anymore
				self.controller.unlisten('user-remove-error');
				//trigger that a response has been made
				self.controller.trigger('user-action-response', self.request, self.response);
			})
			//Now call to remove the user
			.trigger('user-remove', this.controller, this.request.variables[0]);
	};
	
	/* Private Methods
    -------------------------------*/
	/* Adaptor
	-------------------------------*/
	return c; 
})();