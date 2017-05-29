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
      this.tutorialItems = [];
    },

    start: function() {
      if (!this.options.active) {
        console.log(this.options.name + " is NOT active.");
        return;
      }

      if (this.tutorialItems.length === 0) {
        console.log(this.options.name + " has ZERO tutorial items.");
        return;
      } else {
        this.stepThroughTutorialItems(this.tutorialItems);
      }
    },

    stepThroughTutorialItems: function(tutorialItems) {

    }
    
  }

  /* TUTORIAL ITEM PUBLIC CLASS DEFINITION
  * =============================== */

  var TutorialItem = function(options) {
    this.init('tutorialItem', options);
  }

  TutorialItem.prototype = {

    constructor: TutorialItem,

    init: function(type, options) {
      this.type = type;
      this.options = options;
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

          if (data['data'].length === 0) {
            console.log("data member is empty; no tutorials");
            return;
          }

          var result = parseTutorialData(data);
          console.log(result);
          //for testing
          for (i = 0; i < result.length; i++) {
            result[i].start();
          }

        });
    });
  }

  function parseTutorialData(data) {
    var dataArray = data['data'];
    var includedArray = data['included'];

    if (includedArray.length === 0) {
      console.log("included member is empty; no tutorial items");
      return;
    }

    var tutorialsArray = [];

    for (i = 0; i < dataArray.length; i++) {
      var tutorial = new Tutorial(dataArray[i]['attributes']);
      var tutorialItemRelationships = dataArray[i]['relationships']['tutorial_items']['data'];

      for (j = 0; j < includedArray.length; j++) {
        var tutorialItemId = includedArray[j]['id'];

        for (t = 0; t < tutorialItemRelationships.length; t++) {
          var relId = tutorialItemRelationships[t]['id'];

          if (relId === tutorialItemId) {
            tutorial.tutorialItems.push(new TutorialItem(includedArray[j]['attributes']));
          }
        }
      }

      tutorialsArray.push(tutorial);
    }

    return tutorialsArray;
  }

})();