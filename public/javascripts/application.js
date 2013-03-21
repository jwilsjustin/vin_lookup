function parseHashBangArgs(aURL) {
  aURL = aURL || window.location.href;
  var vars = {};
  var hashes = aURL.slice(aURL.indexOf('#') + 2).split('&');
  for(var i = 0; i < hashes.length; i++) {
    var hash = hashes[i].split('=');
    if(hash.length > 1) {
      vars[hash[0]] = hash[1];
    } else {
      vars[hash[0]] = null;
    }      
  }
  return vars;
}

function hasParam() {
  if(/[?&]v=./.test(location.href) == true)
    return true;
  return false
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function badVin() {
  $('.enter-vin').remove()
  // CLEAR OUT THE DATA
  $('#make, #model, #year, #features, #usedRetail .alpha, #usedRetail .omega strong, #usedPPV .alpha, #usedPPV .omega strong, #usedTrade .alpha, #usedTrade .omega strong').html("");
  $('#vehicle').prepend('<div class="bad-vin"><h3>Nothing found.</h3><h6>Check to see if the VIN is right.<br />Or that might be an old vehicle.</h6></div>')
  $('#vehicle h2, #vin-illustration, p#longTime').remove();
}

function loadingState() {
  $('.bad-vin, .enter-vin, .found, .notice').remove()
  $('#vehicle').prepend("<h2 class='loading'><img src='/images/loader.gif' /> Searching. . . </h2><p id='longTime'>Taking a long time? You might have entered a bad VIN. Or the remote request is being slow.</p>");
  $('#vehicleImage').html("")
  $('#longTime').delay(4000).fadeIn(1);
  $('.subtle').remove();
}

function find300size(arr) {
  for (var i = 0, len = arr.length; i<len; i++) {
    if (/(300.jpg)$/.test(arr[i]) == true) 
      return i;
  };
  return false
}

var baseURI           = 'http://api.edmunds.com/v1/api';
var requestTypeVIN    = '/toolsrepository/vindecoder?';
var requestTypePhoto  = '/vehiclephoto/service/findphotosbystyleid?';
var apiKey            = 'yupau4ndgakp2eczn5yx7pay';
var vehicleStyleID    = '';

// API REQUEST FOR VEHICLE IMAGE
function imageRequest(styleid) {
  var imageAbrev = "FQ"
  $.getJSON( baseURI + requestTypePhoto + 'styleId=' + styleid + "&fmt=json&api_key=" + apiKey + "&callback=?", function (imageJSON) {
    //console.log(imageJSON);
    if (imageJSON != "Nothing found.") {
      var FQobj = $.grep(imageJSON, function(e){ return e.shotTypeAbbreviation == imageAbrev; });
      // FIND IMAGE 300PX IMG SIZE
      index = find300size(FQobj[0]["photoSrcs"]);
      $('#vehicleImage').append('<img src="http://media.ed.edmunds-media.com/' + FQobj[0]['photoSrcs'][index] + '" class="scale-with-grid"/>');
    } else {
      $('#vehicleImage').html('<h2 class="loading">Image Not Found</h2>');
    }
  });
}

function getVehicle(vin) {
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
      $('#vehicle').prepend('<h2 class="loading">Found:</h2><hr class="found"/>');
      $('#make').html(vehicleJSON['styleHolder'][0]['makeName']);
      $('#model').html(vehicleJSON['styleHolder'][0]['modelName']);
      $('#year').html(vehicleJSON['styleHolder'][0]['year']);
      // ADD A LINE BREAK IN FEATURES STRING
      var features = vehicleJSON['styleHolder'][0]['name'];
      var find = "\\(";
      var regex = new RegExp(find, "g");
      $('#features').html(features.replace(regex, "<br />("));
      $('#usedRetail .alpha').html("Used Retail:");
      $('#usedRetail .omega strong').html('$'+ numberWithCommas(vehicleJSON['styleHolder'][0]['price']['usedTmvRetail']));
      $('#usedPPV .alpha').html("Used Private Party:");
      $('#usedPPV .omega strong').html('$'+ numberWithCommas(vehicleJSON['styleHolder'][0]['price']['usedPrivateParty']));
      $('#usedTrade .alpha').html("Used Trade-In:");
      $('#usedTrade .omega strong').html('$'+ numberWithCommas(vehicleJSON['styleHolder'][0]['price']['usedTradeIn']));
      // GET EDMUNDS STYLE ID FOR USE IN GETTING THE STOCK PHOTO
      var vehicleStyleID = vehicleJSON['styleHolder'][0]['attributeGroups']['LEGACY']['attributes']['ED_STYLE_ID']['value'];
      // EXECUTE imageRequest FUNCTION
      imageRequest(vehicleStyleID)
    }
  });
  return false;
}

function urlInParams() {
  vin = parseHashBangArgs().v
  getVehicle(vin)
  $('#vin').val(vin);
}

$(document).ready(function () {
  
  $('#vin').focus(function () {
    var full = $("#vehicle").has("h5").length ? true : false;
    if (full == true) {
      $("#vin").focus(function() { $(this).select() });
      $("#vin").mouseup(function(e){
        e.preventDefault();
      });
    }
  });

  var paramInURL = hasParam();
  if (paramInURL == true) {
    urlInParams()
  }

  function executeSearch() {
    vin = $('#vin').val();
    if (vin == "") {
      $('.notice-holder').html("<div class='notice'><h4 class='enter-vin'>Enter a VIN please</h4></div>");
    } else {
      location.hash = '?v='+vin;
      urlInParams()
    }
  }

  // BIND CLICK EVENT
  $('#search').on("click", function(){
    executeSearch();
  });

  // BIND ENTER EVENT
  $('#vin').keyup(function (event) {
    if (event.keyCode == 13) {
      executeSearch();
    }
  });

});
