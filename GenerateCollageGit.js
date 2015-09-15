var MinSideSize = 48;
var CollageWidth = 400;
var CollageHeight = 300;
var pictureWeights = [10000, 1000, 5000, 1, 5, 100, 500, 500, 550, 550, 550];
var pictureFiles = [10000, 1000, 5000, 1, 5, 100, 500, 500, 550, 550, 550];
var maxPictures = 100;

ComposeCollageSimple(CollageWidth, CollageHeight, pictureFiles);

//ComposeCollage(CollageWidth, CollageHeight, pictureWeights, pictureFiles);

function FindProportion(values, targetProportion)
{
 var bestProportion = 0;
 var bestRowSum = 0;
 var bestColumnSum = 0;
 var bestRows = 0;
// Check variants with different number of rows for find value more close to targetProportion
 for(var i=0;i<values.length;i++)
 {
   var maxRowSum = 0;
   var matrix = [];
   valuesInRow = parseInt(values.length/(i+1)+0.99); 
   //console.log("Values in row " + valuesInRow);

   for(var j=0;j<=i;j++)
   {
    matrix[j] = [];
    for(var k=0;k<valuesInRow;k++) {matrix[j][k] = 0};
   }
   //console.log(matrix);
   for(var l=0;l<values.length;l++)
   {
     rowNumber = parseInt(l / valuesInRow)*2 + l % 2;
     columnNumber = l % valuesInRow;
     if(rowNumber>i) rowNumber = (i+1)*2 - (rowNumber+1);
     matrix[rowNumber][columnNumber] = values[l];
   }
  //console.log(matrix);
  // Find max column
   for(var j=0;j<=i;j++)
   {
    var rowSum = 0;
    for(var k=0;k<valuesInRow;k++)
     rowSum+=matrix[j][k];
    maxRowSum = Math.max(maxRowSum, rowSum);
   }
   var maxColumnSum = 0;
   for(var j=0;j<valuesInRow;j++)
   {
    var columnSum = 0;
    for(var k=0;k<=i;k++)
      columnSum+=matrix[k][j];
    maxColumnSum = Math.max(maxColumnSum,columnSum);
   }
   currentProportion = maxRowSum / maxColumnSum;
   if((bestProportion==0)||(targetProportion - currentProportion)*(targetProportion - currentProportion)<(targetProportion - bestProportion)*(targetProportion - bestProportion)) 
    {
     bestProportion = currentProportion;
     bestRowSum = maxRowSum;
     bestColumnSum = maxColumnSum;
     bestRows = i+1;
    }   
 }
 //console.log("Best proportion " + bestProportion);
 console.log("Best rows " + bestRows);
 return Math.max(bestRowSum, bestColumnSum);
}

function GeneratePicture(CollageWidth, CollageHeight, xCoordinates, yCoordinates, pictureSides, pictureFiles)
{
  var gd = require('node-gd');
  var img = gd.createSync(CollageWidth, CollageHeight);
  img.colorAllocate(0, 0, 0);
  
  for(i=0;i<pictureSides.length;i++)
  {
    var avatar = gd.createSync(pictureSides[i], pictureSides[i]);
    avatar.colorAllocate(i*20, 100, i*20);
    console.log(parseInt(xCoordinates[i]));
    console.log(parseInt(yCoordinates[i]));
    console.log(parseInt(pictureSides[i]));
    if(!isNaN(xCoordinates[i]))
    {
     console.log(1);
     avatar.copyResampled(img, xCoordinates[i], yCoordinates[i], 0,0,pictureSides[i], pictureSides[i], pictureSides[i], pictureSides[i]);
    }
  }
  img.savePng('output.png', 1, function(err) {
  if(err) {
    throw err;
    }
  });
}

