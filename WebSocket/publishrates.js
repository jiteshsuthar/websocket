var sleep = require('system-sleep');
// var lineReader = require('line-reader');
var redis = require('redis');
var publisher = redis.createClient(); //creates a new client


// function readLiveRateFile(){
// lineReader.eachLine('liverates.txt', function(line, last) {
// console.log("Rate :::::::::::"+line)
//   publisher.publish("liverates",line);
//   if (last) {
//   	console.log("last "+line)
//     //return false; // stop reading
//   }
//   sleep(100)
// });
// console.log("finish")
// }
// readLiveRateFile()
// //setInterval(readLiveRateFile,10000);

var arr=[["EUR/USD",1.1951,1.1943],
//["USD/EUR","0.8372","0.8367"],
["GBP/USD","1.3597","1.3582"],
//["USD/GBP","0.7362","0.7354"],
["USD/CAD","1.2198","1.2183"],
//["CAD/USD","0.8207","0.8197"],
["USD/CHF","0.9604","0.9589"],
//["CHF/USD","1.0428","1.0412"],
["USD/JPY","110.86","110.81"],
// ["JPY/USD","0.0090","0.0090"],
// ["EUR/GBP","0.8795","0.8785"],
// ["GBP/EUR","1.1382","1.1369"],
// ["EUR/CHF","1.1472","1.1457"],
// ["CHF/EUR","0.8728","0.8716"],
// ["AUD/USD","0.8006","0.7997"],
// ["USD/AUD","1.2503","1.2490"],
// ["EUR/JPY","132.48","132.38"],
// ["JPY/EUR","0.0075","0.0075"],
// ["GBP/JPY","150.73","150.53"],
// ["JPY/GBP","0.0066","0.0066"],
["USD/INR","64.6215","64.6217"]]

function random(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
var r;
while(true)
//for(var i=0;i<=100;i++)
{
	for(var j=0;j<arr.length;j++)
	{
		r1=random(0,9);r2=random(0,9);
		publisher.publish("liverates",arr[j][0]+":"+arr[j][1]+""+r1+":"+arr[j][2]+""+r2);
		console.log(arr[j][0]+":"+arr[j][1]+r1+":"+arr[j][2]+""+r2)
		sleep(50);		
	}		
}

