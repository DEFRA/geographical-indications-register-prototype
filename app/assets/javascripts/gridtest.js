
var gridSizePx = 50
var gridBorderPx = 1
var gridWidthHeight = gridSizePx - (2 * gridBorderPx)
var mapWidth = $( "#map" ).width()
var mapHeight = $( "#map" ).height()

var numWide = parseInt(mapWidth/gridSizePx)
var numHigh = parseInt(mapHeight/gridSizePx)

var numSquares = numWide * numHigh

//console.log("numSquares:" + numSquares)

$(".gridsq").css( "width", gridWidthHeight )
$(".gridsq").css( "height", gridWidthHeight )
$(".gridsq").css( "border-width", gridBorderPx+"px" )

for (var i = 1; i < numSquares; i++) {
  $("#sq0").clone().attr('id', 'sq'+ i).appendTo("#map")
}

$(".gridsq").click(function () {
        $(this).toggleClass('on')
});

$(".gridsq").on('keydown',function(e) {
    if (e.key === ' ' || e.key === 'Spacebar')  {
        e.preventDefault()
        $(this).click()
    }
    if (e.keyCode == '38') {
        // up arrow
        e.preventDefault()
        var thisSqId = $(this).attr('id')
        $("#sq"+moveSq(thisSqId,-16)).focus()
    }
    else if (e.keyCode == '40') {
        // down arrow
        e.preventDefault()
        var thisSqId = $(this).attr('id')
        $("#sq"+moveSq(thisSqId,16)).focus()
    }
    else if (e.keyCode == '37') {
       // left arrow
       e.preventDefault()
       var thisSqId = $(this).attr('id')
       $("#sq"+moveSq(thisSqId,-1)).focus()
    }
    else if (e.keyCode == '39') {
       // right arrow
       e.preventDefault()
       var thisSqId = $(this).attr('id')
       $("#sq"+moveSq(thisSqId,1)).focus()
    }

})

function moveSq(thisSqId,dist){
  var thisSqNum = parseInt(thisSqId.replace("sq", "", 10))
  var nextSqNum = thisSqNum + dist
  var nextSqNumStr = nextSqNum.toString()
  return nextSqNumStr
}
