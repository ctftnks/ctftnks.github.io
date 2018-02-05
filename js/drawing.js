// TAKE THIS AS AN EXAMPLE ONLY!


//Spielzeit
t__ = 0.1;




// Canvas synchronisieren
function syncCanvas(){
	canvasIntvl = setInterval(function(){
		var canvas = document.getElementById("gameFrame");
		var context = canvas.getContext("2d");
		canvas.height = window.innerHeight;
		canvas.width = window.innerWidth;
    for(var i=0; i<objs.length; i++)
      objs[i].draw(canvas, context);
	}, 40);
}


function stopCanvasSync(){
	if(typeof(canvasIntvl) != "undefined") clearInterval(canvasIntvl);
}

// Objekte und Umgebung zeichnen TODO: remove
function redraw(canvas, context){
	context.clearRect(0, 0, canvas.width, canvas.height);
	for(var i=0; i<objs.length; i++){
		curObj = objs[i];
		var x = curObj.getX();
		var y = curObj.getY();
		drawRotated(context, curObj.image, x, y, curObj.direction);
	}
}

// Debug Overlay
function overlay(canvas, context){
	context.clearRect(0, 0, canvas.width, canvas.height);
	for(n in monitorAromas){
		var mem = monitorAromas[n].obj.memory;
		for(var i=0; i<mem.length; i++){
			for(var j=0; j<mem[i].length; j++){
				var val = mem[i][j]/monitorAromas[n].max;
				if(val>1) val=1;
				context.fillStyle = "rgba("+monitorAromas[n].r+", "+monitorAromas[n].g+", "+monitorAromas[n].b+", "+val+")";
				context.fillRect(i*antAroma.resolution, j*antAroma.resolution, antAroma.resolution, antAroma.resolution);
			}
		}
	}

	/*
	var mem = objMap.memory;
	for(var i=0; i<mem.length; i++){
		if(typeof(mem[i])!="undefined")
		for(var j=0; j<mem[i].length; j++){
			if(typeof(mem[i][j])!="undefined") context.fillStyle = "#F00";
			else context.fillStyle = "#FFF";
			context.fillRect(i*objMap.resolution, j*objMap.resolution, objMap.resolution, objMap.resolution);
		}
	}
	*/
}



// Hilfsfunktion um Objekte gedreht zu malen
function drawRotated(context, image, x, y, angle) {
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
    context.restore();
}


window.onresize = function(){
	stopCanvasSync();
	setTimeout(function(){
		syncCanvas();
	}, 10);
}

window.onload = function(){
	window.onresize();
}
