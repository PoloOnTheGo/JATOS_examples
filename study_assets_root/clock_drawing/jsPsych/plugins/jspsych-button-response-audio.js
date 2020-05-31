/**
 * jspsych-button-response-audio
 * Josh de Leeuw
 *
 * plugin for playing an audio file and getting a button response
 *
 * documentation: docs.jspsych.org
 *
 * adapted by Becky Gilbert, based on Josh de Leeuw's single-audio and button-response plugins 
 * 
 **/

 jsPsych.plugins["button-response-audio"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('button-response-audio', 'stimulus', 'audio');

  plugin.info = {
    name: 'button-response-audio',
    description: '',
    parameters: {
      stimulus: {
        type: [jsPsych.plugins.parameterType.STRING], 
        default: undefined,
        no_function: false,
        description: ''
      },
      choices: {
        type: [jsPsych.plugins.parameterType.STRING], 
        array: true,
        default: [], 
        no_function: false,
        description: ''
      },
      button_html: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '<button class="jspsych-btn">%choice%</button>',
        no_function: false,
        array: true,
        description: ''
      },
      prompt: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      },
      timing_response: {
        type: [jsPsych.plugins.parameterType.INT],
        default: -1,
        no_function: false,
        description: ''
      },
      response_ends_trial: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: true,
        no_function: false,
        description: ''
      },
      trial_ends_after_audio: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      ignore_responses_during_audio: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
    }
  };

  plugin.trial = function(display_element, trial) {

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // default parameters
    trial.choices = trial.choices || " ";
    trial.response_ends_trial = (typeof trial.response_ends_trial === 'undefined') ? true : trial.response_ends_trial;
    trial.trial_ends_after_audio = (typeof trial.trial_ends_after_audio === 'undefined') ? false : trial.trial_ends_after_audio;
    trial.timing_response = trial.timing_response || -1; // if -1, then wait for response forever
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;
    trial.button_html = trial.button_html || '<button class="jspsych-btn">%choice%</button>';
    trial.margin_vertical = trial.margin_vertical || "0px";
    trial.margin_horizontal = trial.margin_horizontal || "8px";
    trial.ignore_responses_during_audio = (typeof trial.ignore_responses_during_audio === 'undefined') ? false : trial.ignore_responses_during_audio;

    // set up stimulus
    var context = jsPsych.pluginAPI.audioContext();
    if(context !== null){
      var source = context.createBufferSource();
      source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      source.connect(context.destination);
    } else {
      var audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      audio.currentTime = 0;
    }

    // clear display
    display_element.innerHTML = "";

    // add buttons
    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.choices.length) {
        buttons = trial.button_html;
      } else {
        console.error('Error in button-response plugin. The length of the button_html array does not equal the length of the choices array');
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
        buttons.push(trial.button_html);
      }
    }
    display_element.innerHTML += '<div id="jspsych-button-response-btngroup"></div>';

    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      if (!trial.ignore_responses_during_audio) {
        // if responses are allowed during the audio play, then event listener is active immediately
        display_element.querySelector('#jspsych-button-response-btngroup').insertAdjacentHTML('beforeend',
          '<div class="jspsych-button-response-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>');
        display_element.querySelector('#jspsych-button-response-button-' + i).addEventListener('click', function(e){var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
          after_response(choice);
        });
      } else { 
        // disable buttons if responses not allowed during audio play
        display_element.querySelector('#jspsych-button-response-btngroup').insertAdjacentHTML('beforeend',
          '<div class="jspsych-button-response-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>');
        display_element.querySelector('#jspsych-button-response-button-' + i).addEventListener('click', function(e){var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
          after_response(choice);
        });
        currBtn = display_element.querySelectorAll("button")[i];
        currBtn.disabled = true;
      }
    }

    // add event listener for audio ended event to get time stamps and enable buttons if needed
    if(context !== null){
      source.onended = sound_ended;
    } else {
      audio.addEventListener('ended', sound_ended);
    }

    // show prompt if there is one
    if (trial.prompt !== "") {
      display_element.insertAdjacentHTML('afterbegin', trial.prompt);
    }

    // store response
    var response = {
      rt: -1,
      button: -1,
      rt_audio: -1
    };

    var sound_end_time = -1;
    // function to handle audio end event
    function sound_ended() {
      if (context !== null) {
        sound_end_time = context.currentTime * 1000;
      } else {
        sound_end_time = Date.now();
      }
      if (trial.ignore_responses_during_audio) {
        $(':button').prop('disabled',false);
      }
      if (trial.trial_ends_after_audio) {
        end_trial();
      }
    }

    // function to handle responses by the subject
    function after_response(choice) {

      var resp_time = Date.now();
      if (context !== null) {
        // measure rt relative to audio onset with audio context timer if using WebAudio API
        response.rt_audio = (context.currentTime - start_time_audio)*1000;
      } else {
        // otherwise measure rt relative to audio onset with Date method
        response.rt_audio = resp_time - start_time_audio;
      }
      // rt since trial start using Date method
      response.rt = resp_time - start_time;
      response.button = choice;
      
      $('.jspsych-btn').prop('disabled',true);

      if (trial.response_ends_trial) {
        end_trial();
      }
    }

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      // get response time relative to sound offset, if both events occurred
      var rt_from_audio_end = -1;
      var audio_duration = -1;
      if(context !== null){
        source.onended = function() { };
        source.stop();
        if (response.rt_audio !== -1 && sound_end_time !== -1) {
          rt_from_audio_end = response.rt_audio - (sound_end_time - (start_time_audio*1000));
          audio_duration = sound_end_time - (start_time_audio*1000);
        }
      } else {
        audio.removeEventListener('ended', end_trial);
        audio.pause();
        if (response.rt !== -1 && sound_end_time !== -1) {
          rt_from_audio_end = response.rt - sound_end_time;
          audio_duration = sound_end_time - start_time_audio;
        }
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "rt_audio": context !== null ? response.rt_audio : -1,
        "audio_ended": sound_end_time == -1 ? false : true,
        "audio_duration": audio_duration,
        "rt_from_audio_end": rt_from_audio_end,
        "stimulus": trial.stimulus,
        "button_pressed": response.button
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    }

    // start audio
    var start_time_audio;
    if(context !== null){
      start_time_audio = context.currentTime + 0.1;
      source.start(start_time_audio);
    } else {
      start_time_audio = Date.now();
      audio.play();
    }

    // start timing
    var start_time = Date.now();

    // end trial if time limit is set
    if (trial.timing_response > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.timing_response);
    }

  };

  return plugin;
})();
