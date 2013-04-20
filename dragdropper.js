(function($){
  var dragdropper_init = function(){
    var $this = $(this);

    var getFileExtension = function(fileName){
      return _.last(fileName.split('.')).toLowerCase();
    };

    var handleFinishReadingTXT = function(evt){
      var data = {contents: evt.target.result};
      $this.trigger("receivedTXT", data);
    };

    var handleFinishReadingPEG = function(evt){
      var data = {contents: evt.target.result};
      $this.trigger("receivedPEG", data);
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
            var data = {url: url}
            $this.trigger("receivedMP3", data);
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
