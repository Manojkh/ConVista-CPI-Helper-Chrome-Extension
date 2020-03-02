//GNU GPL v3

'use strict';

chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { urlMatches: '.*?hana\.ondemand\.com\/itspaces\/shell\/.*?integrationflows\/.*?' },
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });

  //scan Headers for X-CSRF Token
  chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {

      var temp = "";
      for (var i = 0; i < details.requestHeaders.length; ++i) {
        temp = temp + "---" + details.requestHeaders[i].name + ":" + details.requestHeaders[i].value;

        if (details.requestHeaders[i].name == "X-CSRF-Token") {
          var xcsrftoken = details.requestHeaders[i].value;
          chrome.storage.local.set({ xcsrftoken: xcsrftoken }, function () {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

              //send token to contentPage
              chrome.tabs.sendMessage(tabs[0].id, { cpiData: { xcsrftoken: xcsrftoken } }, function (response) {
                console.log(response);
              });
            });
            console.log('XCSRF-Token is set');

          });
        }
      }
      return { requestHeaders: details.requestHeaders };
    },
    { urls: ["https://*.hana.ondemand.com/itspaces/api/1.0/workspace*/artifacts/*/iflows/*?lockinfo=true&webdav=LOCK"] },
    ["requestHeaders"]);
});
