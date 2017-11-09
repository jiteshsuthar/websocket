var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server);
server.listen(8080);

var redis = require('redis');
var redisclient = redis.createClient(); //creates a new client
var subclient = redis.createClient();
var pubclient = redis.createClient();
var dealno = 1;
var currencylist = []
var dealersocketid = []

app.use(express.static(__dirname + '/public'));

redisclient.on('connect', function() {
	console.log('DB connected');
});
redisclient.on("error", function(err) {
	console.log("Cannot connect the REDIS server" + err);
	return;
});

subclient.subscribe("liverates");
subclient.subscribe("bookdeal");
subclient.on("subscribe", function(channel, count) {
	var vdata = []
	console.log("Subscribed to " + channel + ". Now subscribed to " + count + " channel(s).");
});

subclient.on("error", function(err) {
	console.log("Cannot connect the REDIS server");
	return;
});

//Receive the data at the subscribed channels
subclient.on("message", function(channel, message) {
	if (channel == "liverates") {
		vdata = message.split(":");
//		console.log(vdata[0] + " : " + vdata[1] + " : " + vdata[2])
		io.sockets.in(vdata[0]).emit('ratefeed', vdata[0], vdata[1], vdata[2]);
	} else if (channel == "bookdeal") {
		console.log(message);
		if (dealersocketid)
			io.sockets.in("dealers").emit('getdeal', message);
	}
});

//On Load of User Page get the currency pair list
app.use('/main', function(request, response, next) {
	redisclient.hgetall("currencylist", function(err, currency) {
		currencylist = currency;
	});
	next();
})

// routing
app.get('/main', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

// routing
app.get('/deals', function(req, res) {
	res.sendFile(__dirname + '/Deals.html');
});

app.get('/currencytpl', function(req, res) {
	res.sendFile(__dirname + '/public/template/currencytpl.tpl');
});

io.sockets.on('connection', function(socket) {
	var user = ""
		// store the user name and send the configured currency against the user to the client 
	socket.on('adduser', function(username) {
		redisclient.sadd("session:" + username, socket.id)
		if(socket.id){
		redisclient.hset("sessionlist", socket.id, username);
		redisclient.hgetall("user:curr:config", function(err, object) {
			object = object || {}
			object[username] = object[username] || null
			socket.emit("setConfigCurr", {
				"currconfigured": object[username],
				"currencylist": currencylist
			});
			(object[username] + "").split(",").forEach(function(currency) {
				if (currency) socket.join(currency)
			})
		});		
	}

	});

	//Get the deal list when the user visits the page
	socket.on("getdeals", function(dealObj) {
		socket.join("dealers")
		redisclient.smembers("deallist", function(err, deals) {
			socket.emit("deallist", JSON.stringify(deals));
		})
	})

	//Send the deal details to the user on approval of deal
	socket.on("approvedeal", function(Obj) {
		redisclient.smembers("session:" + Obj.userid, function(err, sessionlist) {
			sessionlist.forEach(function(session) {
				io.to(session).emit('dealApproved', 'The deal has been approved [Deal No : ' + Obj.dealno + ']');
			})
		})
	})

	//Send the deal details to the user on rejection of deal
	socket.on("rejectdeal", function(Obj) {
		redisclient.smembers("session:" + Obj.userid, function(err, sessionlist) {
			sessionlist.forEach(function(session) {
				io.to(session).emit('dealRejected', 'The deal has been rejected [Deal No : ' + Obj.dealno + '].');
			})
		})
	})

	//Create a room for each currencypair and subscibe the user against that pair save the same in the DB
	socket.on("subscribecurr", function(Obj) {
		var curconfig = [];
		socket.join(Obj.currency);
		//Store the user currency config in hash 
		redisclient.hgetall("user:curr:config", function(err, object) {
		object = object || {}
		curconfig=(object[Obj.user])?object[Obj.user].split(","):[]
		curconfig.push(Obj.currency)
		redisclient.hmset("user:curr:config", Obj.user, curconfig.join(","))
		});
	})

	//Remove the user from the remove so that is doesnt receive the rates
	socket.on("unsubscribecurr", function(Obj) {
		socket.leave(Obj.currency);
		redisclient.hgetall("user:curr:config", function(err, object) {
			if (object && object[Obj.user]) {
				var currency = object[Obj.user].split(",")
				var indx = currency.indexOf(Obj.currency);
				if (indx != -1)
					currency.splice(indx, 1);
				redisclient.hmset("user:curr:config", Obj.user, currency.join(","))
			}
		});
	})

	//Store the deal and publish the data to dealers
	socket.on("bookdeal", function(BookObj) {
		BookObj = JSON.parse(BookObj);
		BookObj.dealno = (dealno++);
		BookObj = JSON.stringify(BookObj)
		redisclient.sadd("deallist", BookObj)
		pubclient.publish("bookdeal", BookObj)
	})

	// when the user disconnects.. perform this
	socket.on('disconnect', function() {
		console.log("disconnect " + socket.id)
		redisclient.hget("sessionlist", socket.id, function(err, names) {
			redisclient.smembers("session:" + names, function(err, sessionlist) {
				redisclient.srem("session:" + names, socket.id)
				redisclient.hdel("sessionlist", socket.id);
			})

		});
	});

	// Start reading from stdin so we don't exit.
	process.stdin.resume();

	process.on('SIGINT', function() {
		redisclient.hdel("sessionlist");	
		console.log("Shutdown")
		process.exit();
	});
});
