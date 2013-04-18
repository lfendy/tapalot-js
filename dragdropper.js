(function($){
  var dragdropper_init = function(){
    var $this = $(this);

    var getFileExtension = function(fileName){
      return _.last(fileName.split('.')).toLowerCase();
    };

    var handleFinishReadingTXT = function(evt){
      var newEvent = $.Event("receivedTXT");
      newEvent.contents = evt.target.result;
      $this.trigger(newEvent)
    };

    var handleFinishReadingPEG = function(evt){
      var newEvent = $.Event("receivedPEG");
      newEvent.contents = evt.target.result;
      $this.trigger(newEvent)
    };

    var handleDragOver = function(evt){
      evt.stopPropagation();
      evt.preventDefault();
      evt.originalEvent.dataTransfer.dropEffect = 'copy';
    };

    var handleFileSelect = function(evt){
      evt.stopPropagation();
      evt.preventDefault();

      var files = evt.originalEvent.dataTransfer.files;
      for (var i = 0, f; f = files[i]; i++){
        switch(getFileExtension(f.name)){
          case "mp3":
            var url = URL.createObjectURL(f);
            var newEvent = $.Event("receivedMP3");
            newEvent.url = url;
            $this.trigger(newEvent);
            break;
          case "peg":
            var fr = new FileReader();
            fr.onload = handleFinishReadingPEG;
            fr.readAsText(f);
            break;
          case "txt":
            var fr = new FileReader();
            fr.onload = handleFinishReadingTXT;
            fr.readAsText(f);
            break;
        }
      }

    };

    $this.on('dragover', handleDragOver);
    $this.on('drop', handleFileSelect);

    return $this;
  };
  $.fn.dragdropper = dragdropper_init;
})(jQuery);
