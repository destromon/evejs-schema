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
		//1. SETUP: change the string into a native object
		var self = this, query = this
			.controller.eden.load('string')
			.queryToHash(this.request.message);
		
		//2. TRIGGER
		this.controller
			//when there is an error 
			.once('temp-create-error', function(error) {
				//setup an error response
				self.response.message = JSON.stringify({ 
					error: true, 
					message: error.message,
					validation: error.errors || [] });
				
				//dont listen for success anymore
				self.controller.unlisten('temp-create-success');
				//trigger that a response has been made
				self.controller.trigger('temp-action-response', self.request, self.response);
			})
			//when it is successfull
			.once('temp-create-success', function() {
				//set up a success response
				self.response.message = JSON.stringify({ error: false });
				//dont listen for error anymore
				self.controller.unlisten('temp-create-error');
				//trigger that a response has been made
				self.controller.trigger('temp-action-response', self.request, self.response);
			})
			//Now call to remove the temp
			.trigger('temp-create', this.controller, query);
	};
	
	/* Private Methods
    -------------------------------*/
	/* Adaptor
	-------------------------------*/
	return c; 
})();