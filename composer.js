(function($){
  const COMPOSABLE = "composable";

  var idxFromIdGrammar = 'indexes = "section_" section:[0-9]+ "_line_" line:[0-9]+ {return { section: parseInt(section.join("")), line: parseInt(line.join("")) };}';
  var idxFromIdParser = PEG.buildParser(idxFromIdGrammar);
  var songStructure;
  var player;

  var getIdxFromId = function(id){
    return idxFromIdParser.parse(id);
  };

  var getSongTime = function(){
    return player.audioPlayer('getCurrentTime');
  };

  var assignTime = function(songLine){
    songLine.startTime = getSongTime();
    console.dir(songLine);
  };

  var handleClickSongLine = function(evt){
    var $songLine = $(evt.target);
    var id = $songLine.attr("id");
    var idx = getIdxFromId(id);
    var songLine = songStructure[idx.section].songLines[idx.line];
    assignTime(songLine);
    $songLine.trigger("rerenderLine", songLine);
    console.log(id);
  };

  var enabled = function(isEnabled){
    if(isEnabled){
      this.children().addClass(COMPOSABLE);
    } else {
      this.children().removeClass(COMPOSABLE);
    }
  };

  var init = function(givenSongStructure, givenPlayer){
    var $this = this;
    $this.on("click", "." + COMPOSABLE, handleClickSongLine);
    songStructure = givenSongStructure;
    player = givenPlayer;
    return $this;
  };

  var methods = {
    init: init,
    enabled: enabled
  };


  var methodInvoker = function(methodOrOptions) {
    if ( methods[methodOrOptions] ) {
      return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist' );
    }
  };

  $.fn.composer = methodInvoker;
})(jQuery);
