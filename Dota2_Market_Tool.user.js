// ==UserScript==
// @name         Dota2 Market Tool
// @namespace    https://coding.net/u/sffxzzp
// @version      1.01
// @description  A script that improves display in market list.
// @author       sffxzzp
// @match        *://steamcommunity.com/market/listings/570/*
// @icon         https://store.steampowered.com/favicon.ico
// @updateURL    https://coding.net/u/sffxzzp/p/CSGO-Market-Tool/git/raw/master/Dota2_Market_Tool.user.js
// ==/UserScript==

(function() {
    var util = (function () {
        function util() {}
        util.createElement = function (data) {
            var node;
            if (data.node) {
                node = document.createElement(data.node);
                if (data.content) {
                    this.setElement({node: node, content: data.content});
                }
                if (data.html) {
                    node.innerHTML = data.html;
                }
            }
            return node;
        };
        util.setElement = function (data) {
            if (data.node) {
                for (let name in data.content) {
                    data.node.setAttribute(name, data.content[name]);
                }
                if (data.html!=undefined) {
                    data.node.innerHTML = data.html;
                }
            }
        };
        return util;
    })();
    var dotamt = (function () {
        function dotamt() {}
        dotamt.prototype.addBanner = function () {
            var listBanner = document.getElementsByClassName('market_listing_table_header')[0];
            var nameBanner = listBanner.children[2];
            var childBanner = util.createElement({node: "span", content: {style: "padding-left: 4vw;"}});
            nameBanner.appendChild(childBanner);
            childBanner = util.createElement({node: "span", content: {style: "width: 20%;", class: "market_listing_right_cell"}, html: "宝石"});
            listBanner.insertBefore(childBanner, nameBanner);
            childBanner = util.createElement({node: "span", content: {style: "width: 20%;", class: "market_listing_right_cell"}, html: "已解锁款式"});
            listBanner.insertBefore(childBanner, nameBanner);
        }
        dotamt.prototype.addPageCtl = function () {
            let oriPageCtl = document.getElementsByClassName('market_paging_summary')[0];
            let oriPageDiv = document.getElementById('searchResults_ctn');
            let newPageCtl = util.createElement({node: "div", content: {style: "float: right; padding-right: 20px;"}});
            let newPageInput = util.createElement({node: "input", content: {class: "filter_search_box market_search_filter_search_box", style: "width: 20px;", type: "text", autocomplete: "off"}});
            newPageCtl.appendChild(newPageInput);
            let newPageGo = util.createElement({node: "span", content: {class: "btn_darkblue_white_innerfade btn_small"}, html: "&nbsp;Go!&nbsp;"});
            newPageGo.onclick = function () {
                g_oSearchResults.GoToPage( (newPageInput.value-1), true );
                newPageInput.value = "";
            };
            newPageCtl.appendChild(newPageGo);
            oriPageDiv.insertBefore(newPageCtl, oriPageCtl);
            let newPageSizeCtl = util.createElement({node: "div", content: {class: "market_pagesize_options", style: "margin: 0 0 2em 0; font-size: 12px;"}, html: "每页显示数：		"});
            let newPageSizeInput = util.createElement({node: "input", content: {class: "filter_search_box market_search_filter_search_box", style: "width: 30px;", type: "text", autocomplete: "off"}});
            let newPageSizeGo = util.createElement({node: "span", content: {class: "btn_darkblue_white_innerfade btn_small"}, html: "&nbsp;修改&nbsp;"});
            newPageSizeGo.onclick = function () {
                if (g_oSearchResults.m_cPageSize != newPageSizeInput.value && newPageSizeInput.value < 101) {
                    let oldPageSize = g_oSearchResults.m_cPageSize;
                    g_oSearchResults.m_cPageSize = newPageSizeInput.value;
                    g_oSearchResults.m_cMaxPages = Math.ceil(g_oSearchResults.m_cTotalCount / newPageSizeInput.value);
                    g_oSearchResults.GoToPage(g_oSearchResults.m_iCurrentPage, true);
                }
                newPageSizeInput.value = "";
            };
            newPageSizeCtl.appendChild(newPageSizeInput);
            newPageSizeCtl.appendChild(newPageSizeGo);
            document.getElementById('searchResults_ctn').appendChild(newPageSizeCtl);
        }
        dotamt.prototype.load = function () {
            var _this=this;
            let isHandled = document.getElementsByClassName("market_listing_table_header")[0].children.length;
            if (isHandled > 3) {return false;}
            _this.addBanner();
            let itemDetails = g_rgAssets[570][2];
            let itemUnlocks = [];
            let itemGems = [];
            let reGemDes = /<span style="font-size: 18px;.+?">(.*?)<\/span><br>/gi;
            let reGemColor = /rgb\(.+?\)/gi;
            let reTour = /tournament_info/g;
            let GemInfo, GemDes, GemColor, lastCount, UnlockDes, UnlockColor;
            let i = 0;
            for (let itemDetail in itemDetails) {
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
                        for (let j = 0;j<GemDes.length;j++) {
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
                for (let k = 0; k < itemDetails[itemDetail].descriptions.length; k++) {
                    UnlockDes = itemDetails[itemDetail].descriptions[k].value;
                    UnlockColor = itemDetails[itemDetail].descriptions[k].color;
                    console.log(itemDetails[itemDetail]);
                    if (UnlockColor == "9da1a9" || UnlockColor == "6c7075") {
                        UnlockDes = UnlockDes;
                        itemUnlocks[i] += "<span style=\"float: left; line-height: initial; width: 100%; color: #"+UnlockColor+"\">"+UnlockDes+"</span>";
                    }
                }
                itemUnlocks[i] += "</div>";
                i++;
            }
            let itemList = document.getElementsByClassName('market_recent_listing_row');
            let nameList;
            for (i=0;i<itemList.length;i++) {
                nameList = itemList[i].children[3];
                let itemGem = util.createElement({node: "span", content: {style: "width: 20%;", class: "market_listing_right_cell"}, html: itemGems[i]});
                itemList[i].insertBefore(itemGem, nameList);
                let itemUnlock = util.createElement({node: "span", content: {style: "width: 20%;", class: "market_listing_right_cell"}, html: itemUnlocks[i]});
                itemList[i].insertBefore(itemUnlock, nameList);
            }
        }
        dotamt.prototype.run = function () {
            var _this = this;
            _this.load();
            _this.addPageCtl();
            var dotainv = document.getElementById("searchResultsRows");
            var observer = new MutationObserver(function (recs) {
                _this.load();
            });
            observer.observe(dotainv, { childList: true, subtree: true });
        }
        return dotamt;
    })();
    var script = new dotamt();
    script.run();
})();