// ==UserScript==
// @name         CSGO Market Tool
// @namespace    https://coding.net/u/sffxzzp
// @version      0.51
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
    function getFloatValue(listId, guid, itemLink, itemId) {
        var cButton = document.getElementById(listId).children[4].children[0].children[0].children[0];
        if (itemId == "first") {
            GM_xmlhttpRequest({
                method: 'get',
                url: "http://metjm.net/shared/screenshots-v5.php?cmd=request_new_link&user_uuid="+guid+"&user_client=1&custom_rotation_id=0&use_logo=1&mode=0&inspect_link=" + itemLink,
                onload: function(response) {
                    var result = JSON.parse(response.responseText);
                    if (result.success===true) {
                        setTimeout(function(){getFloatValue(listId, guid, itemLink, result.result.screen_id);}, 10000);
                    }
                    else if (result.success===false) {
                        cButton.innerHTML = "查询失败";
                    }
                }
            });
        } else {
            GM_xmlhttpRequest({
                method: 'get',
                url: "http://metjm.net/shared/screenshots-v5.php?cmd=request_screenshot_status&id="+itemId,
                onload: function(response) {
                    var result = JSON.parse(response.responseText);
                    if (result.success===true) {
                        if (result.result.status==1) {
                            cButton.innerHTML = "队列中：第"+result.result.place_in_queue+"位";
                            setTimeout(function(){getFloatValue(listId, guid, itemLink, itemId);}, 10000);
                        }
                        else if (result.result.status==2) {
                            cButton.innerHTML = result.result.item_floatvalue;
                            cButton.parentNode.parentNode.parentNode.onclick = function() {
                                window.open(result.result.image_url);
                            };
                        }
                    }
                    else if (result.success===false) {
                        cButton.innerHTML = "查询失败";
                    }
                }
            });
        }
    }
    function addBanner() {
        var listBanner = document.getElementsByClassName('market_listing_table_header')[0];
        var childBanner = document.createElement("span");
        var nameBanner = listBanner.children[2];
        childBanner.setAttribute("style", "width:20%");
        childBanner.setAttribute("class", "market_listing_right_cell market_listing_stickers_buttons market_listing_sticker");
        childBanner.innerHTML = "印花";
        listBanner.insertBefore(childBanner, nameBanner);
        childBanner = document.createElement("span");
        childBanner.setAttribute("style", "width:15%");
        childBanner.setAttribute("class", "market_listing_right_cell market_listing_action_buttons market_listing_wear");
        childBanner.innerHTML = "磨损值";
        listBanner.insertBefore(childBanner, nameBanner);
    }
    function addStyle() {
        var customstyle = document.createElement("style");
        customstyle.innerHTML = '.csgo-stickers-show img:hover{opacity:1;width:96px;margin:-16px -24px -24px -24px;z-index:4;-moz-transition:.2s;-o-transition:.2s;-webkit-transition:.2s;transition:.2s;} .csgo-sticker{width: 48px;opacity: 1;vertical-align: middle;z-index: 3;-moz-transition: .1s; -o-transition: .1s; -webkit-transition: .1s; transition: .1s;}';
        document.head.appendChild(customstyle);
    }
    function reloadScript(oriId) {
        var newId = document.getElementsByClassName("market_recent_listing_row")[0].id;
        var loaded = document.getElementsByClassName("market_listing_wear");
        if (newId == oriId) {
            setTimeout(function(){reloadScript(oriId);}, 200);
        }
        else {
            if (loaded.length === 0) {
                handlePage();
            }
        }
    }
    function handlePage() {
        addBanner();
        addStyle();
        var itemDetails = g_rgAssets[730][2];
        var itemLinks = [];
        var itemStickers = [];
        var NameTags = [];
        var reStickers = /(https+:\/\/.+?\.png)/gi;
        var reStickerDes = /Sticker\:\ (.+?)<\/center>/;
        var StickerImgs, StickerDes, StickerInfo, lastCount;
        var i = 0;
        for (var itemDetail in itemDetails) {
            itemLinks[i] = itemDetails[itemDetail].actions[0].link.replace("%assetid%", itemDetails[itemDetail].id);
            itemStickers[i] = '<div class="market_listing_right_cell market_listing_stickers_buttons"><div class="csgo-stickers-show" style="top: 12px;right: 300px;z-index: 3;">';
            lastCount = itemDetails[itemDetail].descriptions.length - 1;
            NameTags[i] = itemDetails[itemDetail].hasOwnProperty('fraudwarnings')?itemDetails[itemDetail].fraudwarnings[0]:'';
            StickerInfo = itemDetails[itemDetail].descriptions[lastCount].value;
            if (StickerInfo.length > 1) {
                StickerImgs = StickerInfo.match(reStickers);
                StickerDes = StickerInfo.match(reStickerDes)[1].split(', ');
                for (var j=0;j<StickerImgs.length;j++) {
                    itemStickers[i] += '<img class="csgo-sticker" src="'+StickerImgs[j]+'" title="'+StickerDes[j]+'">';
                }
            } else {
                itemStickers[i] += '<img class="csgo-sticker">';
            }
            itemStickers[i] += '</div></div>';
            i++;
        }
        var itemList = document.getElementsByClassName('market_recent_listing_row');
        var nameList, clickedButton;
        for (i=0;i<itemList.length;i++) {
            nameList = itemList[i].children[3];
            document.getElementsByClassName('market_listing_game_name')[i].innerHTML = NameTags[i];
            document.getElementsByClassName('market_listing_game_name')[i].setAttribute("style", "color: #FFFF00;");
            var itemSticker = document.createElement("span");
            itemSticker.setAttribute("style", "width:20%");
            itemSticker.setAttribute("class", "market_listing_right_cell market_listing_sticker");
            itemSticker.innerHTML = itemStickers[i];
            itemList[i].insertBefore(itemSticker, nameList);
            var floatButton = document.createElement("span");
            floatButton.setAttribute("style", "width:15%");
            floatButton.setAttribute("class", "market_listing_right_cell market_listing_action_buttons market_listing_wear");
            floatButton.onclick = function() {
                clickedButton = this.children[0].children[0];
                clickedButton.children[0].innerHTML = '磨损查询中…';
                getFloatValue(clickedButton.id, guid(), encodeURIComponent(itemLinks[clickedButton.getAttribute('buttonid')]), "first");
            };
            floatButton.innerHTML = '<div class="market_listing_right_cell market_listing_action_buttons" style="float:left;"><a buttonid='+i+' id='+itemList[i].id+' class="floatvalue_button btn_green_white_innerfade btn_small"><span>点击查询磨损</span></a></div>';
            itemList[i].insertBefore(floatButton, nameList);
        }
        var pagelinks = document.getElementsByClassName('market_paging_pagelink');
        for (var pagelink in pagelinks) {
            pagelinks[pagelink].onclick = function() {
                setTimeout(function(){reloadScript(document.getElementsByClassName("market_recent_listing_row")[0].id);}, 10);
            };
        }
        var pageButtons = document.getElementsByClassName('pagebtn');
        for (var pageButton in pageButtons) {
            pageButtons[pageButton].onclick = function() {
                setTimeout(function(){reloadScript(document.getElementsByClassName("market_recent_listing_row")[0].id);}, 10);
            };
        }
    }
    handlePage();
})();