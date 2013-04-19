(function($){

  const PLAYING = "playing";
  const SONGLINE = "song_line";

  var getId = function(idxSection, idxLine){
    return "rendered_section_" + idxSection.toString() + "_line_" + idxLine.toString();
  };

  var init = function(givenSongStructure){
    var $this = $(this);

    var renderLine = function(id, songLine){
      var $newDiv = $(document.createElement('div'));
      $newDiv
        .append(songLine.lineText)
        .attr("id", id)
        .addClass(SONGLINE);

      $this.append($newDiv);
    };

    var renderLines = function(songLines, idxSection){
      _.each(songLines, function(songLine, idxLine){
        renderLine(getId(idxSection, idxLine), songLine);
      });
    };

    var renderSections = function(songStructure){
      _.each(songStructure, function(songSection, idxSection){
        renderLines(songSection.songLines, idxSection);
      });
    };

    var clear = function(){
      $this.children().remove();
    };

    renderSections(givenSongStructure);

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
    highlight: highlight
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
