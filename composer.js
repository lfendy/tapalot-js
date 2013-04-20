(function($){
  const SONGLINE = "song_line";

  var idxFromIdGrammar = 'indexes = "section_" idxSection:[0-9]+ "_line_" idxLine:[0-9]+ {return { idxSection: parseInt(idxSection.join("")), idxLine: parseInt(idxLine.join("")) };}';
  var idxFromIdParser = PEG.buildParser(idxFromIdGrammar);
  var songStructure;
  var player;

  var getIdxFromId = function(id){
    return idxFromIdParser.parse(id);
  };

  var getSongTime = function(){
    return player.audioPlayer('getCurrentTime');
  };

  var assignTimeToSongLine = function(idxSection, idxLine){
    var songLine = songStructure[idxSection].songLines[idxLine];
    songLine.startTime = getSongTime();
    console.dir(songLine);
  };

  var handleClickSongLine = function(evt){
    var $songLine = $(evt.target);
    var id = $songLine.attr("id");
    console.log(id);
    var idx = getIdxFromId(id);
    assignTimeToSongLine(idx.idxSection, idx.idxLine);
  };

  var init = function(givenSongStructure, givenPlayer){
    var $this = this;
    $this.on("click", "." + SONGLINE, handleClickSongLine);
    songStructure = givenSongStructure;
    player = givenPlayer;
    return $this;
  };

  var methods = {
    init: init
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
