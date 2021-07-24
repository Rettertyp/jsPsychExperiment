// array of trials, that ar processed successively
var timeline = [];


// trial that preloads all the necessary media so that it is already there and there is no lag when using it
var preload = {
    type: 'preload',
    images:['img/blue.png', 'img/orange.png']
}

timeline.push(preload);

// trial of the type 'type' that shows the message 'stimulus'
var welcome = {
    type: "html-keyboard-response",
    stimulus: "Welcome to the experiment. Press any key to begin."
};

// add the welcome-trial to the timeline
timeline.push(welcome);

// define a trial that give instructions to the user
var instructions = {
    type: "html-keyboard-response",
    // using `` instead of "" because it allows to use multiple lines
    // using html text-formatting to make the text look more pleasing
    stimulus: `
    <p>In this experiment, a circle will appear in the center 
    of the screen.</p><p>If the circle is <strong>blue</strong>, 
    press the letter F on the keyboard as fast as you can.</p>
    <p>If the circle is <strong>orange</strong>, press the letter J 
    as fast as you can.</p>
    <div style='width: 700px;'>
    <div style='float: left;'><img src='img/blue.png'></img>
    <p class='small'><strong>Press the F key</strong></p></div>
    <div class='float: right;'><img src='img/orange.png'></img>
    <p class='small'><strong>Press the J key</strong></p></div>
    </div>
    <p>Press any key to begin.</p> 
    `,
    // define for how many milisconds there should be a break after the end of the trial (2000 => 2 seconds)
    post_trial_gap: 2000
};

timeline.push(instructions);

/*
var blue_trial = {
    type: 'image-keyboard-response',
    // using an image as stimulus
    stimulus: 'img/blue.png',
    // only pressable buttons: F and J
    choices: ['f', 'j']
};

var orange_trial = {
    type: 'image-keyboard-response',
    // using an image as stimulus
    stimulus: 'img/orange.png',
    // only pressable buttons: F and J
    choices: ['f', 'j']
};

timeline.push(blue_trial, orange_trial);
*/

// array that contains the two stimuli and the belonging correct responses
var test_stimuli = [
    { stimulus: "img/blue.png", correct_response: 'f' },
    { stimulus: "img/orange.png", correct_response: 'j' }
];

// trial that shows a cross for a given amount of time
var fixation = {
    type: 'html-keyboard-response',
    stimulus: '<div style="font-size: 60px;">+</div>',
    // pressable keys = none => cant be skipped by pressing a key
    choices: jsPsych.NO_KEYS,
    trial_duration: function(){
        // returns array of length 1 with a selection of 1 element of the given arry. [0] because we want to have the entry of the array, not the array
        return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0];
    },
    data: {
        task: 'fixation'
    }
};

var test = {
    type: "image-keyboard-response",
    // indicate that we want to sibstitute the value by timeline variables, then acces its "stimulus"
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: ['f', 'j'],
    data: {
        task: 'response',
        // acces the correct_response attribute of the timelineVariable
        correct_response: jsPsych.timelineVariable('correct_response')
    },
    // run the function when the trial of the test-element is done
    on_finish: function(data) {
        // add another attribute to the data object: A boolean that indicates whether the user has answered correctly
        data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
    }
};

var test_procedure = {
    timeline: [fixation, test],
    // tells the timelineVariable() function what variables to use
    timeline_variables: test_stimuli,
    randomize_order: true,
    repetitions: 5
};

timeline.push(test_procedure);


var debrief_block = {
    type: "html-keyboard-response",
    stimulus: function() {
        // get all trials of the type 'response' as an array
        var trials = jsPsych.data.get().filter({task: 'response'});
        var correct_trials = trials.filter({correct: true});
        var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        // mean (Mittelwert) of all response times (RTs)
        var rt = Math.round(correct_trials.select('rt').mean());

        return `<p>You responded correctly on ${accuracy}% of the trials.</p>
        <p>Your average response time (for correct answers) was ${rt}ms.</p>
        <p>Press any key to complete the experiment. Thank you!</p>`;
    }
};

timeline.push(debrief_block);

// tell jsPsych to run the experiment
jsPsych.init({
    timeline: timeline,
    on_finish: function() {
        jsPsych.data.displayData();
    }
});