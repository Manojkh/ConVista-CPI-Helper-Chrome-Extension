//GNU GPL v3
//Please visit our github page: https://github.com/dbeck121/ConVista-CPI-Helper-Chrome-Extension

//cpiData stores data for this extension
var cpiData = {};

//initialize used elements
cpiData.lastMessageHashList = [];
cpiData.integrationFlowId = "";

//We need to get the X-CSRF Token to set the log level to trace. This comes from a background service and is received here
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.cpiData) {
      cpiData = { ...cpiData, ...request.cpiData }
    }
  });

//function to make http calls
function makeCall(type, url, includeXcsrf, payload, callback) {

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open(type, url, true);

  if (payload) {
    xhr.setRequestHeader('Content-type', 'application/json');
  }

  if (includeXcsrf) {
    xhr.setRequestHeader("X-CSRF-Token", cpiData.xcsrftoken);
  }

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      callback(xhr);
    }
  }

  xhr.send(payload);
}

//opens a new window with the Trace for a MessageGuid
function openTrace(MessageGuid) {

  //we have to get the RunID first
  makeCall("GET", "/itspaces/odata/api/v1/MessageProcessingLogs('" + MessageGuid + "')/Runs?$format=json", false, "", (xhr) => {
    if (xhr.readyState == 4) {
      var resp = JSON.parse(xhr.responseText);
      var runId = resp.d.results[0].Id;

      let url = '/itspaces/shell/monitoring/MessageProcessingRun/%7B"parentContext":%7B"MessageMonitor":%7B"artifactKey":"__ALL__MESSAGE_PROVIDER","artifactName":"All%20Artifacts"%7D%7D,"messageProcessingLog":"' + MessageGuid + '","RunId":"' + runId + '"%7D';
      window.open(url, '_blank');
    }
  })
}

//open new window for infos
function openInfo(url) {
  window.open(url, '_blank');
}

//refresh the logs in message window
function getLogs() {

  //check if iflowid exists
  iflowId = cpiData.integrationFlowId;
  if (!iflowId) {
    return;
  }

  //get the messagelogs for current iflow
  makeCall("GET", "/itspaces/odata/api/v1/MessageProcessingLogs?$filter=IntegrationFlowName eq '" + iflowId + "'&$top=15&$format=json&$orderby=LogStart desc", false, "", (xhr) => {

    if (xhr.readyState == 4) {

      var resp = JSON.parse(xhr.responseText);
      resp = resp.d.results;

      document.getElementById('iflowName').innerText = cpiData.integrationFlowId;

      let updatedText = document.getElementById('updatedText');

      updatedText.textContent = "Last update: " + new Date().toLocaleString("de-DE");

      let thisMessageHash = resp[0].MessageGuid + resp[0].LogStart + resp[0].LogEnd + resp[0].Status;
      if (thisMessageHash != cpiData.lastMessageHashList[0]) {
        console.log("Updating message list");
        let thisMessageHashList = [];

        let messageList = document.getElementById('messageList');
        messageList.innerHTML = "";

        for (var i = 0; i < resp.length; i++) {
          thisMessageHashList.push(resp[i].MessageGuid + resp[i].LogStart + resp[i].LogEnd + resp[i].Status);
          let listItem = document.createElement("li");

          let traceButton = "";
          if (resp[i].LogLevel == "TRACE") {
            traceButton = "<button id='trace--" + i + "' class='" + resp[i].MessageGuid + "'>Trace</button>";
          }

          let statusColor = "#008000";
          if (resp[i].Status == "PROCESSING") {
            statusColor = "#FFC300";
          }
          if (resp[i].Status == "FAILED") {
            statusColor = "#C70039";
          }
          listItem.style["color"] = statusColor;

          //flash animation for new elements
          let flash = "";
          if (cpiData.lastMessageHashList.length != 0 && !cpiData.lastMessageHashList.includes(thisMessageHashList[i])) {
            flash = "class='flash'";
          }

          listItem.innerHTML = "<span style='color:" + statusColor + "' " + flash + "'> " + new Date(parseInt(resp[i].LogEnd.match(/\d+/)[0])).toLocaleString("de-DE") + "</span> <button id='info--" + i + "' class='" + resp[i].AlternateWebLink + "'>Info</button>" + traceButton;
          messageList.appendChild(listItem)

          document.getElementById("info--" + i).addEventListener("click", (a) => {
            openInfo(a.srcElement.className);
          });

          if (resp[i].LogLevel == "TRACE") {
            document.getElementById("trace--" + i).addEventListener("click", (a) => {

              openTrace(a.srcElement.className);

            });
          }
        }
        cpiData.lastMessageHashList = thisMessageHashList;


      }
      //new update in 3 seconds
      if (sidebar.active) {
        setTimeout(getLogs, 3000);
      }
    }
  });
}

