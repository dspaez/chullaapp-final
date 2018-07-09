   var app = {
        // Application Constructor
        initialize: function() {
          document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
      },


        //Este evento indica que las API del dispositivo de Cordova se han cargado y están listas para acceder
        onDeviceReady: function() {

         startCamera();

         setupMap();
         startAccelerometer();
         startCompass();
         startGeolocation();
     },

       // Update DOM on a Received Event
       receivedEvent: function(id) {

       }
   };

   app.initialize();

   //Variable donde se almacenan los nombres, latitudes y longitudes de los monumentos a mostrar
   var pin = [
    {"name":"Iglesia de San Francisco", "lat":"-0.220371", "lng":"-78.515290"},
    {"name":"Basilica del Voto Nacional", "lat":"-0.214652", "lng":"-78.507109"},
    {"name":"Palacio Carondelet", "lat":"-0.219686", "lng":"-78.512701"},
    {"name":"Iglesia La Merced", "lat":"-0.217944", "lng":"-78.513561"},
    {"name":"Teatro Sucre", "lat":"-0.219096", "lng":"-78.508890"},
    {"name":"Iglesia Santo Domingo", "lat":"-0.224135", "lng":"-78.512579"},
    {"name":"Mitad del Mundo", "lat":"-0.002162", "lng":"-78.455417"}
]; 

var markersArray = [], bounds;
var myLat = 0, myLng = 0; 
var bearing, distance;
var dataStatus = 0; 
var cont = 0;


   function startCamera() {
    ezar.initializeVideoOverlay(
        function() {
            ezar.getBackCamera().start();
        },
        function(error) {
            alert("ezar initialization failed");
        });
}  

// Preparar el Google Maps API  
function setupMap(){
    $("#map").height($(window).height()-60);
    var mapOptions = { //Habilitar o desabilitar controles al mapa      
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        navigationControl: true,
        scrollwheel: false,
        navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
        mapTypeId: google.maps.MapTypeId.ROADMAP //Defino el tipo de mapas a mostrar
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions); //define una variable (llamada map) y la asigna a un nuevo objeto Map. La función Map() Crea un nuevo mapa dentro del contenedor HTML en cuestión (que normalmente es un elemento DIV) mediante la transferencia de parámetros (opcionales).
}        


// alternar entre la vista de lista y la vista de mapa        
function toggleView(){
    if($(".listView").is(":visible")){
        $(".listView").hide();
        $("#map").height($(window).height()-60);
        $(".mapView").fadeIn(
            function(){
                google.maps.event.trigger(map, "resize"); //activar este evento en el mapa cuando el div cambie de tamaño
                map.fitBounds(bounds);}); //Establece la ventana gráfica para que contenga los límites dados.
        $("#viewbtn").html("Lugares");
    } else {
        $(".mapView").hide();
        $(".listView").fadeIn();
        $("#viewbtn").html("Visualizar Mapa");
    }
}
// Obtener datos de API y almacenar en una matriz, agregar a la vista de lista y crear marcadores en el mapa, calcular      
function loadData(){
    dataStatus = "loading";
    markersArray = [];
    bounds = new google.maps.LatLngBounds();
    var latlong = new google.maps.LatLng(myLat, myLng); //Un LatLng es un punto en coordenadas geográficas: latitud y longitud.

    // Agregar marcador gps azul
    var icon = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png'
    var gpsMarker = new google.maps.Marker({position: latlong, map: map, title: "My Position", icon:icon}); //Agrega el marcador a mi posicion en el mapa
    bounds.extend(latlong); //Extiende estos límites para contener el punto dado.
    markersArray.push(gpsMarker);//Ingresa el marcador al Array de Marcadores

    // Agregar todos los marcadores de ubicación para mapear y mostrar vista y matriz
    for(var i=0; i< pin.length; i++){
        $(".listItems").append("<div class='item'>"+pin[i].name+"</div>"); //Agrega los Pin a la lista de items
        addMarker(i); //Funcion AddMarker
        relativePosition(i); //Funcion RelativePosition
    }
    map.fitBounds(bounds); //Establece la ventana gráfica para que contenga los límites dados.
    google.maps.event.trigger(map, "resize"); //activar este evento en el mapa cuando el div cambie de tamaño
    dataStatus = "loaded";   
}


