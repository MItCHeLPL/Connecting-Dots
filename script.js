//Script settings
//Calculate settings to fit window scale
var dotCount = Math.round(window.innerWidth * 0.05); //default 100
document.getElementById("dotsAmount").value = dotCount; //put value into settings window

var distanceToDrawLine = Math.round(window.innerWidth * 0.045); //default 90
distanceToDrawLine = distanceToDrawLine < 60 ? 60 : distanceToDrawLine; //min 60 for wanted effect
document.getElementById("distanceToDrawLine").value = distanceToDrawLine;

var speedMultiplier = Math.round(window.innerWidth * 0.002); //default 4
document.getElementById("speedMultiplier").value = speedMultiplier;

var fps = 360; //frames per second

var minDir = 0.25; //between 0-1

var pointRadius = 8; 
var lineWidth = 2;

//Set color of each channel
var colorR = 255;
var colorG = 255;
var colorB = 255;

var dynamicLinesAlpha = true;

var minAlpha = 0; //(min alpha value 0-1)
var maxAlpha = 1; //(max alpha value 0-1)

var refreshScreenEveryFrame = true;

PrintSettingsInConsole();


//Script Variables
var canvas = document.getElementById("canvas");
var ctx;

//Array of all dots
var dots = [];
/* 
    HOW TO USE THIS ARRAY:

    SET ID: dots.push([x,y,dirX,dirY,speed]); - ID is next place in array

    GET ID: dots[ID];
    GET X of ID: dots[ID][0]; 
    GET Y of ID: dots[ID][1]; 
    GET dirX of ID: dots[ID][2]; 
    GET dirY of ID: dots[ID][3];
    GET speed of ID: dots[ID][4];
*/

//Script
//Get context
ctx = canvas.getContext("2d");

//Prepare canvas
UpdateCanvas();

//Generate dots in their starting positions and add every dot to the array
GenerateDots();

//Generate movement
var interval = setInterval(function()
{
    RenderFrame();
}, 1000 / fps);

//When window is resized
window.onresize = function()
{
    //Refresh canvas
    UpdateCanvas();

    //Re-render frame
    RenderFrame();

    //Move dot to the screen if out of bounds
    FixDotsPosition();
};

function UpdateCanvas()
{
    //Resize canvas to fit window
    canvas.setAttribute("width", window.innerWidth);
    canvas.setAttribute("height", window.innerHeight);

    //Dots and Lines color
    ctx.fillStyle = 'rgba(' + colorR + ',' + colorG + ',' + colorB + ','+maxAlpha+')';
    ctx.strokeStyle = 'rgba(' + colorR + ',' + colorG + ',' + colorB + ','+maxAlpha+')';
    ctx.lineWidth = lineWidth;
}

//Place dots for their starting positions
function GenerateDots()
{
    for(var i=0; i<dotCount; i++)
    {
        //Get random position on screen
        const x = GetRandomInt(pointRadius, (window.innerWidth - pointRadius));
         
        const y = GetRandomInt(pointRadius, (window.innerHeight - pointRadius));

        //Calculate random direction between 0 and 1
        //X
        let dirX = GetRandomFloat(-1, 1);
        dirX = (dirX < minDir && dirX > -minDir) ? minDir : dirX; //if direction is too close to 0 point is too slow, so clamp direction

        //Y
        let dirY = GetRandomFloat(-1, 1);
        dirY = (dirY < minDir && dirY > -minDir) ? -minDir : dirY;

        //Random speed per dot
        const speed = GetRandomInt(10, 20);

        //Draw dots at random positions
        DrawDot(x, y);

        //Add dot to the array
        dots.push([x, y, dirX, dirY, speed]);
    }
}

