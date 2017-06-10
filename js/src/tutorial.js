(function() {
  var head = document.getElementsByTagName('head')[0];
  var popperScript = document.createElement('script');
  popperScript.src = 'https://unpkg.com/popper.js';
  popperScript.onload = loadJquery;
  head.appendChild(popperScript);

  function loadJquery() {
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
      this.tutorialItemIndex = 0;
      this.tutorialItems = [];
    },

    start: function() {
      this.bindEvents();

      if (!this.options.active) {
        console.log(this.options.name + " is NOT active.");
        return;
      }

      if (this.tutorialItems.length === 0) {
        console.log(this.options.name + " has ZERO tutorial items.");
        return;
      } else {
        this.initTutorialItem();
      }
    },

    initTutorialItem: function() {
      var tutorialItems = this.tutorialItems;
      var index = this.tutorialItemIndex;

      if (index < tutorialItems.length - 1) {
        tutorialItems[index].show(next = true);
      } else {
        tutorialItems[index].show();
      }
    },

    nextTutorialItem: function() {
      var tutorialItems = this.tutorialItems;
      var index = this.tutorialItemIndex;

      tutorialItems[index].hide();
      this.tutorialItemIndex++

      this.initTutorialItem();
    },

    finishTutorial: function() {
      var tutorialItems = this.tutorialItems;
      var index = this.tutorialItemIndex;

      tutorialItems[index].hide();

      stepThroughTutorials();
    },

    bindEvents: function() {
      //Next button action
      $(document).on('click', '.bubble-action.action-next', this.nextTutorialItem.bind(this));

      //Close button action
      $(document).on('click', '.bubble-action.action-close', this.finishTutorial.bind(this));
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
      this.element = this.options.css_selector;
      this.template = $('<div class="bubble"><div class="bubble-arrow" x-arrow></div><div class="bubble-inner"></div></div>');
    },

    show: function(next = false) {
      if ($(this.element).css('display') === 'none') {
        console.log("Element is not visible!");
        return;
      }

      if (this.options.content) {
        this.setContent(next);
      }

      $('body').append(this.template);

      var reference = document.querySelector(this.element);
      var popper = new Popper(reference, this.template[0], {
          onCreate: (data) => {
            //actions when popper created
          },
          onUpdate: (data) => {
            //actions when popper updated
          },
          modifiers: {
            preventOverflow: {
                enabled: false
            },
            hide: {
              enabled: false
            }
          },
        }
      );
    },

    hide: function() {
      var $bubble = this.template;
      $bubble.detach();
    },

    setContent: function(next) {
      var $bubble = this.template;
      var content = this.options.content;
      $bubble.find('.bubble-inner')['text'](content);

      //if there is a tutorial item that is next show this, otherwise, show nothing
      if (next) {
        var $actionBtn = '<div class="bubble-action action-next">Next</div>';
      } else {
        var $actionBtn = '<div class="bubble-action action-close">Close</div>';
      }

      $bubble.append($actionBtn);
    }
  }

  /* START OF DATA WRANGLING
  * =============================== */

  var _tutorialsArray = null;
  var _tutorialindex = 0;

  function stepThroughTutorials() {
    if (_tutorialindex < _tutorialsArray.length) {
      _tutorialsArray[_tutorialindex].start();
      _tutorialindex++;
    }
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

  function main() { 
    jQuery(document).ready(function($) { 
        /******* Load CSS *******/
        var css_link = $("<link>", { 
            rel: "stylesheet", 
            type: "text/css", 
            href: "../bubble_tutorial_script/style/tutorial.css" 
        });
        css_link.appendTo('head');          

        var api_url = "http://api.stevenlocal.com:3000/v1/sites/1/tutorials";
        $.getJSON(api_url, function(data) {

          if (data['data'].length === 0) {
            console.log("data member is empty; no tutorials");
            return;
          }

          var result = parseTutorialData(data);
          //console.log(result);
          
          _tutorialsArray = result;

          stepThroughTutorials();
        });
    });
  }

})();