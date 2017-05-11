(function() {

  var jQuery;

  if (window.jQuery === undefined) {
    console.log("jquery was not found");

    var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src",
        "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js");
    if (script_tag.readyState) {
      script_tag.onreadystatechange = function () { // For old versions of IE
          if (this.readyState == 'complete' || this.readyState == 'loaded') {
              scriptLoadHandler();
          }
      };
    } else {
      script_tag.onload = scriptLoadHandler;
    }
    // Try to find the head, otherwise default to the documentElement
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
  } else {
    console.log("jquery was found");
    // The jQuery version on the window is the one we want to use
    jQuery = window.jQuery;
    main();
  }

  function scriptLoadHandler() {
    // Restore $ and window.jQuery to their previous values and store the
    // new jQuery in our local jQuery variable
    jQuery = window.jQuery.noConflict(true);
    // Call our main function
    main(); 
  }

  /* TUTORIAL PUBLIC CLASS DEFINITION
  * =============================== */

  var Tutorial = function(options) {
    this.init('tutorial', options);
  }

  Tutorial.prototype = {

    constructor: Tutorial,

    init: function(type, options) {
      this.type = type;
      this.options = options;

      console.log(this.options.name);
    }
    
  }

  function main() { 
    jQuery(document).ready(function($) { 
        /******* Load CSS *******/
        // var css_link = $("<link>", { 
        //     rel: "stylesheet", 
        //     type: "text/css", 
        //     href: "style.css" 
        // });
        // css_link.appendTo('head');          

        var api_url = "http://api.stevenlocal.com:3000/v1/sites/1/tutorials";
        $.getJSON(api_url, function(data) {
          //data['data'][0]['attributes'].name;

          if (data['data'].length === 0) {
            console.log("data member is empty; no tutorials");
            return;
          }

          parseTutorialData(data);
        });
    });
  }

  function parseTutorialData(data) {
    var dataArray = data['data'];
    var includedArray = data['included'];

    console.log(includedArray[0]['attributes']);

    if (includedArray.length === 0) {
      console.log("included member is empty; no tutorial items");
      return;
    }

    var tutorialsArray = [];
    var tutorialItemsArray = [];


    /*
    In this loop, I will be making each peice of the response into a Tutorial and Tutorial Object.
    Probably this part could even but a new function.
    I can have conditional flow here, like order and active?
    */
    for (i = 0; i < dataArray.length; i++) {
      new Tutorial(dataArray[i]['attributes']);
    }
  }

})();