//Call it every frame and update rendered image
function RenderFrame()
{
    if(refreshScreenEveryFrame)
    {
        //Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    for(var i=0; i<dotCount; i++)
    {
        //Get dot values
        let x = dots[i][0];
        let y = dots[i][1];

        let dirX = dots[i][2];
        let dirY = dots[i][3];

        const speed = (dots[i][4] * speedMultiplier) / fps; //divide by fps so it's frame independent

        //Move dot
        x += (dirX * speed);
        y += (dirY * speed);

        //Update X and Y
        dots[i][0] = x;
        dots[i][1] = y;

        //Draw lines to each close point
        for(var j=0; j<dotCount; j++)
        {
            if(j != i) //don't draw line to the same point
            {
                //Calculate distance between points
                let distX = Math.abs(dots[i][0] - dots[j][0]);
                let distY = Math.abs(dots[i][1] - dots[j][1]);
                let dist = (distX + distY) / 2;

                //if applicable to draw the line
                if(dist <= distanceToDrawLine)
                {
                    if(dynamicLinesAlpha)
                    {
                        //Set line alpha (longer line = darker line)
                        //let alpha = newMin + (val - minVal) * (newMax - newMin) / (maxVal - minVal);
                        let alpha = minAlpha + (dist - distanceToDrawLine) * (maxAlpha - minAlpha) / (0 - distanceToDrawLine);
                        ctx.strokeStyle = 'rgba(' + colorR + ',' + colorG + ',' + colorB + ','+alpha+')';
                    }
                    
                    //Draw line to the point
                    DrawLine(x, y, dots[j][0], dots[j][1]);

                    //Redraw dots so they are always on top of lines
                    DrawDot(x, y);
                    DrawDot(dots[j][0], dots[j][1]);
                }
            }
            else //if same point 
            {
                //Draw dot
                DrawDot(x, y);
            }
        }

        //If near wall change direction
        //X
        if((window.innerWidth - pointRadius) - x <= 2 || (x - pointRadius) <= 2)
        {
            dirX *= -1;
            dots[i][2] = dirX;
        }

        //Y
        if((window.innerHeight - pointRadius) - y <= 2 || (y - pointRadius) <= 2)
        {
            dirY *= -1;
            dots[i][3] = dirY;
        }
    }
}

//Draw dot
function DrawDot(x, y)
{
    ctx.beginPath();

    //Draw circle
    ctx.arc(x, y, pointRadius, 0, 2 * Math.PI, true);

    //Fill dot
    ctx.fill();
}

//Draw line between two dots
function DrawLine(x, y, ToX, ToY)
{
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ToX, ToY);
    ctx.stroke();
}

function FixDotsPosition()
{
    //Move dot to the screen if out of bounds
    for(var i=0; i<dotCount; i++)
    {
        if(dots[i][0] > (window.innerWidth - pointRadius))
        {
            dots[i][0] = GetRandomInt(pointRadius, (window.innerWidth - pointRadius));
        }

        if(dots[i][1] > (window.innerHeight - pointRadius))
        {
            dots[i][1] = GetRandomInt(pointRadius, (window.innerHeight - pointRadius));
        }
    }
}

function UpdateSettings()
{
    dotCount = document.getElementById("dotsAmount").value;
    speedMultiplier = document.getElementById("speedMultiplier").value;
    distanceToDrawLine = document.getElementById("distanceToDrawLine").value;

    let color = hexToRgb(document.getElementById("color").value);
    colorR = color.r;
    colorG = color.g;
    colorB = color.b;

    document.getElementById("renderer").style.backgroundColor = document.getElementById("bgColor").value;

    pointRadius = document.getElementById("dotRadius").value;
    lineWidth = document.getElementById("lineWidth").value;

    UpdateCanvas();
    GenerateDots();
    PrintSettingsInConsole();
}

function PrintSettingsInConsole()
{
    //Print settings info in console
    console.log
    (
        "\n\n----CURRENT SETTINGS----" +
        
        "\n\nDot radius: " + pointRadius +
        ",\nLine width: " + lineWidth +

        ",\n\nColor: " + 'rgb(' + colorR + ', ' + colorG + ', ' + colorB + ')' +

        ",\n\nDot count: " + dotCount +

        ",\n\nFrames per second: " + fps +

        ",\n\nSpeed multiplier: " + speedMultiplier +

        ",\n\nDistance to draw line: " + distanceToDrawLine +
        ",\n\nDynamic line opacity enabled: " + dynamicLinesAlpha +

        ",\nRefresh screen every frame: " + refreshScreenEveryFrame + ".\n\n\n"
    );
}

//Randomizing functions
function GetRandomFloat(min, max) 
{
    return Math.random() * (max - min) + min;
}

function GetRandomInt(min, max) 
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Convert hex color to rgb
function hexToRgb(hex) 
{
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
    {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}