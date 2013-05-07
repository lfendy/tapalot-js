(function($){

  var getPreviousTimeSlice = function(timeSlices, timeSlice){
    if(timeSlice == null){
      return _.last(timeSlices.flat);
    }
    var idx = _.indexOf(timeSlices.flat, timeSlice);
    return timeSlices.flat[idx-1];
  };

  var getNextTimeSlice = function(timeSlices, timeSlice){
    if(timeSlice == null){
      return _.first(timeSlices.flat);
    }
    var idx = _.indexOf(timeSlices.flat, timeSlice);
    return timeSlices.flat[idx+1];
  };

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

  var hasStartTime = function(timeSlice){
    return timeSlice.startTime != null;
  };

  var getFirstPreceedingSliceWithStartTime = function(allTimeSlices, timeSlice){
    var previousSlices = getPreviousTimeSlices(allTimeSlices, timeSlice);
    return _.last(_.filter(previousSlices, function(ts){
      return hasStartTime(ts);
    }));
  };

  var getFirstSucceedingSliceWithStartTime = function(allTimeSlices, timeSlice){
    var nextSlices = getNextTimeSlices(allTimeSlices, timeSlice);
    return _.first(_.filter(nextSlices, function(ts){
      return hasStartTime(ts);
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
    var delta = prevSlice.startTime.differenceWith(prevprevSlice.startTime).totalSeconds;
    return delta / prevprevSlice.repetition;
  };

  var fillStartTime = function(allTimeSlices, timeSlice){
    var previousTime = getFirstPreceedingSliceWithStartTime(allTimeSlices, timeSlice).startTime;
    var nextTimeSlice = getFirstSucceedingSliceWithStartTime(allTimeSlices, timeSlice);
    var prevReps = getSumOfPreviousRepetitions(allTimeSlices, timeSlice);
    if(nextTimeSlice != undefined){
      var nextReps = getSumOfNextRepetitions(allTimeSlices, timeSlice);
      var nextTime = nextTimeSlice.startTime;
      var delta = nextTime.differenceWith(previousTime).totalSeconds;
      var ratio = prevReps / (prevReps + nextReps);
      timeSlice.startTime = $.tapalot.time(previousTime.totalSeconds + (ratio * delta));
    } else {
      var secondsPerBar = getMostRecentTempo(allTimeSlices, timeSlice);
      timeSlice.startTime = $.tapalot.time(previousTime.totalSeconds + (prevReps * secondsPerBar));
    }
  };

  var fillAllStartTime = function(allTimeSlices){
    var emptySlices = _.filter(allTimeSlices, function(ts){
      return !hasStartTime(ts);
    });
    _.each(emptySlices, function(ts){
      fillStartTime(allTimeSlices, ts);
    });
    return allTimeSlices;
  };

  var fillHeartBeatDuration = function(allTimeSlices){
    _.each(allTimeSlices, function(slice, idx, slices){
      var delta = 0;
      var nextSlice = slices[idx + 1]
      if(nextSlice != null){
        delta = nextSlice.startTime.differenceWith(slice.startTime).totalSeconds;
      } else {
        var secondsPerBar = getMostRecentTempo(slices, slice);
        delta = secondsPerBar * slice.repetition;
      }
      var totalBeats = slice.repetition * slice.beatsPerBar;
      slice.heartbeatDuration = delta / totalBeats;
    });
  };

  var createTimeSlices = function(songStructure){
    var hierarchicalTimeSlices = _.map(songStructure, function(section, idxSection, sections){
      return _.map(section.songLines, function(songLine, idxLine, songLines){
        return {
          section: idxSection,
          line: idxLine,
          startTime: songLine.startTime,
          repetition: songLine.repetition,
          beatsPerBar: section.timeSignature.beats
        };
      });
    });
    var flatTimeSlices = _.flatten(hierarchicalTimeSlices);
    fillAllStartTime(flatTimeSlices);
    fillHeartBeatDuration(flatTimeSlices);
    return {
      hierarchical: hierarchicalTimeSlices,
      flat: flatTimeSlices
    };
  };

  $.tapalot = $.tapalot || {};
  $.tapalot.timeSlice = {
    createTimeSlices: createTimeSlices,
    getPreviousTimeSlice: getPreviousTimeSlice,
    getNextTimeSlice: getNextTimeSlice

  };


})(jQuery);
