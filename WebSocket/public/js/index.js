var _template = "",
  username = "";
var currencyObj = {};
var chartObj = {};
var chartRef = {}
var latestrate = {}
var socket = null

$(document).ready(function() {
  window.alert = function(msg){
    // stuff  
    Materialize.toast(msg, 4000)
  }
  socket = io();
  username = prompt("Hey wazzup,Your Name?");
  $("#lblusername").html(username)

  $.get("/currencytpl", function(data) {
    if (data.error) {
      alert("Error while getting template")
    } else {
      _template = data
    }
  });

  //Socket Error 
  socket.on('error', function(err) {
    console.error('The server sent an error');
    $("#errormsg").html("Server encounterred an error").parent().show;
  });
 socket.on('connect_failed', function() {
    console.error("Sorry, there seems to be an issue with the connection!");
}) 
 socket.on('reconnect', function() {
    console.error("reconnect");
    $("#errormsg").html("").parent().hide();
}) 
 socket.on('reconnect_failed', function() {
    console.error("reconnect_failed");
}) 

 socket.on('connect_failed', function() {
    console.error("connect_failed");
}) 
  socket.on('connecting', function() {
    console.error("Connecting");
}) 
  socket.on('reconnecting', function() {
    console.error("ReConnecting");
    $("#errormsg").html("Reconnecting..."); 
}) 

  //Notify user on deal approved
  socket.on("dealApproved", function(msg) {
    console.log(msg)
    Materialize.toast(msg, 4000)
  })

  //Notify user on deal rejected
  socket.on("dealRejected", function(msg) {
    Materialize.toast(msg, 4000)
  })

  //Socket disconnect event
  socket.on('disconnect', function(socket) {
    $("#errormsg").html("Server encounterred an error").parent().show(); 
    $("#onofficon").html("sentiment_dissatisfied");
    $("#onofficon").toggleClass("online");
  });

  //Gets the currencypair configuration on the page is opened
  socket.on("setConfigCurr", setConfiguredCurr)

  //Get the currnecy rate
  socket.on("ratefeed", ratefeed);

  //On Connect add the user.
  socket.on('connect', function(para1, para2) {
    $("#onofficon").html("sentiment_satisfied");
    $("#onofficon").toggleClass("online");
    socket.emit('adduser', username)
  });
})

//Create the currency pair blocks
function setConfiguredCurr(Obj){
  $("#currencypairrow").html("")
  var currlist = Obj.currconfigured || ""
  var currency = currlist.split(",");
  var mydata = []
  for (var k = 0; k < currency.length; k++) {
    if (currency[k]) {
      mydata[mydata.length] = {
        "tag": currency[k]
      };
      subscribeCurrency(currency[k]);
    }
  }
  if (mydata.length == 0) $("#norecord").show()
  else $("#norecord").hide() 
  setCurrencyList(Obj.currencylist, mydata)
}

//create an autocompelete  control and set the currency list in it and also set the configured currencypair
function setCurrencyList(currency, defval) {
  var obj = {}
  for (var key in currency) {
    obj[currency[key]] = null
  }
  $('#ddcurrlist').material_chip({
    placeholder: "Enter Currency Pair",
    data: defval,
    autocompleteLimit: 5,
    autocompleteOptions: {
      data: obj,
      limit: 7,
      minLength: 1
    }
  });
  $('.chips').on('chip.add', function(e, chip) {
    socket.emit('subscribecurr', {
      "currency": chip.tag,
      "user": username
    })
    subscribeCurrency(chip.tag);
  });

  $('.chips').on('chip.delete', function(deleted, chip) {
    var tag = chip.tag.replace("/", "");
    socket.emit('unsubscribecurr', {
      "currency": chip.tag,
      "user": username
    })
    $("#" + tag + "block").remove();
   if ($('#ddcurrlist').material_chip("data").length== 0) $("#norecord").show()
   else $("#norecord").hide()    
  });
}

//Subscribe the user to  currecypair ,save the same in the DB 
function subscribeCurrency(chipcurr) {
  $("#norecord").hide()  
  var tag = chipcurr.replace("/", "");
  var html = Mustache.render(_template, {
    "currency": tag,
    "tag": chipcurr
  });
  $("#currencypairrow").append(html);

  createChart({
    currency: tag
  });
}

