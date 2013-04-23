(function($){

  const PLAYABLE = "playable";

  var songStructure;
  var player;
  var timing;
  var display;
  var highlightCheckInterval;
  var heartbeatInterval;

  // hack... States ?
  var currentTimeSlice;

  var getPreviousTimeSlices = function(timing, timeSlice){
    return _.filter(timing, function(ts){
      return ts.section <= timeSlice.section && ts.line < timeSlice.line;
    });
  };

  var getNextTimeSlices = function(timing, timeSlice){
    return _.filter(timing, function(ts){
      return ts.section >= timeSlice.section && ts.line > timeSlice.line;
    });
  };

  var getFirstPreceedingSliceWithStartTime = function(timing, timeSlice){
    var previousSlices = getPreviousTimeSlices(timing, timeSlice);
    return _.last(_.filter(previousSlices, function(ts){
      return !isNaN(ts.startTime);
    }));
  };

  var getFirstSucceedingSliceWithStartTime = function(timing, timeSlice){
    var nextSlices = getNextTimeSlices(timing, timeSlice);
    return _.first(_.filter(nextSlices, function(ts){
      return !isNaN(ts.startTime);
    }));
  };

  var getSumOfPreviousRepetitions = function(timing, timeSlice){
    var backSlice = getFirstPreceedingSliceWithStartTime(timing, timeSlice);
    var allPreviousSlices = getPreviousTimeSlices(timing, timeSlice);
    var inBetweenSlices = getNextTimeSlices(allPreviousSlices, backSlice).concat([backSlice]);
    return _.reduce(inBetweenSlices, function(acc, ts){
      return acc + ts.repetition;
    }, 0);
  };

  var getSumOfNextRepetitions = function(timing, timeSlice){
    var forwardSlice = getFirstSucceedingSliceWithStartTime(timing, timeSlice);
    var allNextSlices = getNextTimeSlices(timing, timeSlice);
    var inBetweenSlices = getPreviousTimeSlices(allNextSlices, forwardSlice);
    inBetweenSlices = inBetweenSlices.concat([timeSlice]);
    return _.reduce(inBetweenSlices, function(acc, ts){
      return acc + ts.repetition;
    }, 0);
  };

  var getMostRecentTempo = function(timing, timeSlice){
    var prevSlice = getFirstPreceedingSliceWithStartTime(timing, timeSlice);
    var prevprevSlice = getFirstPreceedingSliceWithStartTime(timing, prevSlice);
    var delta = prevSlice.startTime - prevprevSlice.startTime;
    return delta / prevprevSlice.repetition;
  };

  var fillStartTime = function(timing, timeSlice){
    var previousTime = getFirstPreceedingSliceWithStartTime(timing, timeSlice).startTime;
    var nextTimeSlice = getFirstSucceedingSliceWithStartTime(timing, timeSlice);
    var prevReps = getSumOfPreviousRepetitions(timing, timeSlice);
    if(nextTimeSlice != undefined){
      var nextReps = getSumOfNextRepetitions(timing, timeSlice);
      var nextTime = nextTimeSlice.startTime;
      var delta = nextTime - previousTime;
      var ratio = prevReps / (prevReps + nextReps);
      timeSlice.startTime = previousTime + (ratio * delta);
    } else {
      var secondsPerBar = getMostRecentTempo(timing, timeSlice);
      timeSlice.startTime = previousTime + (prevReps * secondsPerBar);
    }
  };

  var fillAllStartTime = function(timing){
    var emptySlices = _.filter(timing, function(ts){
      return isNaN(ts.startTime);
    });
    _.each(emptySlices, function(ts){
      fillStartTime(timing, ts);
    });
    return timing;
  };

  var getTotalSeconds = function(startTime){
    return (parseInt(startTime.minutes) * 60) + parseFloat(startTime.seconds);
  };

  var heartbeat = "";
  var triggerHeartbeat = function(){
    if(heartbeat.length % 4 == 0) {
      heartbeat = heartbeat + "X";
    } else {
      heartbeat = heartbeat + ".";
    }
    display.trigger('heartbeat', heartbeat);
  };

  var clearHeartbeat = function(){
    heartbeat = "";
    clearInterval(heartbeatInterval);
  };

  var startHeartbeat = function(duration){
    triggerHeartbeat();
    heartbeatInterval = setInterval(triggerHeartbeat, duration);
  };

  var triggerHighlight = function(){
    var currentTime = getTotalSeconds(player.audioPlayer('getCurrentTime'));
      if(currentTimeSlice != undefined && currentTimeSlice.startTime <= currentTime){
        clearHeartbeat();
        display.trigger('highlightLine', [currentTimeSlice.section, currentTimeSlice.line]);
        var idx = _.indexOf(timing, currentTimeSlice);
        var delta = timing[idx+1].startTime - currentTimeSlice.startTime;
        var heartbeatDuration = delta / (currentTimeSlice.repetition * 4);
        startHeartbeat(heartbeatDuration * 1000);
        currentTimeSlice = timing[idx + 1];
      }
  };

  var createTiming = function(songStructure){
    var sectionTimings = _.map(songStructure, function(section, idxSection, sections){
      return _.map(section.songLines, function(songLine, idxLine, songLines){
        return {
          section: idxSection,
          line: idxLine,
          startTime: getTotalSeconds(songLine.startTime),
          repetition: songLine.repetition
        };
      });
    });
    var sparseTimings = _.flatten(sectionTimings);
    return fillAllStartTime(sparseTimings);
  };

  var play = function(){
    player.audioPlayer('play');
    highlightCheckInterval = setInterval(triggerHighlight, 10);
  };

  var pause = function(){
    player.audioPlayer('pause');
    clearInterval(highlightCheckInterval);
    clearHeartbeat();
  };

  var skipTo = function(idxSection, idxLine){};
  var setViewDelay = function(delay){};

  var init = function(givenSongStructure, givenPlayer){
    player = givenPlayer;
    songStructure = givenSongStructure;
    display = this;
    timing = createTiming(songStructure);
    window.timing = timing;
    currentTimeSlice = timing[0];
    return this;
  };

  var methods = {
    init: init,
    play: play,
    pause: pause,
    skipTo: skipTo,
    setViewDelay: setViewDelay
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

  $.fn.conductor = methodInvoker;
})(jQuery);
