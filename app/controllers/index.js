//Array to store the data from the todo list

//We execute the function to show the data for the first view
var ip = "192.168.0.101";

getTodoList("kiwi");
getTodoList("fresa");
getTodoList("pina");

var json1;
var json2;
var json3;
var iconHeight=40;
var iconTop=18;
function mandarProducir(e){
	var quantity;
	if(e.source.fruta=="fresa"){
		quantity = $.fresaTextField.value;
	}
	else if(e.source.fruta=="pina"){
		quantity = $.pinaTextField.value;
	}
	else if(e.source.fruta=="kiwi"){
		quantity = $.kiwiTextField.value;
	}
	console.log("cuantity es " +quantity);
	var sendProducir = Ti.Network.createHTTPClient({
        onerror : function(e) {
            Ti.API.debug(e.error);
            alert('There was an error during the connection');
        },
        timeout : 1000,
    });
    sendProducir.open('post', 'http://'+ip+':3050/api/distribuidora/'+e.source.usuario+'/mandarproducir');
    var parameterProducir={"type":e.source.fruta,"quantity":quantity};
    sendProducir.send(parameterProducir);
    sendProducir.onload = function(e){
    	var json=JSON.parse(this.responseText);
    	if (json.status=="failed") {
    		alert(json.reason);
    	}
    	else{
    		console.log(json);
    		alert("Se han mandado a producir "+json.quantity+" de "+json.fruta);
    	}
    };
}

function pedirUno(e){
	var senduno = Ti.Network.createHTTPClient({
        onerror : function(e) {
            Ti.API.debug(e.error);
            alert('There was an error during the connection');
        },
        timeout : 1000,
    });
    
    //Here you have to change it for your local ip
    senduno.open('post', 'http://'+ip+':3050/api/distribuidora/comprarfruta');
    var parameterCompra={"fruta":e.source.parametro};
	senduno.send(parameterCompra);
	senduno.onload = function(err) {
		
		var json = JSON.parse(this.responseText);
		console.log(json);
		if(json.status=="failed"){
		}
		else{
			var senddos = Ti.Network.createHTTPClient({
		        onerror : function(e) {
		            Ti.API.debug(e.error);
		            
		        },
		        timeout : 1000,
		    });
		    
		    senddos.open('post', 'http://'+ip+':3000/api/kiwitienda/guardarfuta');
		    console.log(json.fruta);
		    var parameterComprado={"_id":json.fruta._id,"fruta":json.fruta.type};
		    senddos.send(parameterComprado);
		    senddos.onload = function(er){
		    	var jsonAux = JSON.parse(this.responseText);
		    	if(jsonAux.status=="failed"){
					
            		alert(jsonAux.reason);
				}
				else{
					getTodoList(jsonAux.fruta.type);
				}
		    };
		}
	};
}

