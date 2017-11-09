<div class="col s12 m6 l4" id="{{currency}}block">
<div class="card">
<div class="card-content">
<p class="card-stats-title center-align bold">{{tag}}</p>
<div class="row" style="margin-bottom : 0px;">
<div class="col s6 m6 l6 center-align">
<div class="flight-info" id="{{currency}}bidblock"> 
<p class="small"><span class="text-lighten-4 optgroup">Bid</span></p>
<p class="small"><span class="bold" id="{{currency}}bid">NA</span></p>
</div>
</div>
<div class="col s6 m6 l6 center-align flight-state-two" style="border-left: 1px dashed #000">
<div class="flight-info" id="{{currency}}askblock" onclick="showBookDealScreen('{{tag}}','ask')">
<p class="small" ><span class="text-lighten-4 " >Ask</span></p>
<p class="small"  style="cursor: pointer;" ><span class="bold" id="{{currency}}ask">NA</span></p>
</div>
</div>
</div>
</div>
<div class="card-action " style="background-color: #DED;">

<div class="row"><div class="col s6 m6 l6 center-align"><div class="" id="{{currency}}askchart" style="vertical-align: middle; display: inline-block; width: 100px; height: 30px;">No Chart</div></div>
<div class="col s6 m6 l6 center-align flight-state-two" style="border-left: 1px dashed #000">
<div class="" id="{{currency}}bidchart" style="vertical-align: middle; display: inline-block; width: 100px; height: 30px;">No Chart</div></div></div>

<!-- <div id="{{currency}}chart" class="center-align" style="vertical-align: middle; display: inline-block; width: 100px; height: 30px;"></div> -->
</div>
</div>
</div>

