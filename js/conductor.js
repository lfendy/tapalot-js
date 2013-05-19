(function($){

  const PLAYABLE = "playable";

  var songStructure;
  var player;
  var animationDelay;
  var timeSlices;
  var display;
  var checkTriggersInterval;
  const CHECK_TRIGGERS_DURATION_MS = 20

  // hack... States ?
  var nextSliceToHighlight;

  var heartbeat = {
    progressForRepetition: 0,
    display: "",
    beats: 0
  };
  var triggerHeartbeat = function(beatsPerBar, currentSlice){
    if(heartbeat.beats % beatsPerBar == 0) {
      heartbeat.progressForRepetition += 1;
      heartbeat.display = "(" + heartbeat.progressForRepetition + "/" + currentSlice.repetition + ")";
    } else {
      heartbeat.display = heartbeat.display + ".";
    }
    heartbeat.beats += 1;
    display.trigger('heartbeat', heartbeat.display);
  };

  var clearHeartbeat = function(){
    heartbeat = {
      progressForRepetition: 0,
      display: "",
      beats: 0
    };
  };

  var triggeringHighlightTheFirstTime = true;
  var checkTriggers = function(){
    var currentTime = player.audioPlayer('getCurrentTime').totalSeconds;
    var ns = nextSliceToHighlight;
    var cs = $.tapalot.timeSlice.getPreviousTimeSlice(timeSlices, nextSliceToHighlight);
    if(ns != undefined){
      if(cs != undefined && (ns.startTime.totalSeconds - ((cs.totalBeats - heartbeat.beats) * cs.heartbeatDuration)) <= currentTime){
        triggerHeartbeat(cs.beatsPerBar, cs);
      }
      if(ns.startTime.delayBy(animationDelay).totalSeconds <= currentTime){
        if(triggeringHighlightTheFirstTime){
          display.trigger('highlightLine', [ns.section, ns.line]);
          triggeringHighlightTheFirstTime = false;
        }
      }
      if(ns.startTime.totalSeconds <= currentTime){
        clearHeartbeat();
        nextSliceToHighlight = $.tapalot.timeSlice.getNextTimeSlice(timeSlices, ns);
        triggeringHighlightTheFirstTime = true;
      }
    }
  };

  var clearTriggerIntervals = function(){
    clearInterval(checkTriggersInterval);
  };

  var play = function(){
    player.audioPlayer('play');
    checkTriggersInterval = setInterval(checkTriggers, CHECK_TRIGGERS_DURATION_MS);
  };

  var pause = function(){
    player.audioPlayer('pause');
    clearTriggerIntervals();
  };

  var ended = function(){
    clearTriggerIntervals();
    nextSliceToHighlight = timeSlices.flat[0];
  };

  var skipTo = function(idxSection, idxLine){
    var slice = timeSlices.hierarchical[idxSection][idxLine];
    player.audioPlayer('setCurrentTime', slice.startTime);
    nextSliceToHighlight = slice;
  };
  var setViewDelay = function(delay){};

  var enable = function(){
    display.children().addClass(PLAYABLE);
    return this;
  };

  var disable = function(){
    display.children().removeClass(PLAYABLE);
    return this;
  };

  var handleClickSongLine = function(evt){
    var $songLine = $(evt.target);
    var idxSection = $songLine.attr("idxSection");
    var idxLine = $songLine.attr("idxLine");
    skipTo(idxSection, idxLine);
  };

  var init = function(givenSongStructure, givenPlayer, givenAnimationDelay){
    animationDelay = givenAnimationDelay;
    player = givenPlayer;
    player.audioPlayer('ended', ended);
    songStructure = givenSongStructure;
    display = this;
    timeSlices = $.tapalot.timeSlice.createTimeSlices(songStructure);
    $.tapalot.debug.timeSlices = timeSlices;
    nextSliceToHighlight = timeSlices.flat[0];
    display.on("click", "." + PLAYABLE, handleClickSongLine);
    return this;
  };

  var methods = {
    init: init,
    play: play,
    pause: pause,
    skipTo: skipTo,
    enable: enable,
    disable: disable,
    setViewDelay: setViewDelay
  };

  $.fn.conductor = $.tapalot.createPlugin(methods);
})(jQuery);