//makes a http call to set the log level to trace
function setLogLevel(logLevel, iflowId) {
  makeCall("POST", "/itspaces/Operations/com.sap.it.op.tmn.commands.dashboard.webui.IntegrationComponentSetMplLogLevelCommand", true, '{"artifactSymbolicName":"' + iflowId + '","mplLogLevel":"' + logLevel.toUpperCase() + '","nodeType":"IFLMAP"}', (xhr) => {
    if (xhr.readyState == 4) {
      showSnackbar("Trace activated");
    }
    else {
      showSnackbar("Error activating Trace");
    }
  });
}


function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

//Wait until side is loaded to inject new buttons
function waitForElementToDisplay(selector, time) {
  var elements = document.querySelectorAll(selector);
  var element;
  if (elements.length > 0) {
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].innerHTML == "Deploy") {
        element = elements[i];
      }
    }
    if (element) {

      //create Trace Button
      var tracebutton = createElementFromHTML('<button id="__buttonxx" data-sap-ui="__buttonxx" title="Enable traces" class="sapMBtn sapMBtnBase spcHeaderActionButton" style="display: inline-block; padding-left: 0px;"><span id="__buttonxx-inner" class="sapMBtnHoverable sapMBtnInner sapMBtnText sapMBtnTransparent sapMFocusable"><span class="sapMBtnContent" id="__button12-content"><bdi id="__button12-BDI-content">Trace</bdi></span></span></button>');

      area = document.querySelector("[id*='--iflowObjectPageHeader-actions']")
      area.appendChild(createElementFromHTML("<br />"));
      area.appendChild(tracebutton);

      tracebutton.addEventListener("click", (btn) => {
        setLogLevel("TRACE", cpiData.integrationFlowId);
      })
      console.log(element);

      //Create Toggle Message Bar Button
      var messagebutton = createElementFromHTML(' <button id="__buttonxy" data-sap-ui="__buttonxy" title="Messages" class="sapMBtn sapMBtnBase spcHeaderActionButton" style="display: inline-block;"><span id="__buttonxy-inner" class="sapMBtnHoverable sapMBtnInner sapMBtnText sapMBtnTransparent sapMFocusable"><span class="sapMBtnContent" id="__button13-content"><bdi id="__button13-BDI-content">Messages</bdi></span></span></button>');

      area = document.querySelector("[id*='--iflowObjectPageHeader-actions']")
      area.appendChild(messagebutton);

      messagebutton.addEventListener("click", (btn) => {
        if (sidebar.active) {
          sidebar.deactivate();
        } else {
          sidebar.init();
        }
      })
      return;
    } else {
      setTimeout(function () {
        waitForElementToDisplay(selector, time);
      }, time);
    }
  }
  else {
    setTimeout(function () {
      waitForElementToDisplay(selector, time);
    }, time);
  }
}

//snackbar for messages (e.g. trace is on)
function showSnackbar(message) {

  //inject css that is used for the snackbar
  var cssStyle = `

  /* start snackbar */

  #snackbar {
    visibility: hidden;
    min-width: 250px;
    margin-left: -125px;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 2px;
    padding: 16px;
    position: fixed;
    z-index: 1;
    left: 50%;
    bottom: 30px;
    font-size: 17px;
  }
  
  #snackbar.show {
    visibility: visible;
    -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
    animation: fadein 0.5s, fadeout 0.5s 2.5s;
  }
  
  @-webkit-keyframes fadein {
    from {bottom: 0; opacity: 0;} 
    to {bottom: 30px; opacity: 1;}
  }
  
  @keyframes fadein {
    from {bottom: 0; opacity: 0;}
    to {bottom: 30px; opacity: 1;}
  }
  
  @-webkit-keyframes fadeout {
    from {bottom: 30px; opacity: 1;} 
    to {bottom: 0; opacity: 0;}
  }
  
  @keyframes fadeout {
    from {bottom: 30px; opacity: 1;}
    to {bottom: 0; opacity: 0;}
  }

/* end snackbar */  `;

  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = cssStyle;
  } else {
    style.appendChild(document.createTextNode(cssStyle));
  }
  document.getElementsByTagName('head')[0].appendChild(style);

  //create snackbar div element
  var x = document.getElementById("snackbar");
  if (!x) {
    x = document.createElement('div');
    x.id = "snackbar";
    document.body.appendChild(x);
  }
  x.innerHTML = message;
  x.className = "show";
  setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}

