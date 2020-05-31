/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = true

// task specific variables
var practice_len = 10
var exp_len = 300
var contrast = 0.1
var correct_counter = 0
var current_trial = 0
var choices = [37, 39]
var curr_data = {}
var confidence_choices = [49, 50, 51, 52]
var catch_trials = [25, 57, 150, 220, 270]
var confidence_response_area =
	'<div class = centerbox><div class = fixation>+</div></div><div class = response_div>' +
	'<button class = response_button id = Confidence_1>1:<br> Not Confident At All</button>' +
	'<button class = response_button id = Confidence_2>2</button>' +
	'<button class = response_button id = Confidence_3>3</button>' +
	'<button class = response_button id = Confidence_4>4:<br> Very Confident</button>'

var confidence_response_area_key =
	'<div class = centerbox><div class = fixation>+</div></div><div class = response_div>' +
	'<button class = response_button_key id = Confidence_1>1:<br> Not Confident At All</button>' +
	'<button class = response_button_key id = Confidence_2>2</button>' +
	'<button class = response_button_key id = Confidence_3>3</button>' +
	'<button class = response_button_key id = Confidence_4>4:<br> Very Confident</button>'

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end"
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>We are done with practice. We will now start the test. This will be identical to the practice - your task is to indicate where the grating is by pressing the arrow keys. After you make your choice, rate how confident you are that your response was accurate.</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0
};

var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	timing_stim: 1000,
	timing_response: 1000,
	choices: 'none',
	is_html: true,
	data: {
		trial_id: 'fixation'
	},
	timing_post_trial: 0
}

var test_block = {
	type: 'poldrack-single-stim',
	stimulus: getStim,
	timing_stim: 33,
	response_ends_trial: true,
	is_html: true,
	data: {
		trial_id: "stim",
		exp_stage: "test"
	},
	choices: [37, 39],
	timing_post_trial: 0,
	prompt: '<div class = centerbox><div class = fixation>+</div></div>',
	on_finish: function(data) {
		afterTrialUpdate(data)
	}
};

var easy_block = {
	type: 'poldrack-single-stim',
	stimulus: getEasyStim,
	timing_stim: 33,
	response_ends_trial: true,
	is_html: true,
	data: {
		trial_id: "catch",
		exp_stage: "test"
	},
	choices: [37, 39],
	timing_post_trial: 0,
	prompt: '<div class = centerbox><div class = fixation>+</div></div>',
	on_finish: function(data) {
		appendData(data)
	}
};

//below are two different response options - either button click or key press
var confidence_block = {
	type: 'single-stim-button',
	stimulus: confidence_response_area,
	button_class: 'response_button',
	data: {
		trial_id: 'confidence_rating',
		exp_stage: 'test'
	},
	timing_stim: 4000,
	timing_response: 4000,
	response_ends_trial: true,
	timing_post_trial: 0
}

var confidence_key_block = {
	type: 'poldrack-single-stim',
	stimulus: confidence_response_area_key,
	choices: confidence_choices,
	data: {
		trial_id: 'confidence_rating',
		exp_stage: 'test'
	},
	is_html: true,
	timing_stim: 4000,
	timing_response: 4000,
	response_ends_trial: true,
	timing_post_trial: 0,
	on_finish: function(data) {
		var index = confidence_choices.indexOf(data.key_press)
		jsPsych.data.addDataToLastTrial({confidence: 'confidence_' + (index+1)})
	}
}

// Create the experiment timeline in a function so it can be called after JATOS initialized
function createTimeline() {
	/* create experiment definition array */
	var perceptual_metacognition_experiment = [];

	for (var i = 0; i < practice_len; i++) {
		perceptual_metacognition_experiment.push(fixation_block);
		perceptual_metacognition_experiment.push(easy_block);
		//perceptual_metacognition_experiment.push(confidence_block);
		perceptual_metacognition_experiment.push(confidence_key_block);
	}
	perceptual_metacognition_experiment.push(start_test_block)
	for (var i = 0; i < exp_len; i++) {
		perceptual_metacognition_experiment.push(fixation_block);
		if (jQuery.inArray(i,catch_trials) !== -1) {
			perceptual_metacognition_experiment.push(easy_block)
		} else {
			perceptual_metacognition_experiment.push(test_block);
		}
		//perceptual_metacognition_experiment.push(confidence_block);
		perceptual_metacognition_experiment.push(confidence_key_block);
	}

	return perceptual_metacognition_experiment;
}

