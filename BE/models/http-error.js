class HttpError extends Error { //a class is a blueprint for a JS object. 
    constructor(message, errorCode){
        super(message); //adds a "message" property
        this.code= errorCode; //Adds a "code" property. 
    }
}

module.exports = HttpError;