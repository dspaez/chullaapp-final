$(window).load(function(){
  
  

  $("#sendImg").click(function() {
    var API_KEY = "AIzaSyCGyZenFVHB3v9pmjLIc-7iSeT49kw4eKg";
    var CV_URL = 'https://vision.googleapis.com/v1/images:annotate?key=' + API_KEY;


    $.ajax({
      url: CV_URL,
      type: 'POST',
      data: JSON.stringify(request),
      contentType: 'application/json'
    }).success(function(data) {
      console.log(monumentosQuito[data.responses[0].landmarkAnnotations[0].mid]["texto"]);
      console.log(request);
     
    }).done(displayJSON)
    .error(function(){

    })
    
  });

  $('#inputImg').change(function(e) {
    addImage(e);

  });

  function addImage(e){
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = fileOnload;
    reader.readAsDataURL(file);
  }

  function fileOnload(e) {
    var content=e.target.result;
    $('#outputImg').attr("src",content);
    sendFileCloudVision(content.replace('data:image/jpeg;base64,', ''));
  }

//Envía los contenidos del archivo dado a la API de Cloud Vision y genera el resultado.
  function sendFileCloudVision (content) {
   request = {
    requests: [{
      image: {
        content: content        
      },
      features: [{
        type:"LANDMARK_DETECTION",
        maxResults: 200
      }]
    }]
  };
}

function displayJSON (data) {
  var resultado = monumentosQuito[data.responses[0].landmarkAnnotations[0].mid]["texto"];
  $('#results').text(resultado);
  var evt = new Event('results-displayed');
  evt.results = resultado;
  document.dispatchEvent(evt);
}

});

