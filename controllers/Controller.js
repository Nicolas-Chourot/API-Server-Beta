/////////////////////////////////////////////////////////////////////
// Important note about controllers:
// You must respect pluralize convention: 
// For ressource name RessourName you have to name the controller
// RessourceNamesController that must inherit from Controller class
// in order to have proper routing from request to controller action
/////////////////////////////////////////////////////////////////////
module.exports =
    class Controller {
        constructor(HttpContext) {
            this.HttpContext = HttpContext;
        }
        head() {
            this.HttpContext.response.notImplemented();
        }
        get(id) {
            this.HttpContext.response.notImplemented();
        }
        post(data) {
            this.HttpContext.response.notImplemented();
        }
        put(data) {
            this.HttpContext.response.notImplemented();
        }
        remove(id) {
            this.HttpContext.response.notImplemented();
        }
    }