//the sidebar that shows messages
var sidebar = {

  //indicator if active or not
  active: false,

  //function to deactivate the sidebar
  deactivate: function () {
    this.active = false;
    document.getElementById("cpiHelper_content").remove();
  },

  //function to create and initialise the message sidebar
  init: function () {
    this.active = true;

    //inject needed css for sidebar
    var cssStyle = `

    #cpiHelper_content{
      position:fixed;
      z-index:1000;
      background:#fbfbfb;
      top:100px;
      right:0px;
      width:350px;
    }   

    #cpiHelper_contentheader {
      padding: 10px;
      cursor: move;
      z-index: 10;
      background-color: #009fe3;
      color: #fff;
    }

    button {
      border: none;
    }

    .contentText {
      padding: 5px;
    }

    .flash {
      animation-name: flash;
      animation-duration: 3s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-play-state: running;
    animation-iteration-count: 1;
    }

    @keyframes flash {
      from {background: orange;}
      to {background: none;}
    }

    li {
       position: relative;    /* It is required for setting position to absolute in the next rule. */
    }

    li::before {
      "content: '•';
      position: absolute;
      left: -1.2em;          /* Adjust this value so that it appears where you want. */
      font-size: 1em;      /* Adjust this value so that it appears what size you want. */
    }
    
    `;

    var style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = cssStyle;
    } else {
      style.appendChild(document.createTextNode(cssStyle));
    }
    document.getElementsByTagName('head')[0].appendChild(style);

    //create sidebar div
    var elem = document.createElement('div');
    elem.innerHTML = `
    <div id="cpiHelper_contentheader">ConVista CPI Helper</div> 
    <div id="outerFrame">
    <div id="iflowName" class="contentText"></div>
    <div id="updatedText" class="contentText"></div>
    
    <ul id="messageList"></ul>
    <div><button id="closeButton" >Close Messages</button></div>
    
    </div>
    `;
    elem.id = "cpiHelper_content";
    document.body.appendChild(elem);

    //activate dragging for message bar
    dragElement(document.getElementById("cpiHelper_content"));

    //fill close button with life
    document.getElementById("closeButton").addEventListener("click", (btn) => {
      sidebar.deactivate();
    });

    //lastMessageHashList must be empty when message sidebar is created
    cpiData.lastMessageHashList = [];

    //refresh messages
    getLogs();
  }
};

//function to get the iFlow name from the URL
function getIflowName() {
  var url = window.location.href;
  let dateRegexp = /\/integrationflows\/(?<integrationFlowId>[0-9a-zA-Z_\-.]+)/;
  var result;

  try {
    let groups = url.match(dateRegexp).groups;

    result = groups.integrationFlowId;
    console.log("Found iFlow:" + cpiData.integrationFlowId);

  } catch (e) {
    console.log(e);
    console.log("no integrationflow found");
  }

  cpiData.integrationFlowId = result;
  return result;
}

//we have to check for url changes to deactivate sidebar and to inject buttons, when on iflow site.
var oldURL = "";
function checkURLchange() {
  var currentURL = window.location.href;
  var urlChanged = false;
  if (currentURL != oldURL) {
    urlChanged = true;
    console.log("url changed! to " + currentURL);
    oldURL = currentURL;
    handleUrlChange();
  }
  oldURL = window.location.href;
  return urlChanged;
}

//function that handles the dragging 
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

//this function is fired when the url changes
function handleUrlChange() {
  if (getIflowName()) {
    //if iflow found, inject buttons
    waitForElementToDisplay("[id*='-BDI-content']", 1000);
  } else {
    //deactivate sidebar if not on iflow page
    if (sidebar.active) {
      sidebar.deactivate();
    }
  }
}

//start
checkURLchange();
setInterval(function () {
  checkURLchange(window.location.href);
}, 4000);






