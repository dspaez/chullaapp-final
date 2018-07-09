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

var carousel;
$(document).ready(function () {

    carousel = $("#frame ul");

    carousel.itemslide({
        one_item: true // Establece esto para una navegación adecuada a pantalla completa
    }); //initialize itemslide

    $(window).resize(function () {
        carousel.reload();

    }); // Recalcula el ancho y centre las posiciones y los tamaños cuando se cambia el tamaño de la ventana
});
