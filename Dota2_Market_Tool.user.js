// ==UserScript==
// @name         Dota2 Market Tool
// @namespace    https://coding.net/u/sffxzzp
// @version      0.12
// @description  A script that improves display in market list.
// @author       sffxzzp
// @match        *://steamcommunity.com/market/listings/570/*
// @icon         http://steamcommunity.com/favicon.ico
// @updateURL    https://coding.net/u/sffxzzp/p/CSGO-Market-Tool/git/raw/master/Dota2_Market_Tool.user.js
// ==/UserScript==

(function() {
    function addButton () {
        var oriButtonDiv = document.getElementById('market_buyorder_info').children[0];
        var oriButton = document.getElementById('market_commodity_buyrequests');
        var newButton = document.createElement("div");
        newButton.setAttribute("style", "float: right; padding-right: 10px");
        newButton.innerHTML = "<a class=\"btn_darkblue_white_innerfade btn_medium market_noncommodity_buyorder_button\" href=\"javascript:void(0)\"><span>重新加载</span></a>";
        newButton.onclick = function () {handlePage();};
        oriButtonDiv.insertBefore(newButton, oriButton);
    }
    function addPageCtl () {
        var oriPageCtl = document.getElementsByClassName('market_paging_summary')[0];
        var oriPageDiv = document.getElementById('searchResults_ctn');
        var newPageCtl = document.createElement("div");
        newPageCtl.setAttribute("style", "float: right; padding-right: 20px");
        var newPageInput = document.createElement("input");
        newPageInput.setAttribute("class", "filter_search_box market_search_filter_search_box");
        newPageInput.setAttribute("style", "width: 20px;");
        newPageInput.setAttribute("type", "text");
        newPageInput.setAttribute("autocomplete", "off");
        newPageCtl.appendChild(newPageInput);
        var newPageGo = document.createElement("span");
        newPageGo.setAttribute("class", "btn_darkblue_white_innerfade btn_small");
        newPageGo.onclick = function () {
            g_oSearchResults.GoToPage( (newPageInput.value-1), true );
            setTimeout(function(){reloadScript(document.getElementsByClassName("market_recent_listing_row")[0].id);}, 100);
        };
        newPageGo.innerHTML = "&nbsp;Go!&nbsp;";
        newPageCtl.appendChild(newPageGo);
        oriPageDiv.insertBefore(newPageCtl, oriPageCtl);
        var newPageSizeInput = document.createElement("input");
        newPageSizeInput.setAttribute("class", "filter_search_box market_search_filter_search_box");
        newPageSizeInput.setAttribute("style", "width: 30px;");
        newPageSizeInput.setAttribute("type", "text");
        newPageSizeInput.setAttribute("autocomplete", "off");
        var newPageSizeGo = document.createElement("span");
        newPageSizeGo.setAttribute("class", "btn_darkblue_white_innerfade btn_small");
        newPageSizeGo.onclick = function () {
            if (g_oSearchResults.m_cPageSize != newPageSizeInput.value && newPageSizeInput.value < 101) {
                var oldPageSize = g_oSearchResults.m_cPageSize;
                g_oSearchResults.m_cPageSize = newPageSizeInput.value;
                g_oSearchResults.m_cMaxPages = Math.ceil(g_oSearchResults.m_cTotalCount / newPageSizeInput.value);
                g_oSearchResults.GoToPage(g_oSearchResults.m_iCurrentPage, true);
                setTimeout(function(){reloadScript(oldPageSize);}, 10);
            }
        };
        newPageSizeGo.innerHTML = "&nbsp;修改&nbsp;";
        var newPageSizeCtl = document.createElement("div");
        newPageSizeCtl.setAttribute("class", "market_pagesize_options");
        newPageSizeCtl.setAttribute("style", "margin: 0 0 2em 0; font-size: 12px;");
        newPageSizeCtl.innerHTML = "每页显示数：		";
        newPageSizeCtl.appendChild(newPageSizeInput);
        newPageSizeCtl.appendChild(newPageSizeGo);
        document.getElementById('searchResults_ctn').appendChild(newPageSizeCtl);
    }
    function addBanner() {
        var listBanner = document.getElementsByClassName('market_listing_table_header')[0];
        var childBanner = document.createElement("span");
        var nameBanner = listBanner.children[2];
        childBanner.setAttribute("style", "padding-left:4vw;");
        nameBanner.appendChild(childBanner);
        childBanner = document.createElement("span");
        childBanner.setAttribute("style", "width:20%");
        childBanner.setAttribute("class", "market_listing_right_cell");
        childBanner.innerHTML = "宝石";
        listBanner.insertBefore(childBanner, nameBanner);
        childBanner = document.createElement("span");
        childBanner.setAttribute("style", "width:20%");
        childBanner.setAttribute("class", "market_listing_right_cell");
        childBanner.innerHTML = "已解锁款式";
        listBanner.insertBefore(childBanner, nameBanner);
    }
    function reloadScript(oriId) {
        var loaded = document.getElementsByClassName("market_listing_wear");
        if (typeof(oriId) === "number") {
            if (document.getElementById('searchResultsRows').getElementsByClassName('market_listing_row').length == oriId) {
                setTimeout(function(){reloadScript(oriId);}, 200);
            }
            else {
                if (loaded.length === 0) {
                    handlePage();
                }
            }
        }
        else {
            var newId = document.getElementsByClassName("market_recent_listing_row")[0].id;
            if (newId == oriId) {
                setTimeout(function(){reloadScript(oriId);}, 200);
            }
            else {
                if (loaded.length === 0) {
                    handlePage();
                }
            }
        }
    }
    function handlePage() {
        var isHandled = document.getElementsByClassName("market_listing_table_header")[0].children.length;
        if (isHandled > 3) {return False;}
        addBanner();
        var itemDetails = g_rgAssets[570][2];
        var itemUnlocks = [];
        var itemGems = [];
        var reGemDes = /<span style="font-size: 18px;.+?">(.*?)<\/span><br>/gi;
        var reGemColor = /rgb\(.+?\)/gi;
        var reTour = /tournament_info/g;
        var GemInfo, GemDes, GemColor, lastCount, UnlockDes, UnlockColor;
        var i = 0;
        for (var itemDetail in itemDetails) {
            itemGems[i] = "<div>";
            lastCount = itemDetails[itemDetail].descriptions.length - 1;
            GemInfo = itemDetails[itemDetail].descriptions[lastCount].value;
            if (GemInfo.length > 1) {
                GemDes = GemInfo.match(reGemDes);
                GemColor = [];
                if (GemDes === null) {
                    GemDes = GemInfo.match(reTour);
                    if (GemDes !== null) {
                        GemInfo = itemDetails[itemDetail].descriptions[lastCount-1].value;
                    }
                    GemDes = GemInfo.match(reGemDes);
                }
                if (GemDes !== null) {
                    for (var j = 0;j<GemDes.length;j++) {
                        GemColor[j] = GemDes[j].match(reGemColor)[0];
                        GemDes[j] = GemDes[j].replace(/<.+?>/g, '');
                        itemGems[i] += "<span style=\"float: left; line-height: initial; width: 100%; color: "+GemColor[j]+"\">"+GemDes[j]+"</span>";
                    }
                }
                else {
                    itemGems[i] += "<p></p>";
                }
            }
            itemGems[i] += "</div>";
            itemUnlocks[i] = "<div>";
            for (var k = 0; k < itemDetails[itemDetail].descriptions.length; k++) {
                UnlockDes = itemDetails[itemDetail].descriptions[k].value;
                UnlockColor = itemDetails[itemDetail].descriptions[k].color;
                if ((UnlockDes.substr(0, 2) == " *" || UnlockDes.substr(0, 2) == " -") && UnlockColor != "ff4040") {
                    UnlockDes = UnlockDes.substr(3);
                    itemUnlocks[i] += "<span style=\"float: left; line-height: initial; width: 100%; color: #"+UnlockColor+"\">"+UnlockDes+"</span>";
                }
            }
            itemUnlocks[i] += "</div>";
            i++;
        }
        var itemList = document.getElementsByClassName('market_recent_listing_row');
        var nameList;
        for (i=0;i<itemList.length;i++) {
            nameList = itemList[i].children[3];
            var itemGem = document.createElement("span");
            itemGem.setAttribute("style", "width:20%");
            itemGem.setAttribute("class", "market_listing_right_cell");
            itemGem.innerHTML = itemGems[i];
            itemList[i].insertBefore(itemGem, nameList);
            var itemUnlock = document.createElement("span");
            itemUnlock.setAttribute("style", "width:20%");
            itemUnlock.setAttribute("class", "market_listing_right_cell");
            itemUnlock.innerHTML = itemUnlocks[i];
            itemList[i].insertBefore(itemUnlock, nameList);
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
    addButton();
    handlePage();
    addPageCtl();
})();