function ComposeCollage(CollageWidth, CollageHeight, pictureWeights, pictureFiles)
{
var pictureSides = [];
var minSquareShape = pictureWeights.length * MinSideSize * MinSideSize;
var freeSquare = CollageWidth * CollageHeight - minSquareShape;

if(freeSquare < 0) console.log("Don't enough space for specified quantity of avatars.")
else
{
 // sort weights descending
 for(var i=0; i<pictureWeights.length; i++)
  for(var j=i+1;j<pictureWeights.length; j++)
    if(pictureWeights[j] > pictureWeights[i])
     {
        var k = pictureWeights[i];
        pictureWeights[i] = pictureWeights[j];
        pictureWeights[j] = k;      
     } 
 // Find best proportion values
 var bestRowSum = FindProportion(pictureWeights, CollageWidth/CollageHeight);
 var bestColumnSum = bestRowSum;
 console.log("Best row sum " + bestRowSum);
 var kof = Math.min(CollageWidth, CollageHeight) / Math.max(bestRowSum, bestColumnSum);

// Set picture size according to real collage size and Weight 
 for(var i=0; i<pictureWeights.length; i++)
 {
   var currentSide = kof * pictureWeights[i];
   pictureSides[i] = Math.max(parseInt(currentSide), MinSideSize);
 }

 // Make list of free shapes
 var freeShapes = [];
 for(var i=0; i<pictureWeights.length; i++)
  freeShapes[i] = true; // is free
 
 // Initial structures for place picture on the Collage matrix 
 var getNextFreeShape = function(freeShapes, lastFreeShape){for(var i=lastFreeShape+1; i<pictureWeights.length; i++) if(freeShapes[i]) return i; return -1};   
 var xCoordinates = []; 
 var yCoordinates = [];
 var currentRowHeight = 0;
 var currentLevel = 0;

 while(getNextFreeShape(freeShapes, -1) >= 0)
 {
 // Set the biggest picture to the top left conner
 var freeSpaceStart = []; 
 var freeSpaceHeight = [];
 var freeShape = getNextFreeShape(freeShapes, -1);
 currentLevel+= currentRowHeight;
 currentRowHeight = pictureSides[freeShape];
 freeShapes[freeShape] = false; 
 xCoordinates[freeShape] = 0;
 yCoordinates[freeShape] = currentLevel;
 freeSpaceStart[0] = pictureSides[freeShape];
 freeSpaceHeight[0] = pictureSides[freeShape];

 freeShape = getNextFreeShape(freeShapes, freeShape);
 
 while(freeShape>=0)
 {
 // first interation we allways use main free space
    var j=0;
      freeWidth = CollageWidth - freeSpaceStart[j];
      freeHight = freeSpaceHeight[j];
      if(freeWidth>=pictureSides[freeShape]&&freeHight>=pictureSides[freeShape])
      {
      // Place picture to free space
       freeShapes[freeShape] = false;  
       xCoordinates[freeShape] = freeSpaceStart[j];
       yCoordinates[freeShape] = currentLevel;
      // Change free space array
       freeSpaceStart[j] = freeSpaceStart[j] + pictureSides[freeShape];
       //if(freeHight<pictureSides[freeShape])
       //{
         freeSpaceHeight[freeSpaceStart.length] = currentRowHeight-pictureSides[freeShape];
         freeSpaceStart[freeSpaceStart.length] = xCoordinates[freeShape];
       //}
       };
  // check free spaces in backward order
     freeShape = getNextFreeShape(freeShapes, freeShape);
 } 
 // Second interaton
 // Fill free spaces in backward order
 freeShape = getNextFreeShape(freeShapes, -1);
 var rightBorder = CollageWidth;
 while(freeShape!=-1)
 {
    // find free space in the current row
    for(var j=0;j<(freeSpaceStart.length-1)&&freeShapes[freeShape];j++)
    {
    
      freeWidth = rightBorder - freeSpaceStart[freeSpaceStart.length-j-1];
      freeHight = freeSpaceHeight[freeSpaceStart.length-j-1];
      console.log("Free w " + freeWidth + " free h "+freeHight);
      if(freeWidth>=pictureSides[freeShape]&&freeHight>=pictureSides[freeShape])
      {
      // Place picture to free space
       freeShapes[freeShape] = false;  
       xCoordinates[freeShape] = rightBorder - pictureSides[freeShape];
       yCoordinates[freeShape] = currentLevel + currentRowHeight - pictureSides[freeShape];
       rightBorder = xCoordinates[freeShape];
       };
    }
  // check free spaces in backward order
  freeShape = getNextFreeShape(freeShapes, freeShape);
  } 
}
}
GeneratePicture(CollageWidth, CollageHeight, xCoordinates, yCoordinates, pictureSides, pictureFiles);      
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
 GeneratePicture(CollageWidth, CollageHeight, xCoordinates, yCoordinates, pictureSides, pictureFiles);      
}
