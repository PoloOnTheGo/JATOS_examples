jsPsych['t-and-c'] = (function(){
    // written in 2015 by a jsPsych google group user: https://groups.google.com/forum/#!searchin/jspsych/fullscreen|sort:relevance/jspsych/qP1qV82msm0/aIW1BMht0IsJ
    // so probably needs updating to work with jsPsych 6

    // var intro = {        
    //     type: 't-a-c',
    //     text: '<p>Dear participant, bla bla bla do you really want this?</p>',
    //     check_text: "I do agree to the terms and conditions", 
    //     button_text: "continue"    
    // }    
    // experiment.push(intro);

    var plugin = {};

    plugin.create = function(params){
        var trials = [];

        trials[0] = {};
        trials[0].text = params.text;
        trials[0].check = params.check_text;
        trials[0].button = params.button_text;

        return trials;
    };
       
    plugin.trial = function(display_element, trial){
        display_element.html(trial.text);
                display_element.append("<div class='jspsych-t-a-c'><input type='checkbox' name='jspsych-t-a-c-checkbox' value='jspsych-t-a-c-checkbox-value' id='jspsych-t-a-c-checkbox-id'>" + trial.check + "</input></div>");
        display_element.append("<div class='jspsych-t-a-c'><button id='jspsych-t-a-c-button'>" + trial.button + " &gt;</button></div>");
        document.getElementById('jspsych-t-a-c-button').style.color = "#AAA";
        $('#jspsych-t-a-c-checkbox-id').on('click',function(){
            if (document.getElementById('jspsych-t-a-c-checkbox-id').checked) document.getElementById('jspsych-t-a-c-button').style.color = "#555";
            else document.getElementById('jspsych-t-a-c-button').style.color = "#AAA";
        });
        $('#jspsych-t-a-c-button').on('click',function(){
            if (document.getElementById('jspsych-t-a-c-checkbox-id').checked) {
                display_element.html('');
                jsPsych.finishTrial();
            }
                    });
    };

    return plugin;

})();