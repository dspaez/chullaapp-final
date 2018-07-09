var app = {
    // Application Constructor
    initialize: function() {
      document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    //Este evento indica que las API del dispositivo de Cordova se han cargado y están listas para acceder
    onDeviceReady: function() {
   },

    receivedEvent: function(id) {
    }
  };

  app.initialize();


  var request = {};

  //Puntos de ubicacion para el marcador en la fotografia
    var x1 = 0;
    var y1 = 0;
    var x2 = 0;
    var y2 = 0;
    var y3 = 0;
    //dimensiones del canvas
    var wCanvas;
    var hCanvas;
    
    

  //Funcion la cual me habilita la camara del dispositivo para tomar una fotografia
  function cameraTakePicture() {
    navigator.camera.getPicture(onSuccess, onFail, { 
      quality: 50, //Calidad de la imagen guardada
      destinationType: Camera.DestinationType.DATA_URL, //Devuelve la imagen como una cadena codificada en base64
      sourceType: Camera.PictureSourceType.CAMERA //Establece la fuente de la imagen en este caso la camara del dispositivo.
    });

    //Función de devolución de llamada que proporciona los datos de imagen.
    function onSuccess(imageData) { //ImageData: Codificación Base64 de los datos de imagen
      var image = document.getElementById('outputImg'); //Obtiene el Id HTML  
      image.src = "data:image/jpeg;base64," + imageData; //Muestra la Imagen en el ID obtenido
      var content = imageData;
      sendFileCloudVision(content); 
      //Llama a la funcion SendFileCloudVision y pasa como parametro la imagen en Base64 obtenida
      ajax(); //Llama a la funcion ajax
    }

    //Función de devolución de llamada que proporciona un mensaje de error.
    function onFail() {
      alert('Imagen No Cargada Correctamente');
    }
  }

  //Funcion la cual me permite acceder a la galeria de imagenes del dispositivo
  function chooseFile() {
    navigator.camera.getPicture(onSuccess, onFail, { 
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM 
      //Establece la fuente de la imagen en este caso las fotografias encontradas en el dispositivo.
    });

    function onSuccess(imageData) {
      var image = document.getElementById('outputImg');
      image.src = "data:image/jpeg;base64," + imageData;
      var content = imageData;
      sendFileCloudVision(content);
      ajax();
    }

    function onFail(message) {
      alert('Imagen No Cargada Correctamente');
    }
  }

  //Funcion Ajax que me realiza la peticion POST al Servidjor
  function ajax() {
    var API_KEY = "AIzaSyCGyZenFVHB3v9pmjLIc-7iSeT49kw4eKg"; 
    var CV_URL = 'https://vision.googleapis.com/v1/images:annotate?key=' + API_KEY;
    $.ajax({
      url: CV_URL,//Hacia donde deseamos enviar la peticion
      type: 'POST', //Tipo de Peticion es POST
      data: JSON.stringify(request), 
      //El metodo JSON.stringify() convierte un valor dado en javascript a una cadena  JSON.
      contentType: 'application/json'
    })
    .success(function(data){


      if (data.responses[0].landmarkAnnotations != undefined){

         var mid_vision = data.responses[0].landmarkAnnotations[0].mid;
         console.log(mid_vision);
         $.ajax({
          url: 'http://church.cs.us.es:8009/api/v1/monumentosquito/?mid__icontains='+ mid_vision + '&format=json' ,
          type: 'GET',
          accepts: 'application/json',
          dataGet: 'json'
        }).success(function(dataGet){
          getData(dataGet);
          myCanvas(x1,y1);
          displayJSON(dataGet); //Muestra los datos
        })
      } else {

        console.log('ENTRO AL ELSE');
        $.ajax({
              url: 'http://church.cs.us.es:8009/api/v1/monumentosquito/?format=json' ,
              type: 'GET',
              accepts: 'application/json',
              dataGet2: 'json'

            }).success(function(dataGet2){

              var dataweb = data.responses[0].webDetection.webEntities;
              console.log(dataweb);
              var datadjango = dataGet2.objects;

              var arraydatosvision = [];
              var arraydatosdjango = [];

              $.each(dataweb, function( i, item ) {
                var datosVision = dataweb[i].entityId;
                arraydatosvision.push(datosVision);
                
              });

              console.log(arraydatosvision);

               $.each(datadjango, function( j, itema ) {
                var datosDjango = datadjango[j].mid;
                arraydatosdjango.push(datosDjango);
              });

               console.log(arraydatosdjango);

               var str='';
                for(var i=0;i<arraydatosvision.length;i++){
                  if(arraydatosdjango.indexOf(arraydatosvision[i]) != -1){
                    str+=arraydatosvision[i];
                  };
                }

                console.log(str)

                $.ajax({
                url: 'http://church.cs.us.es:8009/api/v1/monumentosquito/?mid__icontains='+str+'&format=json' ,
                type: 'GET',
                accepts: 'application/json',
                dataGet3: 'json'

              }).success(function(dataGet3){
                getData2(dataGet3);
                myCanvas(x1,y1);
                displayJSON2(dataGet3);
              })  

            })

      }
    }) 
  }

  //Envía los contenidos del archivo dado a la API de Cloud Vision y genera el resultado.
  function sendFileCloudVision (content) {
    request = {
      requests: [{
        image: {
          content: content        
        },
        features: [
        {
          type:"LANDMARK_DETECTION",
          maxResults: 200
        },
        {
          type:"WEB_DETECTION",
          maxResults:200
        }
        ]
      }]
    };
  }

//Muestra los resultados
  function displayJSON (dataGet) {
    var resultado = dataGet.objects[0].nombre_monumento;
    $('#nombre').text(resultado);
    var evt = new Event('results-displayed');
    evt.result7s = resultado;
    document.dispatchEvent(evt);
  }

  function displayJSON2 (dataGet3) {
    var resultado = dataGet3.objects[0].nombre_monumento;
    $('#nombre').text(resultado);
    var evt = new Event('results-displayed');
    evt.result7s = resultado;
    document.dispatchEvent(evt);
  }



  //Funcion para asignar que elementos dibujar en el elemento canvas de pag2.html, 
  //La funcion recibe dos parametros que son los puntos de ubicacion en donde se dibuja un marcado de ubicacion
  function myCanvas (x1, y1){
   wCanvas = document.getElementById("myCanvas").width;
   hCanvas = document.getElementById("myCanvas").height;
  var c = document.getElementById("myCanvas"); //captura el elemento con el id myCanvas
  var ctx = c.getContext("2d");
  var img = document.getElementById("outputImg"); //captura en un objeto el elemnto del id de la imagen a reconocer
  ctx.drawImage(img,0,0,wCanvas,hCanvas);                         //dibuja la imagen almacenada de la etiqueta outputImg en la posicion 0,0
  var img2 = document.getElementById("marcador"); //captura el elemento en donde se dibujara el marcador
  ctx.drawImage(img2,x1,y1); //ubica el marcador dentro de la imagen de acuerdo a los puntos de referencia resultantes del reconocimiento
}

//Funcion para obtener los datos del diccionario almacenado en datos.js de acuerdo a la imagen a reconocer
function getData(dataGet){

  var wImg = document.getElementById("outputImg").width;
  var hImg = document.getElementById("outputImg").height;

  //almacenamiento de los puntos de referencia resultantes del reconocimiento de la imagen para 
  //posteriormente dibujar el marcador de ubicacion dentro de la imagen
  //x1 = data.responses[0].landmarkAnnotations[0].boundingPoly.vertices[0].x;
  //y1 = data.responses[0].landmarkAnnotations[0].boundingPoly.vertices[0].y;
  //x2 = data.responses[0].landmarkAnnotations[0].boundingPoly.vertices[1].x;
  //y2 = data.responses[0].landmarkAnnotations[0].boundingPoly.vertices[1].y;
  //y3 = data.responses[0].landmarkAnnotations[0].boundingPoly.vertices[2].y;

  x1 = 826;
  y1 = 337;

  //x1 = (x1 + x2) / 2;
  //x1 = x1 - (wImg - wCanvas);
  //y1 = y1 - (hImg - hCanvas);
  //y1 = (y1 + y3) / 2;
  //console.log(x1);

  //Imagen antigua
  var urlA = document.getElementById("outputImg2");
  var ruta = dataGet.objects[0].imagen_antigua;
  urlA.src = "http://church.cs.us.es:8009"+ ruta;

  //Texto de informacion
  var descripcion = dataGet.objects[0].descripcion_monumento;
  $("#descripcion").text(descripcion);

}

function getData2(dataGet3){

  var wImg = document.getElementById("outputImg").width;
  var hImg = document.getElementById("outputImg").height;

  //almacenamiento de los puntos de referencia resultantes del reconocimiento de la imagen para 
  //posteriormente dibujar el marcador de ubicacion dentro de la imagen
  //x1 = data.responses[0].landmarkAnnotations[0].boundingPoly.vertices[0].x;
  //y1 = data.responses[0].landmarkAnnotations[0].boundingPoly.vertices[0].y;
  //x2 = data.responses[0].landmarkAnnotations[0].boundingPoly.vertices[1].x;
  //y2 = data.responses[0].landmarkAnnotations[0].boundingPoly.vertices[1].y;
  //y3 = data.responses[0].landmarkAnnotations[0].boundingPoly.vertices[2].y;

  x1 = 826;
  y1 = 337;

  //x1 = (x1 + x2) / 2;
  //x1 = x1 - (wImg - wCanvas);
  //y1 = y1 - (hImg - hCanvas);
  //y1 = (y1 + y3) / 2;
  //console.log(x1);

  //Imagen antigua
  var urlA = document.getElementById("outputImg2");
  var ruta = dataGet3.objects[0].imagen_antigua;
  urlA.src = "http://church.cs.us.es:8009"+ ruta;

  //Texto de informacion
  var descripcion = dataGet3.objects[0].descripcion_monumento;
  $("#descripcion").text(descripcion);

}


