(function($){

  const PLAYABLE = "playable";

  var songStructure;
  var player;
  var viewDelay;
  var allTimeSlices;
  var display;
  var highlightCheckInterval;
  var heartbeatInterval;

  // hack... States ?
  var currentTimeSlice;

  var getPreviousTimeSlices = function(allTimeSlices, timeSlice){
    return _.filter(allTimeSlices, function(ts){
      return ts.section <= timeSlice.section && ts.line < timeSlice.line;
    });
  };

  var getNextTimeSlices = function(allTimeSlices, timeSlice){
    return _.filter(allTimeSlices, function(ts){
      return ts.section >= timeSlice.section && ts.line > timeSlice.line;
    });
  };

  var getFirstPreceedingSliceWithStartTime = function(allTimeSlices, timeSlice){
    var previousSlices = getPreviousTimeSlices(allTimeSlices, timeSlice);
    return _.last(_.filter(previousSlices, function(ts){
      return !isNaN(ts.startTime);
    }));
  };

  var getFirstSucceedingSliceWithStartTime = function(allTimeSlices, timeSlice){
    var nextSlices = getNextTimeSlices(allTimeSlices, timeSlice);
    return _.first(_.filter(nextSlices, function(ts){
      return !isNaN(ts.startTime);
    }));
  };

  var getSumOfPreviousRepetitions = function(allTimeSlices, timeSlice){
    var backSlice = getFirstPreceedingSliceWithStartTime(allTimeSlices, timeSlice);
    var allPreviousSlices = getPreviousTimeSlices(allTimeSlices, timeSlice);
    var inBetweenSlices = getNextTimeSlices(allPreviousSlices, backSlice).concat([backSlice]);
    return _.reduce(inBetweenSlices, function(acc, ts){
      return acc + ts.repetition;
    }, 0);
  };

  var getSumOfNextRepetitions = function(allTimeSlices, timeSlice){
    var forwardSlice = getFirstSucceedingSliceWithStartTime(allTimeSlices, timeSlice);
    var allNextSlices = getNextTimeSlices(allTimeSlices, timeSlice);
    var inBetweenSlices = getPreviousTimeSlices(allNextSlices, forwardSlice);
    inBetweenSlices = inBetweenSlices.concat([timeSlice]);
    return _.reduce(inBetweenSlices, function(acc, ts){
      return acc + ts.repetition;
    }, 0);
  };

  var getMostRecentTempo = function(allTimeSlices, timeSlice){
    var prevSlice = getFirstPreceedingSliceWithStartTime(allTimeSlices, timeSlice);
    var prevprevSlice = getFirstPreceedingSliceWithStartTime(allTimeSlices, prevSlice);
    var delta = prevSlice.startTime - prevprevSlice.startTime;
    return delta / prevprevSlice.repetition;
  };

  var fillStartTime = function(allTimeSlices, timeSlice){
    var previousTime = getFirstPreceedingSliceWithStartTime(allTimeSlices, timeSlice).startTime;
    var nextTimeSlice = getFirstSucceedingSliceWithStartTime(allTimeSlices, timeSlice);
    var prevReps = getSumOfPreviousRepetitions(allTimeSlices, timeSlice);
    if(nextTimeSlice != undefined){
      var nextReps = getSumOfNextRepetitions(allTimeSlices, timeSlice);
      var nextTime = nextTimeSlice.startTime;
      var delta = nextTime - previousTime;
      var ratio = prevReps / (prevReps + nextReps);
      timeSlice.startTime = previousTime + (ratio * delta);
    } else {
      var secondsPerBar = getMostRecentTempo(allTimeSlices, timeSlice);
      timeSlice.startTime = previousTime + (prevReps * secondsPerBar);
    }
  };

  var fillAllStartTime = function(allTimeSlices){
    var emptySlices = _.filter(allTimeSlices, function(ts){
      return isNaN(ts.startTime);
    });
    _.each(emptySlices, function(ts){
      fillStartTime(allTimeSlices, ts);
    });
    return allTimeSlices;
  };

  var getTotalSeconds = function(startTime){
    return (parseInt(startTime.minutes) * 60) + parseFloat(startTime.seconds);
  };

  var heartbeat = "";
  var triggerHeartbeat = function(numberOfBeats){
    var trigger = function(){
      var len = heartbeat.length;
      if(len % numberOfBeats == 0) {
        heartbeat = heartbeat + ((len / numberOfBeats) + 1);
      } else {
        heartbeat = heartbeat + ".";
      }
      display.trigger('heartbeat', heartbeat);
    };
    return trigger;
  };

  var clearHeartbeat = function(){
    heartbeat = "";
    clearInterval(heartbeatInterval);
  };

  var startHeartbeat = function(duration, numberOfBeats){
    var trigger = triggerHeartbeat(numberOfBeats);
    trigger();
    heartbeatInterval = setInterval(trigger, duration);
  };

  var checkTriggers = function(){
    var currentTime = getTotalSeconds(player.audioPlayer('getCurrentTime'));
      if(currentTimeSlice != undefined && (currentTimeSlice.startTime + viewDelay) <= currentTime){

        var idx = _.indexOf(allTimeSlices, currentTimeSlice);
        var nextSlice = allTimeSlices[idx+1];
        var delta = nextSlice.startTime - currentTimeSlice.startTime;
        var heartbeatDuration = delta / (currentTimeSlice.repetition * currentTimeSlice.numberOfBeats);
        console.log(viewDelay);
        setTimeout(function(){
          clearHeartbeat();
          startHeartbeat(heartbeatDuration * 1000, currentTimeSlice.numberOfBeats);
        }, (-1 * viewDelay) * 1000);

        display.trigger('highlightLine', [currentTimeSlice.section, currentTimeSlice.line]);

        currentTimeSlice = nextSlice;
      }
  };

  var createTimeSlices = function(songStructure){
    var sectionTimeSlices = _.map(songStructure, function(section, idxSection, sections){
      return _.map(section.songLines, function(songLine, idxLine, songLines){
        return {
          section: idxSection,
          line: idxLine,
          startTime: getTotalSeconds(songLine.startTime),
          repetition: songLine.repetition,
          numberOfBeats: section.timeSignature.beats
        };
      });
    });
    var sparseTimeSlices = _.flatten(sectionTimeSlices);
    return fillAllStartTime(sparseTimeSlices);
  };

  var play = function(){
    player.audioPlayer('play');
    highlightCheckInterval = setInterval(checkTriggers, 10);
  };

  var pause = function(){
    player.audioPlayer('pause');
    clearInterval(highlightCheckInterval);
    clearHeartbeat();
  };

  var skipTo = function(idxSection, idxLine){};
  var setViewDelay = function(delay){};

  var init = function(givenSongStructure, givenPlayer, givenViewDelay){
    viewDelay = givenViewDelay;
    player = givenPlayer;
    songStructure = givenSongStructure;
    display = this;
    allTimeSlices = createTimeSlices(songStructure);
    window.allTimeSlices = allTimeSlices;
    currentTimeSlice = allTimeSlices[0];
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
