

// to save data   *TO DO: test if localstorage is available
jQuery(document).ready(function(){
  	jQuery("#savebutton").click(function(){
 		showState(window.size,window.data);	

		var savedata= Array(window.size,window.data);

		savedata.size=window.size;
		savedata.data=window.data;
		localStorage.gamedata=JSON.stringify(savedata);
		console.log(JSON.stringify(savedata));
	//	savedata=null;
  	});
});


/*
//to load data
jQuery(document).ready(function(){
  	jQuery("#loadbutton").click(function(){
  		if(typeof(localStorage.gamedata) != "undefined"){
  			console.log(localStorage.gamedata);
  			var loaddata=JSON.parse(localStorage.gamedata);
  		//	copyData(loaddata[1],window.data,loaddata[0]);
  		//	copyData(loaddata[1],window.data_bak,loaddata[0]);
  		//	showState(window.size,window.data);

  		//	window.requestAnimationFrame(function(){
  			//var reload = 	new GameManager(loaddata[0], KeyboardInputManager, HTMLActuator, LocalScoreManager,1);
      // reload.restart(); 
  		//	});
  		}

  		else{
  			alert("no data !");
  			console.log("data not found !");
  		}
  	});
});
*/


function copyData(data1,data2,size){
	for(var i=0;i<size;i++){
		for(var j=0;j<size;j++){
			data2[i][j]=data1[i][j];
		}
	}

}

function initData(size){
	var data = new Array(size);
	for (var i=0;i<size;i++){
    		data[i] = new Array(size);
    		for (var j=0;j<size;j++){
      		data[i][j]=0;
    		}
  	}
  	return data;
}



function showState(size,data){
 	var i = 0;
 	var j = 0
 	var string = '';
 	console.log(size);
 	for(i=0;i<size;i++){
 		for(j=0;j<size;j++){
 			string = string + ' ' + data[j][i];
 		}
 		console.log(string);
 		string = '';
 	}
}