function getTodoList(fruta) {
	var dataArray = [];
    //function to use HTTP to connect to a web server and transfer the data.
    var sendit = Ti.Network.createHTTPClient({
        onerror : function(e) {
            Ti.API.debug(e.error);
            alert('There was an error during the connection');
        },
        timeout : 1000,
    });
    
    //Here you have to change it for your local ip
    sendit.open('GET', 'http://'+ip+':3000/api/kiwitienda/obtenertodas/'+fruta);
    sendit.send();
    
    //Function to be called upon a successful response
    sendit.onload = function(e) {
    	var json1 ;
    	var json2 ;
    	var json3 ;
    	var tamano;
    	if(fruta=="fresa"){
    		json1 = JSON.parse(this.responseText);
    		tamano = json1.length;
    	}
    	if(fruta=="pina"){
    		json2 = JSON.parse(this.responseText);
    		tamano = json2.length;
    	}
    	if(fruta=="kiwi"){
    		json3 = JSON.parse(this.responseText);
    		tamano = json3.length;
    	}
        
        console.log("LLEGAAAAAA ");
        console.log('El responseText fue: \n********************', this.responseText+'\n********************');
        //var json = json.message;
        //if the database is empty show an alert
        if (tamano == 0) {
        	if(fruta=='fresa'){
        		$.tableViewFresa.headerTitle = "There are no fruits in our "+fruta+" stock";
        		$.tableViewFresa.setData([]);
        	}
        	if(fruta=='pina'){
        		$.tableViewPina.headerTitle = "There are no fruits in our "+fruta+" stock";
        		$.tableViewPina.setData([]);
        	}
        	if(fruta=='kiwi'){
        		$.tableViewKiwi.headerTitle = "There are no fruits in our "+fruta+" stock";
        		$.tableViewKiwi.setData([]);
        	}
            
        }
        //Emptying the data to refresh the view
        dataArray = [];
        
        //Insert the JSON data to the table view
        for (var i = 0; i < tamano; i++) {
        	if(fruta=="fresa"){
        		var row = Ti.UI.createTableViewRow({
	                hasCheck : false,
	                color : '#ffffff',
	                height:80
	            });	
	            var vender =  Titanium.UI.createImageView({
					image:"vender.png",
					width:64,
					height:iconHeight,
					right:20,
					top:iconTop
				});
				vender.miId= json1[i].value._id;
				vender.addEventListener('click',function(e){
				    var sendUpdate = Ti.Network.createHTTPClient({
					    onerror : function(e) {
					        Ti.API.debug(e.error);
					        alert('There was an error during the connection');
					    },
					    timeout : 1000,
					});
					console.log("El ID es "+e.source.miId);
					//Here you have to change it for your local ip
					var params = {"_id":e.source.miId};
					sendUpdate.open('PUT', 'http://'+ip+':3000/api/kiwitienda/venderfruta');
					sendUpdate.send(params);
					
					sendUpdate.onload = function(e){
						getTodoList(fruta);
					};
				});
				
				var noVender =  Titanium.UI.createImageView({
					image:"_vender.png",
					width:64,
					height:iconHeight,
					right:20,
					top:iconTop
				});
				
				var despachar =  Titanium.UI.createImageView({
					image:"despachar.png",
					width:64,
					height:iconHeight,
					right:104,
					top:iconTop
				});	
				
				var nombre =  Titanium.UI.createLabel({
					text:json1[i].value.fruta +"  "+ json1[i].value._id.substr(json1[i].value._id.length - 3),
					font:{fontSize:12,fontWeight:'bold'},
					width:'auto',
					textAlign:'left',
					bottom:42,
					left:20,
					height:12
				});
				
				despachar.miID=json1[i].value._id;
				despachar.addEventListener('click',function(e){
				    var sendDelete = Ti.Network.createHTTPClient({
					    onerror : function(e) {
					        Ti.API.debug(e.error);
					        alert('There was an error during the connection');
					    },
					    timeout : 1000,
					});
					console.log("El ID es "+e.source.miID);
					//Here you have to change it for your local ip
					var params = {"_id":e.source.miID};
					sendDelete.open('PUT', 'http://'+ip+':3000/api/kiwitienda/despacharfruta');
					sendDelete.send(params);
					
					sendDelete.onload = function(e){
						getTodoList(fruta);
					};
				});
				row.add(nombre);
				
	            if(json1[i].value.status=="disponible"){
					row.add(vender);
	            }
	            else{
					row.add(noVender);
					row.add(despachar);
	            }
	            dataArray.push(row);
	            $.tableViewFresa.setData(dataArray);
        	}
        	else if(fruta=="pina"){
        		var row = Ti.UI.createTableViewRow({
	                title : json2[i].value.fruta,
	                hasCheck : false,
	                color : '#ffffff',
	                height : 80
	            });	
	            var vender =  Titanium.UI.createImageView({
					image:"vender.png",
					width:64,
					height:iconHeight,
					right:20,
					top:iconTop
				});
				vender.miId= json2[i].value._id;
				vender.addEventListener('click',function(e){
				    var sendUpdate = Ti.Network.createHTTPClient({
					    onerror : function(e) {
					        Ti.API.debug(e.error);
					        alert('There was an error during the connection');
					    },
					    timeout : 1000,
					});
					console.log("El ID es "+e.source.miId);
					//Here you have to change it for your local ip
					var params = {"_id":e.source.miId};
					sendUpdate.open('PUT', 'http://'+ip+':3000/api/kiwitienda/venderfruta');
					sendUpdate.send(params);
					
					sendUpdate.onload = function(e){
						getTodoList(fruta);
					};
				});
				
				var noVender =  Titanium.UI.createImageView({
					image:"_vender.png",
					width:64,
					height:iconHeight,
					right:20,
					top:iconTop
				});
				
				var despachar =  Titanium.UI.createImageView({
					image:"despachar.png",
					width:64,
					height:iconHeight,
					right:104,
					top:iconTop
				});	
				var nombre =  Titanium.UI.createLabel({
					text:json2[i].value.fruta +"  "+ json2[i].value._id.substr(json2[i].value._id.length - 3),
					font:{fontSize:12,fontWeight:'bold'},
					width:'auto',
					textAlign:'left',
					bottom:20,
					left:42,
					height:12
				});
				despachar.miID=json2[i].value._id;
				despachar.addEventListener('click',function(e){
				    var sendDelete = Ti.Network.createHTTPClient({
					    onerror : function(e) {
					        Ti.API.debug(e.error);
					        alert('There was an error during the connection');
					    },
					    timeout : 1000,
					});
					console.log("El ID es "+e.source.miID);
					//Here you have to change it for your local ip
					var params = {"_id":e.source.miID};
					sendDelete.open('PUT', 'http://'+ip+':3000/api/kiwitienda/despacharfruta');
					sendDelete.send(params);
					
					sendDelete.onload = function(e){
						getTodoList(fruta);
					};
				});
				row.add(nombre);
				
	            if(json2[i].value.status=="disponible"){
					row.add(vender);
	            }
	            else{
					row.add(noVender);
					row.add(despachar);
	            }
	            dataArray.push(row);
	            $.tableViewPina.setData(dataArray);
        	}
        	else if(fruta=="kiwi"){
        		var row = Ti.UI.createTableViewRow({
	                hasCheck : false,
	                color : '#ffffff',
	                height : 80
	            });	
	            
	            var vender =  Titanium.UI.createImageView({
					image:"vender.png",
					width:64,
					height:iconHeight,
					right:20,
					top:iconTop
				});
				vender.miId= json3[i].value._id;
				vender.addEventListener('click',function(e){
				    var sendUpdate = Ti.Network.createHTTPClient({
					    onerror : function(e) {
					        Ti.API.debug(e.error);
					        alert('There was an error during the connection');
					    },
					    timeout : 1000,
					});
					console.log("El ID es "+e.source.miId);
					//Here you have to change it for your local ip
					var params = {"_id":e.source.miId};
					sendUpdate.open('PUT', 'http://'+ip+':3000/api/kiwitienda/venderfruta');
					sendUpdate.send(params);
					
					sendUpdate.onload = function(e){
						getTodoList(fruta);
					};
				});
				
				var noVender =  Titanium.UI.createImageView({
					image:"_vender.png",
					width:64,
					height:iconHeight,
					right:20,
					top:iconTop
				});
				
				var despachar =  Titanium.UI.createImageView({
					image:"despachar.png",
					width:64,
					height:iconHeight,
					right:104,
					top:iconTop
				});	
				var nombre =  Titanium.UI.createLabel({
					text:json3[i].value.fruta +"  "+ json3[i].value._id.substr(json3[i].value._id.length - 3),
					font:{fontSize:12,fontWeight:'bold'},
					width:'auto',
					textAlign:'left',
					bottom:42,
					left:20,
					height:12
				});
				despachar.miID=json3[i].value._id;
				despachar.addEventListener('click',function(e){
				    var sendDelete = Ti.Network.createHTTPClient({
					    onerror : function(e) {
					        Ti.API.debug(e.error);
					        alert('There was an error during the connection');
					    },
					    timeout : 1000,
					});
					console.log("El ID es "+e.source.miId);
					//Here you have to change it for your local ip
					var params = {"_id":e.source.miID};
					sendDelete.open('PUT', 'http://'+ip+':3000/api/kiwitienda/despacharfruta');
					sendDelete.send(params);
					
					sendDelete.onload = function(e){
						getTodoList(fruta);
					};
				});
				row.add(nombre);
	            if(json3[i].value.status=="disponible"){
					row.add(vender);
	            }
	            else{
					row.add(noVender);
					row.add(despachar);
	            }
	            dataArray.push(row);
	            $.tableViewKiwi.setData(dataArray);
        	}
        };
    };
};

function insertData() {
    //if there is something in the textbox
    if ($.inserTxtF.value != "" && $.inserTxtF.value != null) {
        var request = Ti.Network.createHTTPClient({
            onload : function(e) {
                alert(this.responseText);
            },
            onerror : function(e) {
                Ti.API.debug(e.error);
                alert('There was an error during the conexion');
            },
            timeout : 1000,
        });
        //Request the data from the web service, Here you have to change it for your local ip
        request.open("POST", "http://192.168.1.110:3000/api/models/" + $.inserTxtF.value);
        //      var params = ({"id": $.inserTxtF.value});
        //      console.log ('lo que tiene params ', params);
        request.send();
    } else {
        alert("Please write something in the textbox");
    }
    $.inserTxtF.value = "";
};

function rowClick(e) {
    alert(e.index);
};


$.mainTabGroup.open();