//Display the bid and ask rate.
function ratefeed(currency, askrate, bidrate) {
  var tag = currency.replace("/", "")
  latestrate[currency] = {
    "bid": bidrate,
    "ask": askrate
  }

 updateChart({
  currency: tag,
  askrate: askrate,
  bidrate: bidrate
})

  var txtaskrate = parseFloat($("#" + tag + "ask").html())
  var txtbidrate = parseFloat($("#" + tag + "bid").html());
  (parseFloat(askrate) > txtaskrate) ? $("#" + tag + "ask").removeClass('blue-text red-text').addClass('green-text'):
    (parseFloat(askrate) < txtaskrate) ? $("#" + tag + "ask").removeClass('blue-text green-text').addClass('red-text'):
    $("#" + tag + "ask").removeClass('red-text green-text').addClass('blue-text');

  (parseFloat(bidrate) > txtbidrate) ? $("#" + tag + "bid").removeClass('blue-text red-text').addClass('green-text'):
    (parseFloat(bidrate) < txtbidrate) ? $("#" + tag + "bid").removeClass('blue-text green-text').addClass('red-text') :
    $("#" + tag + "bid").removeClass('red-text green-text').addClass('blue-text');

  $("#" + tag + "ask").html(askrate);
  $("#" + tag + "bid").html(bidrate);

}

//create a line chart that will dislay the rate 
function createChart(Obj) {
  currencyObj[Obj.currency] = {ask: [], bid: [] }
  $('#'+Obj.currency+'bidchart').sparkline("Loading...");
  $('#'+Obj.currency+'askchart').sparkline("Loading...");
}
function updateChart(wsEvent) {
  currencyObj[wsEvent.currency]["ask"].push(wsEvent.askrate)//.apply(currencyObj[wsEvent.currency]["ask"], wsEvent.askrate);
  currencyObj[wsEvent.currency]["bid"].push(wsEvent.bidrate)//.apply(currencyObj[wsEvent.currency]["bid"], wsEvent.bidrate);

  // keep only 30 datapoints on screen for the demo
  if (currencyObj[wsEvent.currency]["ask"].length > 30) {
    currencyObj[wsEvent.currency]["ask"].splice(0, currencyObj[wsEvent.currency]["ask"].length - 30);
  }
  // keep only 50 datapoints on screen for the demo
  if (currencyObj[wsEvent.currency]["bid"].length > 30) {
    currencyObj[wsEvent.currency]["bid"].splice(0, currencyObj[wsEvent.currency]["bid"].length - 30);
  }
  $('#'+wsEvent.currency+'bidchart').sparkline(currencyObj[wsEvent.currency]["bid"]);
  $('#'+wsEvent.currency+'askchart').sparkline(currencyObj[wsEvent.currency]["ask"]);

}

function onBookDeal() {
  var currencypair = $("#txtcurrpair").prop("value");
  var currencyrate = $("#txtcurrrate").prop("value");
  var currencyamt = $("#txtcurramount").prop("value");
  var transtype= $("#txttranstype").prop("value")
  if (!currencypair && !currencyrate && !currencyamt && !transtype) {
    alert("Insufficient data to book the deal")
    return
  }
  currencyamt=unformatPrice.call(currencyamt);
  socket.emit("bookdeal", JSON.stringify({
    "currencypair": currencypair,
    "currencyrate": currencyrate,
    "currencyamt": currencyamt,
    "userid": username,
    "transtype":transtype
  }))
  $('#modal1').modal('close');
  alert("Request has been sent");
}

function showBookDealScreen(currency, type) {
  if (!latestrate[currency]) {
    alert("Hey buddy ,no rate found against " + currency)
    return;
  }
  var transtype=(type=='ask')?"Sell":"Buy"
  $("input").prop("value","")
  $("#txtcurrpair").prop("value", currency);
  $("#txttranstype").prop("value",transtype)
  $("#txtcurrrate").prop("value", latestrate[currency][type]);
  $("#lblrate").html(latestrate[currency][type]);
  $('.modal').modal()
  $('#modal1').modal('open');
}

function formatPrice(comma, period) {
    comma = comma || ',';
    period = period || '.';
    var split = this.toString().split('.');
    var numeric = split[0];
    var decimal = split.length > 1 ? period + split[1] : '';
    numeric = numeric.replace(/\,/g, '');
    var reg = /(\d+)(\d{3})/;
    while (reg.test(numeric)) {
        numeric = numeric.replace(reg, '$1' + comma + '$2');
    }
    return numeric + decimal;
}


function unformatPrice() 
{
    var numeric = this.toString()
    numeric = numeric.replace(/\,/g, '');
    return numeric;
}

