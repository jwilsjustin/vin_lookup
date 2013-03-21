function badVin(){
  $('.enter-vin').remove()
  $('#vehicle').prepend('<div class="bad-vin"><h3>Nothing found.</h3><h6>Check to see if the VIN is right.<br />Or that might be an old vehicle.</h6></div>')
  $('#vehicle h2, #vin-illustration, p#longTime').remove();
}

function loadingState() {
  $('.bad-vin, .enter-vin').remove()
  $('#vehicle').prepend("<h2 class='loading'><img src='/images/loader.gif' /> Searching. . . </h2><p id='longTime'>Taking a long time? You might have entered a bad VIN. Or the remote request is being slow.</p>");
  $('#vehicleImage').html("")
  $('#longTime').delay(4000).fadeIn(1);
  $('.subtle').remove();
}

$(document).ready(function () {
  
  var baseURI           = 'http://api.edmunds.com/v1/api';
  var requestTypeVIN    = '/toolsrepository/vindecoder?';
  var requestTypePhoto  = '/vehiclephoto/service/findphotosbystyleid?';
  var apiKey            = 'yupau4ndgakp2eczn5yx7pay';
  var vehicleStyleID    = '';

  $('#vin').focus(function () {
    var full = $("#vehicle").has("p").length ? true : false;
    if (full == true) {
      $("#vin").focus(function() { $(this).select() });
      $("#vin").mouseup(function(e){
        e.preventDefault();
      });
    }
  });

  // API REQUEST FOR VEHICLE IMAGE
  function imageRequest(styleid) {
    var imageAbrev = "FQ"
    $.getJSON( baseURI + requestTypePhoto + 'styleId=' + styleid + "&fmt=json&api_key=" + apiKey + "&callback=?", function (imageJSON) {
      console.log(imageJSON);
      if (imageJSON != "Nothing found.") {
        var FQobj = $.grep(imageJSON, function(e){ return e.shotTypeAbbreviation == imageAbrev; });
        console.log(FQobj)
        $('#vehicleImage').append('<img src="http://media.ed.edmunds-media.com/' + FQobj[0]['photoSrcs'][0] + '" class="scale-with-grid"/>');
      } else {
        $('#vehicleImage').html('<h2 class="loading">Image Not Found</h2>');
      }
    });
  }

  var getVehicle = function () {
    var vin = $('#vin').val();
    if (vin == '') {
      $('#vehicle').html("<h4 class='enter-vin'>Enter a VIN please</h4>");
    } else {
      // EXECUTE LOADING STATE
      loadingState()
      // API REQUEST FOR VEHICLE
      $.getJSON( baseURI + requestTypeVIN + 'vin=' + vin + "&fmt=json&api_key=" + apiKey + "&callback=?", function (vehicleJSON) {
        console.log(vehicleJSON);
        if (vehicleJSON['styleHolder'] == undefined) {
          // EXECUTE badVin FUNCTION
          badVin();
        }
        else if (vehicleJSON['styleHolder'].length == 0) {
          // EXECUTE badVin FUNCTION
          badVin();
        }
        else if (vehicleJSON['styleHolder'].length > 0) {
          $('#vehicle h2, #vin-illustration, p#longTime, .bad-vin, .enter-vin').remove();
          $('#vehicle').prepend('<h2 class="loading">Found:</h2><hr/>');
          $('#make').html(vehicleJSON['styleHolder'][0]['makeName']);
          $('#model').html(vehicleJSON['styleHolder'][0]['modelName']);
          $('#year').html(vehicleJSON['styleHolder'][0]['year']);
          $('#features').html(vehicleJSON['styleHolder'][0]['name']);
          $('#usedRetail .alpha').html("Used Retail:");
          $('#usedRetail .omega strong').html('$'+vehicleJSON['styleHolder'][0]['price']['usedTmvRetail']);
          $('#usedPPV .alpha').html("Used Private Party:");
          $('#usedPPV .omega strong').html('$'+vehicleJSON['styleHolder'][0]['price']['usedPrivateParty']);
          $('#usedTrade .alpha').html("Used Trade-In:");
          $('#usedTrade .omega strong').html('$'+vehicleJSON['styleHolder'][0]['price']['usedTradeIn']);
          // GET EDMUNDS STYLE ID FOR USE IN GETTING THE STOCK PHOTO
          var vehicleStyleID = vehicleJSON['styleHolder'][0]['attributeGroups']['LEGACY']['attributes']['ED_STYLE_ID']['value'];
          // EXECUTE imageRequest FUNCTION
          imageRequest(vehicleStyleID)
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
