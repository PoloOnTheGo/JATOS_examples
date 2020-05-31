/**
 * jsPsych plugin for canvas drawing
 *
 * based on plugins by Josh de Leeuw
 * created by Becky Gilbert
 *
 */

jsPsych.plugins['canvas-drawing-circle'] = (function() {

  var plugin = {};

  //jsPsych.pluginAPI.registerPreload('jspsych-canvas-drawing', 'stimuli', 'image');

  plugin.info = {
    name: 'canvas-drawing-circle',
    description: '',
    parameters: {
      choices: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        array: true,
        default: jsPsych.ALL_KEYS,
        no_function: false,
        description: ''
      },
      canvas_size: {
        type: [jsPsych.plugins.parameterType.INT],
        array: true,
        default: [400,400],
        no_function: false,
        description: ''
      },
      preamble: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: false,
        default: '',
        no_function: false,
        description: ''
      },
      response_ends_trial: {
        type: [jsPsych.plugins.parameterType.INT],
        array: false,
        default: true,
        no_function: false,
        description: ''
      },
      trial_duration: {
        type: [jsPsych.plugins.parameterType.INT],
        array: false,
        default: -1,
        no_function: false,
        description: ''
      },
      allow_keys: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: true,
        no_function: false,
        description: ''
      },
      key_done: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        default: 'rightarrow',
        no_function: false,
        description: ''
      },
      key_clear: {
        type: [jsPsych.plugins.parameterType.KEYCODE],
        default: 'leftarrow',
        no_function: false,
        description: ''
      },
      show_clickable_nav: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      button_label_done: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: false,
        default: 'Done',
        no_function: false,
        description: ''
      },
      button_label_clear: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: false,
        default: 'Clear',
        no_function: false,
        description: ''
      }
    }
  };

  plugin.trial = function(display_element, trial) {

    // default trial parameters
    trial.canvas_size = trial.canvas_size || [400, 400];
    trial.choices = trial.choices || jsPsych.ALL_KEYS;
    trial.preamble = trial.preamble || '';
    trial.response_ends_trial = trial.response_ends_trial || true;
    trial.trial_duration = trial.trial_duration || -1;
    trial.allow_keys = (typeof trial.allow_keys === 'undefined') ? true : trial.allow_keys;
    trial.key_done = trial.key_done || 'rightarrow';
    trial.key_clear = trial.key_clear || 'leftarrow';
    trial.show_clickable_nav = (typeof trial.show_clickable_nav === 'undefined') ? false : trial.show_clickable_nav;
    trial.button_label_done = (typeof trial.button_label_done === 'undefined') ? 'Done' : trial.button_label_done;
    trial.button_label_clear = (typeof trial.button_label_clear === 'undefined') ? 'Clear' : trial.button_label_clear;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // data variables
    var start_time = (new Date()).getTime();
    var response_key, rt, image_data;

    var html_string = '<div id="preamble">' + trial.preamble + '</div>';

    html_string += '<canvas id="canvas" width="' + trial.canvas_size[0] + '" height="' + trial.canvas_size[1] + '">Your browser doesn&#39;t support canvas</canvas>';
    // add buttons
    if (trial.show_clickable_nav) {
      html_string += "<div class='jspsych-canvas-drawing-nav' style='padding: 10px 0px;'><button id='jspsych-canvas-drawing-clear' class='jspsych-btn' style='margin-right: 10px;'>"+trial.button_label_clear+"</button><button id='jspsych-canvas-drawing-done' class='jspsych-btn' style='margin-left: 10px;'>"+trial.button_label_done+"</button></div>";
    }
    display_element.innerHTML = html_string;

    // set up canvas
    var canvas = document.getElementById("canvas"); 
    var ctx = canvas.getContext("2d"); 
    var center_x = trial.canvas_size[0]/2;
    var center_y = trial.canvas_size[1]/2;
    var radius = trial.canvas_size[0] * 0.48;

    // draw circle for clock face
    function draw_clock_circle() {
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(center_x,center_y,radius,0,2*Math.PI);
      ctx.stroke();
    }
    draw_clock_circle();

    function winCoorsToCanvasCoors(coors) {
      function getOffset(el) {
        el = el.getBoundingClientRect();
        return {
          left: el.left + window.scrollX,
          top: el.top + window.scrollY
        };
      }
      function getScrollXY() {
        var scrOfX = 0, scrOfY = 0;
        if( typeof( window.pageYOffset ) == 'number' ) {
          //Netscape compliant
          scrOfY = window.pageYOffset;
          scrOfX = window.pageXOffset;
        } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
          //DOM compliant
          scrOfY = document.body.scrollTop;
          scrOfX = document.body.scrollLeft;
        } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
          //IE6 standards compliant mode
          scrOfY = document.documentElement.scrollTop;
          scrOfX = document.documentElement.scrollLeft;
        }
        return {left: scrOfX, top: scrOfY};
      }
      var scroll_offset = getScrollXY();
      var new_x = coors.x - getOffset(canvas).left + scroll_offset.left;
      var new_y = coors.y - getOffset(canvas).top + scroll_offset.top;
      return {x: new_x, y: new_y};
    }

    // functions for mouse drawing
    var start = function(coors) {
      var canvas_coors = winCoorsToCanvasCoors(coors);
      ctx.beginPath();
      // ctx.moveTo(coors.x, coors.y);
      ctx.moveTo(canvas_coors.x, canvas_coors.y);
      this.isDrawing = true;
    };
    var move = function(coors) {
      if (this.isDrawing) {
        var canvas_coors = winCoorsToCanvasCoors(coors);
        ctx.strokeStyle = "#000000";
        ctx.lineJoin = "round";
        ctx.lineWidth = 4;
        // ctx.lineTo(coors.x, coors.y);
        ctx.lineTo(canvas_coors.x, canvas_coors.y);
        ctx.stroke();
      }
    };
    var stop = function(coors) {
      if (this.isDrawing) {
        var canvas_coors = winCoorsToCanvasCoors(coors);
        // this.touchmove(coors);
        //this.touchmove(canvas_coors);
        this.isDrawing = false;
      }
    };
    var drawer = {
      isDrawing: false,
      mousedown: start,
      mousemove: move,
      mouseup: stop,
      touchstart: start,
      touchmove: move,
      touchend: stop
    };
    var draw = function(e) {
      var coors = {
        x: e.clientX || e.targetTouches[0].pageX,
        y: e.clientY || e.targetTouches[0].pageY
      };
      drawer[e.type](coors);
    };
    canvas.addEventListener('mousedown', draw, false);
    canvas.addEventListener('mousemove', draw, false);
    canvas.addEventListener('mouseup', draw, false);
    canvas.addEventListener('touchstart', draw, false);
    canvas.addEventListener('touchmove', draw, false);
    canvas.addEventListener('touchend', draw, false);

    // prevent elastic scrolling
    document.body.addEventListener('touchmove', function(e) {
      e.preventDefault();
    }, false);
    // end body:touchmove
    // window.onresize = function(e) {
    //   canvas.width = document.body.clientWidth;
    //   canvas.height = document.body.clientHeight;
    // };

    // button event handlers
    function clear(ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // trial.canvas_size[0], trial.canvas_size[1]
      draw_clock_circle();
    }
    function done(canvas) {
      // save data
      var canvas_data = canvas.toDataURL("image/png");
      image_data = "imgData=" + canvas_data;
      endTrial();
    }

    function btnListener(evt, ctx, canvas){
      evt.target.removeEventListener('click', btnListener);
      if(evt.target.id === "jspsych-canvas-drawing-clear"){
        clear(ctx);
      }
      else if(evt.target.id === 'jspsych-canvas-drawing-done'){
        done(canvas);
      }
    }
    // add button event listeners
    if (trial.show_clickable_nav) {
      display_element.querySelector('#jspsych-canvas-drawing-clear').addEventListener('click', (function(ctx_arg, canvas_arg) {
        return function(e) {btnListener(e, ctx_arg, canvas_arg);};
      })(ctx, canvas), false);
      display_element.querySelector('#jspsych-canvas-drawing-done').addEventListener('click', (function(ctx_arg, canvas_arg) {
        return function(e) {btnListener(e, ctx_arg, canvas_arg);};
      })(ctx, canvas), false);
    }

    // add key listener to end trial
    if (trial.allow_keys) {
      var after_response = function(info) {
        response_key = info.key;
        rt = info.rt;
        if (trial.response_ends_trial) {
          endTrial();
        }
      };

      key_listener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: true,
        allow_held_key: false
      });
    }

    function endTrial() {
      display_element.innerHTML = '';
      var trial_data;
      if (trial.allow_keys) {
        jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);
        trial_data = {
          "image_data": JSON.stringify(image_data),
          "response_key": response_key,
          "rt": rt
        };
      } else {
        trial_data = {
          "image_data": JSON.stringify(image_data),
          "rt": (new Date()).getTime() - start_time
        };
      }
      jsPsych.finishTrial(trial_data);
    }

    // end trial if timing_response is set
    if (trial.timing_response > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.timing_response);
    }

  };

  return plugin;
})();
