function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function mandarProducir(e) {
        var quantity;
        "fresa" == e.source.fruta ? quantity = $.fresaTextField.value : "pina" == e.source.fruta ? quantity = $.pinaTextField.value : "kiwi" == e.source.fruta && (quantity = $.kiwiTextField.value);
        console.log("cuantity es " + quantity);
        var sendProducir = Ti.Network.createHTTPClient({
            onerror: function(e) {
                Ti.API.debug(e.error);
                alert("There was an error during the connection");
            },
            timeout: 1e3
        });
        sendProducir.open("post", "http://" + ip + ":3050/api/distribuidora/" + e.source.usuario + "/mandarproducir");
        var parameterProducir = {
            type: e.source.fruta,
            quantity: quantity
        };
        sendProducir.send(parameterProducir);
        sendProducir.onload = function() {
            var json = JSON.parse(this.responseText);
            if ("failed" == json.status) alert(json.reason); else {
                console.log(json);
                alert("Se han mandado a producir " + json.quantity + " de " + json.fruta);
            }
        };
    }
    function pedirUno(e) {
        var senduno = Ti.Network.createHTTPClient({
            onerror: function(e) {
                Ti.API.debug(e.error);
                alert("There was an error during the connection");
            },
            timeout: 1e3
        });
        senduno.open("POST", "http://" + ip + ":3050/api/distribuidora/comprarfruta");
        var parameterCompra = {
            fruta: e.source.parametro
        };
        senduno.send(parameterCompra);
        senduno.onload = function() {
            var json = JSON.parse(this.responseText);
            console.log(json);
            if ("failed" == json.status) ; else {
                var senddos = Ti.Network.createHTTPClient({
                    onerror: function(e) {
                        Ti.API.debug(e.error);
                    },
                    timeout: 1e3
                });
                senddos.open("POST", "http://" + ip + ":3000/api/kiwitienda/guardarfuta");
                console.log(json.fruta);
                var parameterComprado = {
                    _id: json.fruta._id,
                    fruta: json.fruta.type
                };
                senddos.send(parameterComprado);
                senddos.onload = function() {
                    var jsonAux = JSON.parse(this.responseText);
                    "failed" == jsonAux.status ? alert(jsonAux.reason) : getTodoList(jsonAux.fruta.type);
                };
            }
        };
    }
    function getTodoList(fruta) {
        var dataArray = [];
        var sendit = Ti.Network.createHTTPClient({
            onerror: function(e) {
                Ti.API.debug(e.error);
                alert("There was an error during the connection");
            },
            timeout: 1e3
        });
        sendit.open("GET", "http://" + ip + ":3000/api/kiwitienda/obtenertodas/" + fruta);
        sendit.send();
        sendit.onload = function() {
            var json1;
            var json2;
            var json3;
            var tamano;
            if ("fresa" == fruta) {
                json1 = JSON.parse(this.responseText);
                tamano = json1.length;
            }
            if ("pina" == fruta) {
                json2 = JSON.parse(this.responseText);
                tamano = json2.length;
            }
            if ("kiwi" == fruta) {
                json3 = JSON.parse(this.responseText);
                tamano = json3.length;
            }
            console.log("LLEGAAAAAA ");
            console.log("El responseText fue: \n********************", this.responseText + "\n********************");
            if (0 == tamano) {
                if ("fresa" == fruta) {
                    $.tableViewFresa.headerTitle = "There are no fruits in our " + fruta + " stock";
                    $.tableViewFresa.setData([]);
                }
                if ("pina" == fruta) {
                    $.tableViewPina.headerTitle = "There are no fruits in our " + fruta + " stock";
                    $.tableViewPina.setData([]);
                }
                if ("kiwi" == fruta) {
                    $.tableViewKiwi.headerTitle = "There are no fruits in our " + fruta + " stock";
                    $.tableViewKiwi.setData([]);
                }
            }
            dataArray = [];
            for (var i = 0; tamano > i; i++) if ("fresa" == fruta) {
                var row = Ti.UI.createTableViewRow({
                    hasCheck: false,
                    color: "#ffffff",
                    height: 80
                });
                var vender = Titanium.UI.createImageView({
                    image: venderImg,
                    width: 64,
                    height: iconHeight,
                    right: 20,
                    top: iconTop
                });
                vender.miId = json1[i].value._id;
                vender.addEventListener("click", function(e) {
                    var sendUpdate = Ti.Network.createHTTPClient({
                        onerror: function(e) {
                            Ti.API.debug(e.error);
                            alert("There was an error during the connection");
                        },
                        timeout: 1e3
                    });
                    console.log("El ID es " + e.source.miId);
                    var params = {
                        _id: e.source.miId
                    };
                    sendUpdate.open("PUT", "http://" + ip + ":3000/api/kiwitienda/venderfruta");
                    sendUpdate.send(params);
                    sendUpdate.onload = function() {
                        getTodoList(fruta);
                    };
                });
                var noVender = Titanium.UI.createImageView({
                    image: _venderImg,
                    width: 64,
                    height: iconHeight,
                    right: 20,
                    top: iconTop
                });
                var despachar = Titanium.UI.createImageView({
                    image: despacharImg,
                    width: 64,
                    height: iconHeight,
                    right: 104,
                    top: iconTop
                });
                var nombre = Titanium.UI.createLabel({
                    text: json1[i].value.fruta + "  " + json1[i].value._id.substr(json1[i].value._id.length - 3),
                    font: {
                        fontSize: 12,
                        fontWeight: "bold"
                    },
                    width: "auto",
                    textAlign: "left",
                    bottom: 42,
                    left: 20,
                    height: 12
                });
                despachar.miID = json1[i].value._id;
                despachar.addEventListener("click", function(e) {
                    var sendDelete = Ti.Network.createHTTPClient({
                        onerror: function(e) {
                            Ti.API.debug(e.error);
                            alert("There was an error during the connection");
                        },
                        timeout: 1e3
                    });
                    console.log("El ID es " + e.source.miID);
                    var params = {
                        _id: e.source.miID
                    };
                    sendDelete.open("PUT", "http://" + ip + ":3000/api/kiwitienda/despacharfruta");
                    sendDelete.send(params);
                    sendDelete.onload = function() {
                        getTodoList(fruta);
                    };
                });
                row.add(nombre);
                if ("disponible" == json1[i].value.status) row.add(vender); else {
                    row.add(noVender);
                    row.add(despachar);
                }
                dataArray.push(row);
                $.tableViewFresa.setData(dataArray);
            } else if ("pina" == fruta) {
                var row = Ti.UI.createTableViewRow({
                    title: json2[i].value.fruta,
                    hasCheck: false,
                    color: "#ffffff",
                    height: 80
                });
                var vender = Titanium.UI.createImageView({
                    image: venderImg,
                    width: 64,
                    height: iconHeight,
                    right: 20,
                    top: iconTop
                });
                vender.miId = json2[i].value._id;
                vender.addEventListener("click", function(e) {
                    var sendUpdate = Ti.Network.createHTTPClient({
                        onerror: function(e) {
                            Ti.API.debug(e.error);
                            alert("There was an error during the connection");
                        },
                        timeout: 1e3
                    });
                    console.log("El ID es " + e.source.miId);
                    var params = {
                        _id: e.source.miId
                    };
                    sendUpdate.open("PUT", "http://" + ip + ":3000/api/kiwitienda/venderfruta");
                    sendUpdate.send(params);
                    sendUpdate.onload = function() {
                        getTodoList(fruta);
                    };
                });
                var noVender = Titanium.UI.createImageView({
                    image: _venderImg,
                    width: 64,
                    height: iconHeight,
                    right: 20,
                    top: iconTop
                });
                var despachar = Titanium.UI.createImageView({
                    image: despacharImg,
                    width: 64,
                    height: iconHeight,
                    right: 104,
                    top: iconTop
                });
                var nombre = Titanium.UI.createLabel({
                    text: json2[i].value.fruta + "  " + json2[i].value._id.substr(json2[i].value._id.length - 3),
                    font: {
                        fontSize: 12,
                        fontWeight: "bold"
                    },
                    width: "auto",
                    textAlign: "left",
                    bottom: 20,
                    left: 42,
                    height: 12
                });
                despachar.miID = json2[i].value._id;
                despachar.addEventListener("click", function(e) {
                    var sendDelete = Ti.Network.createHTTPClient({
                        onerror: function(e) {
                            Ti.API.debug(e.error);
                            alert("There was an error during the connection");
                        },
                        timeout: 1e3
                    });
                    console.log("El ID es " + e.source.miID);
                    var params = {
                        _id: e.source.miID
                    };
                    sendDelete.open("PUT", "http://" + ip + ":3000/api/kiwitienda/despacharfruta");
                    sendDelete.send(params);
                    sendDelete.onload = function() {
                        getTodoList(fruta);
                    };
                });
                row.add(nombre);
                if ("disponible" == json2[i].value.status) row.add(vender); else {
                    row.add(noVender);
                    row.add(despachar);
                }
                dataArray.push(row);
                $.tableViewPina.setData(dataArray);
            } else if ("kiwi" == fruta) {
                var row = Ti.UI.createTableViewRow({
                    hasCheck: false,
                    color: "#ffffff",
                    height: 80
                });
                var vender = Titanium.UI.createImageView({
                    image: venderImg,
                    width: 64,
                    height: iconHeight,
                    right: 20,
                    top: iconTop
                });
                vender.miId = json3[i].value._id;
                vender.addEventListener("click", function(e) {
                    var sendUpdate = Ti.Network.createHTTPClient({
                        onerror: function(e) {
                            Ti.API.debug(e.error);
                            alert("There was an error during the connection");
                        },
                        timeout: 1e3
                    });
                    console.log("El ID es " + e.source.miId);
                    var params = {
                        _id: e.source.miId
                    };
                    sendUpdate.open("PUT", "http://" + ip + ":3000/api/kiwitienda/venderfruta");
                    sendUpdate.send(params);
                    sendUpdate.onload = function() {
                        getTodoList(fruta);
                    };
                });
                var noVender = Titanium.UI.createImageView({
                    image: _venderImg,
                    width: 64,
                    height: iconHeight,
                    right: 20,
                    top: iconTop
                });
                var despachar = Titanium.UI.createImageView({
                    image: despacharImg,
                    width: 64,
                    height: iconHeight,
                    right: 104,
                    top: iconTop
                });
                var nombre = Titanium.UI.createLabel({
                    text: json3[i].value.fruta + "  " + json3[i].value._id.substr(json3[i].value._id.length - 3),
                    font: {
                        fontSize: 12,
                        fontWeight: "bold"
                    },
                    width: "auto",
                    textAlign: "left",
                    bottom: 42,
                    left: 20,
                    height: 12
                });
                despachar.miID = json3[i].value._id;
                despachar.addEventListener("click", function(e) {
                    var sendDelete = Ti.Network.createHTTPClient({
                        onerror: function(e) {
                            Ti.API.debug(e.error);
                            alert("There was an error during the connection");
                        },
                        timeout: 1e3
                    });
                    console.log("El ID es " + e.source.miId);
                    var params = {
                        _id: e.source.miID
                    };
                    sendDelete.open("PUT", "http://" + ip + ":3000/api/kiwitienda/despacharfruta");
                    sendDelete.send(params);
                    sendDelete.onload = function() {
                        getTodoList(fruta);
                    };
                });
                row.add(nombre);
                if ("disponible" == json3[i].value.status) row.add(vender); else {
                    row.add(noVender);
                    row.add(despachar);
                }
                dataArray.push(row);
                $.tableViewKiwi.setData(dataArray);
            }
        };
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
    if (arguments[0]) {
        {
            __processArg(arguments[0], "__parentSymbol");
        }
        {
            __processArg(arguments[0], "$model");
        }
        {
            __processArg(arguments[0], "__itemTemplate");
        }
    }
    var $ = this;
    var exports = {};
    var __defers = {};
    var __alloyId0 = [];
    $.__views.winOne = Ti.UI.createWindow({
        layout: "vertical",
        id: "winOne",
        backgroundColor: "white"
    });
    $.__views.tableViewFresa = Ti.UI.createTableView({
        id: "tableViewFresa",
        height: "80%"
    });
    $.__views.winOne.add($.__views.tableViewFresa);
    $.__views.pedirFresa = Ti.UI.createButton({
        layout: "vertical",
        title: "Pedir",
        id: "pedirFresa",
        parametro: "fresa"
    });
    $.__views.winOne.add($.__views.pedirFresa);
    pedirUno ? $.__views.pedirFresa.addEventListener("click", pedirUno) : __defers["$.__views.pedirFresa!click!pedirUno"] = true;
    $.__views.view11 = Ti.UI.createView({
        layout: "horizontal",
        width: "auto",
        height: "auto",
        id: "view11",
        backgroundColor: "white"
    });
    $.__views.winOne.add($.__views.view11);
    $.__views.fresaTextField = Ti.UI.createTextField({
        id: "fresaTextField",
        width: "150px",
        left: "20",
        hintText: "Mandar a Producir",
        backgroundColor: "white"
    });
    $.__views.view11.add($.__views.fresaTextField);
    $.__views.producirFresas = Ti.UI.createButton({
        title: "Poducir",
        id: "producirFresas",
        left: "20",
        fruta: "fresa",
        usuario: "roberto"
    });
    $.__views.view11.add($.__views.producirFresas);
    mandarProducir ? $.__views.producirFresas.addEventListener("click", mandarProducir) : __defers["$.__views.producirFresas!click!mandarProducir"] = true;
    $.__views.tab1 = Ti.UI.createTab({
        title: "Fresas",
        icon: "fresa.png",
        window: $.__views.winOne,
        id: "tab1"
    });
    __alloyId0.push($.__views.tab1);
    $.__views.winTwo = Ti.UI.createWindow({
        layout: "vertical",
        id: "winTwo",
        backgroundColor: "white"
    });
    $.__views.tableViewPina = Ti.UI.createTableView({
        id: "tableViewPina",
        height: "80%"
    });
    $.__views.winTwo.add($.__views.tableViewPina);
    $.__views.pedirFresa = Ti.UI.createButton({
        layout: "vertical",
        title: "Pedir",
        id: "pedirFresa",
        parametro: "pina"
    });
    $.__views.winTwo.add($.__views.pedirFresa);
    pedirUno ? $.__views.pedirFresa.addEventListener("click", pedirUno) : __defers["$.__views.pedirFresa!click!pedirUno"] = true;
    $.__views.view21 = Ti.UI.createView({
        layout: "horizontal",
        width: "auto",
        height: "auto",
        id: "view21",
        backgroundColor: "white"
    });
    $.__views.winTwo.add($.__views.view21);
    $.__views.pinaTextField = Ti.UI.createTextField({
        id: "pinaTextField",
        width: "150px",
        left: "20",
        hintText: "Mandar a Producir",
        backgroundColor: "white"
    });
    $.__views.view21.add($.__views.pinaTextField);
    $.__views.producirPinas = Ti.UI.createButton({
        title: "Poducir",
        id: "producirPinas",
        left: "20",
        fruta: "pina",
        usuario: "roberto"
    });
    $.__views.view21.add($.__views.producirPinas);
    mandarProducir ? $.__views.producirPinas.addEventListener("click", mandarProducir) : __defers["$.__views.producirPinas!click!mandarProducir"] = true;
    $.__views.tab2 = Ti.UI.createTab({
        title: "Piñas",
        icon: "pina.png",
        window: $.__views.winTwo,
        id: "tab2"
    });
    __alloyId0.push($.__views.tab2);
    $.__views.winThre = Ti.UI.createWindow({
        layout: "vertical",
        id: "winThre",
        backgroundColor: "white"
    });
    $.__views.tableViewKiwi = Ti.UI.createTableView({
        id: "tableViewKiwi",
        height: "80%"
    });
    $.__views.winThre.add($.__views.tableViewKiwi);
    $.__views.pedirFresa = Ti.UI.createButton({
        layout: "vertical",
        title: "Pedir",
        id: "pedirFresa",
        parametro: "kiwi"
    });
    $.__views.winThre.add($.__views.pedirFresa);
    pedirUno ? $.__views.pedirFresa.addEventListener("click", pedirUno) : __defers["$.__views.pedirFresa!click!pedirUno"] = true;
    $.__views.view31 = Ti.UI.createView({
        layout: "horizontal",
        width: "auto",
        height: "auto",
        id: "view31",
        backgroundColor: "white"
    });
    $.__views.winThre.add($.__views.view31);
    $.__views.kiwiTextField = Ti.UI.createTextField({
        id: "kiwiTextField",
        width: "150px",
        left: "20",
        hintText: "Mandar a Producir",
        backgroundColor: "white"
    });
    $.__views.view31.add($.__views.kiwiTextField);
    $.__views.producirKiwi = Ti.UI.createButton({
        title: "Poducir",
        id: "producirKiwi",
        left: "20",
        fruta: "kiwi",
        usuario: "roberto"
    });
    $.__views.view31.add($.__views.producirKiwi);
    mandarProducir ? $.__views.producirKiwi.addEventListener("click", mandarProducir) : __defers["$.__views.producirKiwi!click!mandarProducir"] = true;
    $.__views.tab3 = Ti.UI.createTab({
        title: "Kiwi",
        icon: "kiwi.png",
        window: $.__views.winThre,
        id: "tab3"
    });
    __alloyId0.push($.__views.tab3);
    $.__views.mainTabGroup = Ti.UI.createTabGroup({
        tabs: __alloyId0,
        id: "mainTabGroup"
    });
    $.__views.mainTabGroup && $.addTopLevelView($.__views.mainTabGroup);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var ip = "192.168.0.101";
    getTodoList("kiwi");
    getTodoList("fresa");
    getTodoList("pina");
    var venderImg;
    var _venderImg;
    var despacharImg;
    if ("android" == Ti.Platform.osname) {
        venderImg = "/images/vender.png";
        _venderImg = "/images/_vender.png";
        despacharImg = "/images/despachar.png";
    } else {
        venderImg = "vender.png";
        _venderImg = "_vender.png";
        despacharImg = "despachar.png";
    }
    var iconHeight = 40;
    var iconTop = 18;
    $.mainTabGroup.open();
    __defers["$.__views.pedirFresa!click!pedirUno"] && $.__views.pedirFresa.addEventListener("click", pedirUno);
    __defers["$.__views.producirFresas!click!mandarProducir"] && $.__views.producirFresas.addEventListener("click", mandarProducir);
    __defers["$.__views.pedirFresa!click!pedirUno"] && $.__views.pedirFresa.addEventListener("click", pedirUno);
    __defers["$.__views.producirPinas!click!mandarProducir"] && $.__views.producirPinas.addEventListener("click", mandarProducir);
    __defers["$.__views.pedirFresa!click!pedirUno"] && $.__views.pedirFresa.addEventListener("click", pedirUno);
    __defers["$.__views.producirKiwi!click!mandarProducir"] && $.__views.producirKiwi.addEventListener("click", mandarProducir);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;