// Agregar marcador al mapa y al array de marcadores      
function addMarker(i){
    var latlongpin = new google.maps.LatLng(pin[i].lat, pin[i].lng);
    var marker = new google.maps.Marker({position: latlongpin, map: map, title: pin[i].name}); //Agrega el marcador a mi posicion en el mapa
    bounds.extend(latlongpin); //Extiende estos límites para contener el punto dado.
    markersArray.push(marker); //Ingresa el marcador al Array de Marcadores 
} 

// Borrar todos los marcadores del mapa y del array       
function clearMarkers() {
    while (markersArray.length) {
        markersArray.pop().setMap(null); //Quita los marcadores del array y los elimina del mapa
    }
}        
// calculó la distancia para cada uno de los puntos  gps lat / lng  mediante la formula de Haversine     
function relativePosition(i){
    //Variables donde se almacena la Latitud y Longitud de los Lugares Turisticos
    var pinLat = pin[i].lat;
    var pinLng = pin[i].lng;

    //Calcula la distacia y las convierte a Radianes
    var dLat = (myLat-pinLat)* Math.PI / 180;
    var dLon = (myLng-pinLng)* Math.PI / 180;

    //Convierte a Radianes las coordenadas de los Pin
    var lat1 = pinLat * Math.PI / 180;
    var lat2 = myLat * Math.PI / 180;

    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);

    bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = bearing + 180;
    pin[i]['bearing'] = bearing;
    
    //Mediante la formula de Haversine se calculan la distancia entre dos puntos geograficos
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    distance = 3958.76  * c;
    distance = distance * 1.60934; //el resultado arrojado en millas se le multiplica por 1.60934 para que sea kilometros
    pin[i]['distance'] = distance;
}

// Calcula direccion de puntos y los muestray        
function calculateDirection(degree){
    var detected = 0;

    //Variable del html donde se mostraran los pin
    $("#spot").html("");

    //Realiza un recorrido por los pin (lugares)ingresados
    for(var i=0;i<pin.length;i++){
        if(Math.abs(pin[i].bearing - degree) <= 20){

            var away = pin[i].distance.toFixed(2); //Redondea a 2 decimales
            var fontSize, fontColor;
            
            // tamaño de letra basado en la distancia desde la ubicación gps
            if(pin[i].distance>10){ //Distancia mayor a 10km
                fontSize = "24";
                fontColor = "#fff";
            } else if(pin[i].distance>1){ //Distancia mayor a 1km
                fontSize = "16";
                fontColor = "#aaa";
            } else {
                fontSize = "30";
                fontColor = "#eee";
            }
            $("#spot").append('<div class="name" data-id="'+i+'" style="margin-left:'+(((pin[i].bearing - degree) * 5)+50)+'px;width:'+($(window).width()-100)+'px;font-size:'+fontSize+'px;color:'+fontColor+'">'+pin[i].name+'<div class="distance"> a  ' +  away + ' Km de distancia</div></div>'); //Que se me mostrara en la etiqueta dependiendo de la distancia
            detected = 1;
        } else {
            if(!detected){
                $("#spot").html("");
            }
        }
    }
    
} 
        
// Comienza a mirar la geolocalización       
function startGeolocation(){
    var options = { timeout: 30000 }; //Lanzar un error si no se recibe una actualización cada 30 segundos
    watchGeoID = navigator.geolocation.watchPosition(onGeoSuccess, onGeoError, options);
}
        
// Deja de mirar la geolocalización
function stopGeolocation() {
    if (watchGeoID) {
        navigator.geolocation.clearWatch(watchGeoID);
        watchGeoID = null;
    }
}
        
