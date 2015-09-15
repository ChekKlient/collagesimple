var http = require('http');
var url = require('url');
var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});;


function processRequest(request, response) {
    "use strict";

    var pathname = url.parse(request.url).pathname;
    var query  = url.parse(request.url, true).query;
    console.log('Requested ' + pathname);
    console.log('Query ' + query);
    var errorDescription = "";
    if(query == null) 
      errorDescription = errorDescription + " You need to set parameters sizex, sizey and username";
    else
{
    if(isNaN(query.sizex)||query.sizex == 0)
	errorDescription = errorDescription + " You need to set parameter sizex";
    if(isNaN(query.sizey)||query.sizey == 0)
        errorDescription = errorDescription + " You need to set parameter sizey";
    if(query.username == ''||query.username==undefined)
        errorDescription = errorDescription + " You need to set parameter username";
}
   if(errorDescription != '')
	response.end(errorDescription);
   else
   {

    response.writeHead(200, { 'Content-Type': 'image/png' });
    //var img = fs.readFileSync(ComposeCollageSimple(parseInt(query.sizex), parseInt(query.sizey), [1,2,3,3,4,5]));
/*    var img = ComposeCollageSimple(parseInt(query.sizex), parseInt(query.sizey), [1,2,3,3,4,5]);
    var fileName = 'output.png';
    var img = fs.readFileSync(fileName);
*/
    var imgBuf = fs.readFileSync('output.png');
    var img = gm(525, 110, "#00ff55aa").toBuffer('PNG',function (err, buffer) {
  if (err) return handle(err);
    response.end(buffer, 'binary');
    console.log('done!');  
});
//    response.end(img, 'binary');
    }
}

http.createServer(processRequest).listen(8880);
//ComposeCollageSimple(800, 600, [1,2,3,3,4,5]);



function GeneratePicture(CollageWidth, CollageHeight, xCoordinates, yCoordinates, pictureSides, pictureFiles)
{
  
  var img = gd.createSync(CollageWidth, CollageHeight);
  var fileName = 'output.png';
  img.colorAllocate(0, 0, 0);
  
  for(i=0;i<pictureSides.length;i++)
  {
    var avatar = gd.createSync(pictureSides[i], pictureSides[i]);
    avatar.colorAllocate(i*20, 100, i*20);
    //console.log(parseInt(xCoordinates[i]));
    //console.log(parseInt(yCoordinates[i]));
    //console.log(parseInt(pictureSides[i]));
    if(!isNaN(xCoordinates[i]))
    {
     console.log(1);
     avatar.copyResampled(img, xCoordinates[i], yCoordinates[i], 0,0,pictureSides[i], pictureSides[i], pictureSides[i], pictureSides[i]);
    }
    avatar.destroy();
  }
  img.savePng(fileName, 1, function(err) {
  if(err) {
    throw err;
    }
  });
  img.destroy();
  return fileName;
}

function ComposeCollageSimple(CollageWidth, CollageHeight, pictureFiles)
{
 var pictureInRow = parseInt(Math.sqrt(CollageWidth * pictureFiles.length / CollageHeight) + 0.5);
 var pictureRows = parseInt(pictureFiles.length / pictureInRow + 0.5);

 var xCoordinates = []; 
 var yCoordinates = [];
 var pictureSides = [];
 
 var pictureSideSize = parseInt(Math.min(CollageWidth / pictureInRow, CollageHeight / pictureRows));
 
 for(var i = 0; i<pictureFiles.length; i++) 
  {
    columnIndex = parseInt(i / pictureInRow);
    rowIndex = i % pictureInRow;
    xCoordinates[i] = rowIndex * pictureSideSize;   
    yCoordinates[i] = columnIndex * pictureSideSize;
    pictureSides[i] = pictureSideSize;    
 }  
 return GeneratePicture(CollageWidth, CollageHeight, xCoordinates, yCoordinates, pictureSides, pictureFiles);      
}
