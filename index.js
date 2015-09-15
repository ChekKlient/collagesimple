var http = require('http');
var url = require('url');

function processRequest(request, response) {
    "use strict";

    var pathname = url.parse(request.url).pathname;
    console.log('Requested ' + pathname);

    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write('<!DOCTYPE html><html lang="en"><head>');
    response.write('<meta charset="utf-8">');
    response.write('<title>' + pathname + '</title>');
    response.write('</head><body>');
    response.write('<h1><tt>' + pathname + '</tt></h1>');
    response.write('</body></html>');
    response.end();
}

http.createServer(processRequest).listen(8080);