// onSuccess: obtiene la ubicación actual
function onGeoSuccess(position) {
    document.getElementById('geolocation').innerHTML = 'Latitude: ' + position.coords.latitude + '<br />' + 'Longitude: ' + position.coords.longitude;
    myLat = position.coords.latitude;
    myLng = position.coords.longitude;
    if(!dataStatus){
        loadData();
    }
}
// onError: Error al obtener la ubicación
function onGeoError(error) {

   if (cont == 0) {
        alert('Su Dispositivo no tiene activada la Geolocalización o no existe ');
        confirm('Esta función no trabajará correctamente');
        cont ++
    }
} 
    
// Comienza a mirar la brújula
function startCompass() {
    var options = { frequency: 100 }; //Con qué frecuencia recuperar el título de la brújula en milisegundos. 
    watchCompassID = navigator.compass.watchHeading(onCompassSuccess, onCompassError, options);
}
// Deja de mirar la brújula
function stopCompass() {
    if (watchCompassID) {
        navigator.compass.clearWatch(watchCompassID);
        watchCompassID = null;
    }
}
// onSuccess: Obtiene el titulo actual
function onCompassSuccess(heading) {
    var directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
    var direction = directions[Math.abs(parseInt((heading.magneticHeading) / 45) + 1)]; //almace correspondiente deacuerdo a losgrados de 0-359.99 en un solo momento en el tiempo 
    document.getElementById('compass').innerHTML = heading.magneticHeading + "<br>" + direction; //Cambia el nombre correspondiente en la etiqueta HTML
    document.getElementById('direction').innerHTML = direction;//Cambia la direccion 
    
    var degree = heading.magneticHeading; //El título en grados de 0-359.99 en un solo momento en el tiempo
    if($("#arView").is(":visible") && dataStatus != "loading"){//Si la RA estav visible
        calculateDirection(degree); //Calcula la direccion a donde se encuentra apuntando la brujula
    }
}
// onError: Error al obtener el heading
function onCompassError(compassError) {
    
    if (cont == 0) {
        alert('Su Dispositivo no tiene activada la Brújula o no existe ');
        confirm('Esta función no funcionará correctamente');
        cont ++
    }
    
}        
        
// Comienza a verificar el acelerómetror
function startAccelerometer() {
    var options = { frequency: 100 }; //Actualiza la aceleración cada 0.1 segundos
    watchAccelerometerID = navigator.accelerometer.watchAcceleration(onAccelerometerSuccess, onAccelerometerError, options);  //recupera la aceleración actual del dispositivo en un intervalo regular,
}
// Deja de revisar el acelerómetro
function stopAccelerometer() {
    if (watchAccelerometerID) {
        navigator.accelerometer.clearWatch(watchAccelerometerID);
        watchAccelerometerID = null;
    }
}
// onSuccess: Obtiene los valores actuales del acelerómetro
function onAccelerometerSuccess(acceleration) {
    // para fines de depuración para imprimir los valores del acelerometro
    var element = document.getElementById('accelerometer');
    element.innerHTML = 'Acceleration X: ' + acceleration.x + '<br />' +
                        'Acceleration Y: ' + acceleration.y + '<br />' +
                        'Acceleration Z: ' + acceleration.z ;

    if(acceleration.y > 7){ //Si el acelerometro en y es mayor a 7
        $("#arView").fadeIn();//Muestra la vista de RA
        $("#topView").hide();//Oculta la vista de elementos 

        document.getElementById('body').style.background = "transparent";
    } else {
        $("#arView").hide(); //Oculta la RA
        $("#topView").fadeIn(); //Muestra la vista de elementos
        document.getElementById('body').style.background = "#0d4d59";
    }
}
// onError: Error al obtener la aceleración
function onAccelerometerError() {
   if (cont == 0) {
        alert('Su Dispositivo no tiene activado el Acelerómetro o no existe ');
        confirm('Esta función no funcionará correctamente');
        cont ++
    }
}
