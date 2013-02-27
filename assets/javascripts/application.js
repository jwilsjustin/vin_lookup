$(document).ready(function () {
  
  $('#vin').focus(function () {
    var full = $("#vehicle").has("p").length ? true : false;
    if (full == true) {
      $("#vin").focus(function() { $(this).select() });
      $("#vin").mouseup(function(e){
        e.preventDefault();
      });
    }
  });

  var getVehicle = function () {
    
    var vin               = $('#vin').val();
    var baseURI           = 'http://api.edmunds.com/v1/api';
    var requestTypeVIN    = '/toolsrepository/vindecoder?';
    var requestTypePhoto  = '/vehiclephoto/service/findphotosbystyleid?';
    var apiKey            = 'yupau4ndgakp2eczn5yx7pay';
    var vehicleStyleID    = 'x'

    if (vin == '') {
      $('#vehicle').html("<h4 class='loading'>Enter a VIN please</h4>");
    } else {

      // LOADING STATE
      $('#vehicle').html("<h2 class='loading'><img src='/images/loader.gif' /> Searching. . . </h2><p id='longTime'>Taking a long time? You might have entered a bad VIN. Or the remote request is being slow.</p>");
      $('#vehicleImage').html("")
      $('#longTime').delay(4000).fadeIn(1);
      $('.subtle').remove();
      
      // API REQUEST FOR VEHICLE
      $.getJSON( baseURI + requestTypeVIN + 'vin=' + vin + "&fmt=json&api_key=" + apiKey + "&callback=?", function (json) {
        console.log(json);
        if (json['styleHolder'] == undefined) {
          $('#vehicle').html('<h4>Nothing found.<br />Check to see if the VIN is right.</h4>');
        }
        else if (json['styleHolder'].length == 0) {
          $('#vehicle').html('<h4>Couldn\'t find that car. It might be old.</h4>');
        }
        else if (json['styleHolder'].length > 0) {
          $('#vehicle').html('<h2 class="loading">Found:</h2><hr/><p>' 
            + json['styleHolder'][0]['makeName'] 
            + '</p><p>' 
            + json['styleHolder'][0]['modelName'] 
            + '</p><p>' 
            + json['styleHolder'][0]['year']
            + '</p><p>Transmision: ' 
            + json['styleHolder'][0]['transmissionType']
            + '</p><p> Private Party Value: ' 
            + json['styleHolder'][0]['price']['usedPrivateParty']
            + '</p><p> TMV Retail: ' 
            + json['styleHolder'][0]['price']['usedTmvRetail']
            + '</p><p> Trade-in Value: ' 
            + json['styleHolder'][0]['price']['usedTradeIn']
            + '</p>');
          var vehicleStyleID = json['styleHolder'][0]['attributeGroups']['LEGACY']['attributes']['ED_STYLE_ID']['value'];
          // API REQUEST FOR VEHICLE IMAGE
          $.getJSON( baseURI + requestTypePhoto + 'styleId=' + vehicleStyleID + "&fmt=json&api_key=" + apiKey + "&callback=?", function (json) {
            console.log(json);
            if (json != "Nothing found.") {
              $('#vehicleImage').append('<img src="http://media.ed.edmunds-media.com/' + json[2]['photoSrcs'][0] + '" class="scale-with-grid"/>');
            } else {
              $('#vehicleImage').html('<h2 class="loading">Image Not Found</h2>');
            }
          });
        }
      });
    }
    return false;
  }

  // BIND CLICK AND ENTER EVENTS
  $('#search').click(getVehicle);
  $('#vin').keyup(function (event) {
    if (event.keyCode == 13) {
      getVehicle();
    }
  });

});
