(function($){

  const PLAYING = "playing";
  const SONGLINE = "song_line";

  var getId = function(idxSection, idxLine){
    return "section_" + idxSection.toString() + "_line_" + idxLine.toString();
  };

  var textRenderer = function(){
    var renderTimeSignature = function(timeSignature){
      return timeSignature.beats + "/" + timeSignature.noteValue;
    };

    var renderLine = function(id, songLine){
      var repetition = songLine.repetition;
      var text = songLine.lineText;
      var startTime = songLine.startTime == null || songLine.startTime.minutes == null ? "" : " @" + songLine.startTime.minutes + ":" + songLine.startTime.seconds;
      return repetition + "x " + text + startTime;
    };

    return {
      renderLine: renderLine,
      renderTimeSignature: renderTimeSignature
    };
  };

  var htmlRenderer = function(){
    var renderTimeSignature = function(timeSignature){
      return null;
    };

    var renderLine = function(id, songLine){
      var $newDiv = $(document.createElement('div'));
      $newDiv
        .append(songLine.lineText)
        .attr("id", id)
        .addClass(SONGLINE);

      return $newDiv;
    };

    return {
      renderLine: renderLine,
      renderTimeSignature: renderTimeSignature
    };
  };



  var renderLines = function(songLines, idxSection, renderer){
    return _.map(songLines, function(songLine, idxLine){
      return renderer.renderLine(getId(idxSection, idxLine), songLine);
    });
  };

  var renderSections = function(songStructure, renderer){
    return _.flatten(_.map(songStructure, function(songSection, idxSection){
      var ts = renderer.renderTimeSignature(songSection.timeSignature);
      return [ts].concat(renderLines(songSection.songLines, idxSection, renderer));
    }));
  };


  var renderText = function(givenSongStructure){
    return renderSections(givenSongStructure, textRenderer()).join("\n");;
  };

  var init = function(givenSongStructure){
    var $this = $(this);

    var clear = function(){
      $this.children().remove();
    };

    var renderHtml = function(givenSongStructure){
      $this.append(renderSections(givenSongStructure, htmlRenderer()));
    };

    clear();
    renderHtml(givenSongStructure);

    return $this;
  };

  var unhighlight = function(){
    $("div." + SONGLINE).removeClass(PLAYING);
  };

  var highlight = function(idxSection, idxLine){
    unhighlight();
    var id = getId(idxSection, idxLine);
    $("#" + id).addClass(PLAYING);
  };

  var methods = {
    init: init,
    highlight: highlight,
    renderText: renderText
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

  $.fn.renderer = methodInvoker;
})(jQuery);