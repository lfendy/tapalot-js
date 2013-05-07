(function($){

  const PLAYABLE = "playable";

  var songStructure;
  var player;
  var viewDelay;
  var timeSlices;
  var display;
  var checkTriggersInterval;
  var heartbeatInterval;
  const CHECK_TRIGGERS_DURATION_MS = 10

  // hack... States ?
  var currentTimeSliceBeingChecked;


  var heartbeat = {
    progressForRepetition: 0,
    display: "",
    beats: 0
  };
  var triggerHeartbeat = function(numberOfBeats){
    var trigger = function(){
      var idx = _.indexOf(timeSlices.flat, currentTimeSliceBeingChecked);
      var currentSlice = timeSlices.flat[idx-1];
      if(heartbeat.beats % numberOfBeats == 0) {
        heartbeat.progressForRepetition += 1;
        heartbeat.display = "(" + heartbeat.progressForRepetition + "/" + currentSlice.repetition + ")";
      } else {
        heartbeat.display = heartbeat.display + ".";
      }
      heartbeat.beats += 1;
      display.trigger('heartbeat', heartbeat.display);
    };
    return trigger;
  };

  var clearHeartbeat = function(){
    heartbeat = {
      progressForRepetition: 0,
      display: "",
      beats: 0
    };
    clearInterval(heartbeatInterval);
  };

  var startHeartbeat = function(duration, numberOfBeats){
    var trigger = triggerHeartbeat(numberOfBeats);
    trigger();
    heartbeatInterval = setInterval(trigger, duration);
  };

  var checkTriggers = function(){
    var currentTime = player.audioPlayer('getCurrentTime').totalSeconds;
    if(currentTimeSliceBeingChecked != undefined && (currentTimeSliceBeingChecked.startTime.totalSeconds + viewDelay) <= currentTime){

      var idx = _.indexOf(timeSlices.flat, currentTimeSliceBeingChecked);
      var nextSlice = timeSlices.flat[idx+1];
      var delta = nextSlice.startTime.differenceWith(currentTimeSliceBeingChecked.startTime).totalSeconds;
      var heartbeatDuration = delta / (currentTimeSliceBeingChecked.repetition * currentTimeSliceBeingChecked.numberOfBeats);
      setTimeout(function(){
        clearHeartbeat();
        startHeartbeat(heartbeatDuration * 1000, currentTimeSliceBeingChecked.numberOfBeats);
      }, (-1 * viewDelay) * 1000);

      display.trigger('highlightLine', [currentTimeSliceBeingChecked.section, currentTimeSliceBeingChecked.line]);

      currentTimeSliceBeingChecked = nextSlice;
    }
  };

  var play = function(){
    player.audioPlayer('play');
    checkTriggersInterval = setInterval(checkTriggers, CHECK_TRIGGERS_DURATION_MS);
  };

  var pause = function(){
    player.audioPlayer('pause');
    clearInterval(checkTriggersInterval);
    clearHeartbeat();
  };

  var skipTo = function(idxSection, idxLine){
    var slice = timeSlices.hierarchical[idxSection][idxLine];
    player.audioPlayer('setCurrentTime', slice.startTime.delayBy(viewDelay));
    currentTimeSliceBeingChecked = slice;
    clearHeartbeat();
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

  var init = function(givenSongStructure, givenPlayer, givenViewDelay){
    viewDelay = givenViewDelay;
    player = givenPlayer;
    songStructure = givenSongStructure;
    display = this;
    timeSlices = $.tapalot.timeSlice.createTimeSlices(songStructure);
    window.tapalotDebug.timeSlices = timeSlices;
    currentTimeSliceBeingChecked = timeSlices.flat[0];
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
