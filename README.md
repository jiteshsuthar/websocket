# websocket
Broadcasting currency rates to multiple users on real time basis using following technologies

    Node.js
    Redis
    Websocket
    Pubsub
  

# Prerequisties 
	1. nodejs
	2. redis
	
# Lets Try
* Currency List Setup in redis
		run redis-server
		run redis-client
		add currency list using following redis hset command
    
		hset currencylist USDINR "USD/INR"
		hset currencylist EURUSD "EUR/USD"
	 verify the list from below statement:
    
		hgetall currencylist

* Start rate publisher server using following command
	
		node publishrates.js

* Start app server
		
		node app.js
		
* Access customer dashboard

		http://localhost:8080/main
	
* Access dealer dashboard

		http://localhost:8080/deals
