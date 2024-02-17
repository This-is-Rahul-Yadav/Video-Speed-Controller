//Wait to run your initialization code until the DOM is fully loaded. This is needed
// when wanting to access elements that are later in the HTML than the <script>.
if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', afterLoaded);
} else {
    //The DOMContentLoaded event has already fired. Just run the code.
    afterLoaded();
}

function afterLoaded() {
    //Your initialization code goes here. This is from where your code should start
    //  running if it wants to access elements placed in the DOM by your HTML files.
    //  If you are wanting to access DOM elements inserted by JavaScript, you may need
    //  to delay more, or use a MutationObserver to see when they are inserted.
    console.log("Running popup.js")
    
    let speedInput = document.getElementById('speed');
    let setSpeedButton = document.getElementById('setSpeed');
    
    console.log("Logging setSpeedButton:")
    console.log(setSpeedButton)
    
    setSpeedButton.onclick = function() {
      let speed = parseFloat(speedInput.value);
      console.log(`current speed: $(speed)`)
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'set_speed', speed: speed});
      });
    };
};
