var templatedeal = "<tr><td>{{dealno}}</td><td>{{currencypair}}</td><td>{{transtype}}</td><td>{{currencyrate}}</td> <td> {{currencyamt}} </td> <td> {{userid}} </td>	<td id='action_{{dealno}}'> <i onclick='onApproveDeal(\"{{dealno}}\",\"{{userid}}\")'  title='Approve' class='material-icons dp48 pointer approve'>thumb_up</i> &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; <i onclick='onRejectDeal(\"{{dealno}}\",\"{{userid}}\")'  title='Reject' class='material-icons dp48 pointer reject'>thumb_down</i> </td></tr>"
socket = io();
socket.on('connect', function(para1, para2) {
	socket.emit('getdeals', "")
});

function onApproveDeal(dealno, userid) {
	socket.emit("approvedeal", {
		'dealno': dealno,
		"userid": userid
	})
	$("#action_"+dealno).html('<i class="material-icons dp48">done</i>');	
}

function onRejectDeal(dealno, userid) {
	socket.emit("rejectdeal", {
		'dealno': dealno,
		"userid": userid
	})
	$("#action_"+dealno).html('<i class="material-icons dp48">done</i>');	

}

socket.on("deallist", function(dealObj) {
	dealObj = JSON.parse(dealObj)
	var html = dealObj.reduce(function(tplarr, deal) {
		var _d = JSON.parse(deal)
		tplarr.push(Mustache.render(templatedeal, _d));
		return tplarr;
	}, []);
	$("tbody").append(html)
})
socket.on("getdeal", function(dealObj) {
	dealObj = JSON.parse(dealObj)
	var html = Mustache.render(templatedeal, dealObj)
	$("tbody").append(html)
})