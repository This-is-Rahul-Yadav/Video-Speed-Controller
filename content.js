function setSpeed(document, speed) {
    let videos = document.getElementsByTagName('video');
    console.log(`found ${videos.length} videos on doc.`);

    for (let i = 0; i < videos.length; i++) {
      console.log(`Setting speed to ${speed}, video: ${getDomPath(videos[i])}`);
      videos[i].playbackRate = speed;
    }
  }
  
  function processFrames(document, speed) {
    let frames = document.getElementsByTagName('iframe');

    console.log(`found ${frames.length} frames.`);
    for (let i = 0; i < frames.length; i++) {
      let frame = frames[i];
      console.log(`tag name for frame ${i}: ${frame.tagName}`)
      if (frame.tagName === 'IFRAME' || frame.tagName === 'iframe') {
        console.log(`frame is IFRAME`);
        try {
            let frameDoc = frame.contentDocument;
            console.log(`frameDoc is ${frameDoc}`);
          if (frameDoc) {
            setSpeed(frameDoc, speed);
            processFrames(frameDoc, speed);
          }
        } catch (e) {
          console.log('Failed to access iframe content', e);
        }
      }
    }
  }

  function setSpeedAll(rootDocument, speed){
    setSpeed(rootDocument, speed);
    processFrames(rootDocument, speed)
  }

  
  let currentSpeed = 1;
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'set_speed') {
      currentSpeed = parseFloat(message.speed);
      setSpeedAll(document, currentSpeed);
    }
  });



  // Manipulate video scrubbing and playback speed
document.addEventListener("keydown", function(e) {
    console.log('key code is: ', e.code);
    modifyAllVideos(document, e.code);
});

function modifyAllVideos(document, keyCode){
    modifyVideosOnCurrentDocument(document, keyCode);
    modifyVideosInFrames(document, keyCode);
}

function modifyVideosOnCurrentDocument(document, keyCode){
    let videos = document.getElementsByTagName('video');
    console.log(`found ${videos.length} videos on doc.`);

    for (let i = 0; i < videos.length; i++) {
      modifyVideo(document, videos[i], keyCode);
    }
}

function modifyVideosInFrames(document, keyCode){
    let frames = document.getElementsByTagName('iframe');

    console.log(`found ${frames.length} frames.`);
    for (let i = 0; i < frames.length; i++) {
      let frame = frames[i];
      console.log(`tag name for frame ${i}: ${frame.tagName}`)
      if (frame.tagName === 'IFRAME' || frame.tagName === 'iframe') {
        console.log(`frame is IFRAME`);
        try {
            let frameDoc = frame.contentDocument;
            console.log(`frameDoc is ${frameDoc}`);
          if (frameDoc) {
            modifyVideosOnCurrentDocument(frameDoc, keyCode);
            modifyVideosInFrames(frameDoc, keyCode);
          }
        } catch (e) {
          console.log('Failed to access iframe content', e);
        }
      }
    }
}

function modifyVideo(document, video, keyCode){
    if (keyCode === "Semicolon"){
        video.currentTime = Math.max(video.currentTime - 3,  0)
    }else if (keyCode === "Quote"){
        video.currentTime = Math.min(video.currentTime + 3,  video.duration)
    }else if (keyCode === "BracketRight"){
        video.playbackRate = video.playbackRate + 0.2
        video.playbackRate = parseInt(10*video.playbackRate + 0.5)/10 // round value to avoid displaying numbers like 1.79999999
        tempAlert(document, `${video.playbackRate}`,500);
    }else if (keyCode === "BracketLeft"){
        video.playbackRate = Math.max(video.playbackRate - 0.2, 0.2)
        video.playbackRate = parseInt(10*video.playbackRate + 0.5)/10 // round value to avoid displaying numbers like 1.79999999
        tempAlert(document, `${video.playbackRate}`,500);
    }else if (keyCode === "Backslash"){
        // TODO: Add keycode for custom speed
        video.playbackRate = 1;
        tempAlert(document, `${video.playbackRate}`,500);
    };

}

function tempAlert(document, msg,duration)
{
    var element = document.createElement("div");
    element.id = "popup_box"
    
    element.setAttribute("style","position:absolute;top:50%;left:50%;background-color:#515152;font-size:100px;color:white;opacity:75%");
    element.innerHTML = msg;
    setTimeout(function(){
        element.parentNode.removeChild(element);
    },duration);



    //first, grab the page's fullscreenElement
    var fse = document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement||document.msFullscreenElement;

    if(fse){//if there is a fullscreened element
        fse.appendChild(element);//append the menu inside the fullscreened element
    }else{//if nothing is in full screen
        if(window.self !== window.top){//if we are in an iframe
            element.remove();//hide menu if we are in an iframe
        }else{//if we aren't in an iframe
            document.body.insertBefore(element, document.body.firstChild);//show menu
        }
    }

    document.body.appendChild(element);
}



function getDomPath(el) {
    var stack = [];
    while ( el.parentNode != null ) {
      console.log(el.nodeName);
      var sibCount = 0;
      var sibIndex = 0;
      for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
        var sib = el.parentNode.childNodes[i];
        if ( sib.nodeName == el.nodeName ) {
          if ( sib === el ) {
            sibIndex = sibCount;
            break;
          }
          sibCount++;
        }
      }
      if ( el.hasAttribute('id') && el.id != '' ) {
        stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
      } else if ( sibCount > 1 ) {
        stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
      } else {
        stack.unshift(el.nodeName.toLowerCase());
      }
      el = el.parentNode;
    }
    return stack.slice(1); // removes the html element
}