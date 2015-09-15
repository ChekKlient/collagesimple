var http = require('http');
var url = require('url');


function processRequest(request, response) {
    "use strict";

	response.end('!!!');
}

http.createServer(processRequest).listen(8880);
