(function($){
  const COMPOSABLE = "composable";

  var songStructure;
  var player;

  var getSongTime = function(){
    return player.audioPlayer('getCurrentTime');
  };

  var assignTime = function(songLine){
    songLine.startTime = getSongTime();
  };

  var handleClickSongLine = function(evt){
    var $songLine = $(evt.target);
    var idxSection = $songLine.attr("idxSection");
    var idxLine = $songLine.attr("idxLine");
    var songLine = songStructure[idxSection].songLines[idxLine];
    assignTime(songLine);
    $songLine.trigger("rerenderLine", songLine);
  };

  var enable = function(){
    this.children().addClass(COMPOSABLE);
    return this;
  };

  var disable = function(){
    this.children().removeClass(COMPOSABLE);
    return this;
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
    enable: enable,
    disable: disable
  };

  $.fn.composer = $.tapalot.createPlugin(methods);
})(jQuery);
