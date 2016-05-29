// ==UserScript==
// @name         CSGO Market Tool
// @namespace    https://coding.net/u/sffxzzp
// @version      0.02
// @description  A script that display float value and stickers of guns in market list.
// @author       sffxzzp
// @match        http://steamcommunity.com/market/listings/730/*
// @icon         http://steamcommunity.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @connect      metjm.net
// @updateURL    https://coding.net/u/sffxzzp/p/CSGO-Market-Tool/git/raw/master/CSGO_Market_Tool.user.js
// ==/UserScript==

(function() {
    function guid() {
        function S4() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
    function getFloatValue(i, guid, itemLink) {
        GM_xmlhttpRequest({
            method: 'get',
            url: "http://metjm.net/shared/screenshots-v4.php?cmd=request_inspect_link&user_identifier=CSGO_MFP_"+guid+"&custom_rotation_id=-1&custom_image_id=true&mode=0&inspect_link=" + itemLink,
            onload: function(response) {
                var result = JSON.parse(response.responseText);
                if (result["status"]==1) {
                    setTimeout(function(){getFloatValue(i, guid, itemLink);}, 10000);
                }
                else if (result["status"]==2) {
                    document.getElementsByClassName('market_recent_listing_row')[i].children[0].children[2].children[0].innerHTML = result["item_information"]["floatvalue"];
                }
            }
        });
    }
    var itemDetails = g_rgAssets[730][2];
    var itemLinks = [];
    var i = 0;
    for (var itemDetail in itemDetails) {
        itemLinks[i] = itemDetails[itemDetail]["actions"][0]["link"].replace("%assetid%", itemDetails[itemDetail]["id"]);
        i++;
    }
    var itemList = document.getElementsByClassName('market_recent_listing_row');
    for (i=0;i<itemList.length;i++) {
        var floatButton = document.createElement("a");
        floatButton.setAttribute("href", itemLinks[i]);
        getFloatValue(i, guid(), encodeURIComponent(itemLinks[i]));
        floatButton.setAttribute("style", "margin-left:200px;margin-top:25px;");
        floatButton.setAttribute("class", "btn_green_white_innerfade btn_small");
        floatButton.setAttribute("target", "_blank");
        floatButton.innerHTML = "<span>磨损查询中…</span>";
        itemList[i].children[0].appendChild(floatButton);
    }
})();