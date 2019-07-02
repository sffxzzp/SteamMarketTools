// ==UserScript==
// @name         CSGO Market Tool
// @namespace    https://coding.net/u/sffxzzp
// @version      2.08
// @description  A script that displays float value and stickers of guns in market list.
// @author       sffxzzp
// @match        *://steamcommunity.com/market/listings/730/*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @connect      api.csgofloat.com
// @updateURL    https://coding.net/u/sffxzzp/p/SteamMarketTools/git/raw/master/CSGO_Market_Tool.user.js
// ==/UserScript==

(function() {
    var util = (function () {
        function util() {}
        util.xhr = function (xhrData) {
            return new Promise(function(resolve, reject) {
                if (!xhrData.xhr) {
                    GM_xmlhttpRequest({
                        method: xhrData.method || "get",
                        url: xhrData.url,
                        data: xhrData.data,
                        responseType: xhrData.type || "",
                        timeout: 3e4,
                        onload: function onload(res) {
                            return resolve({ response: res, body: res.response });
                        },
                        onerror: reject,
                        ontimeout: reject
                    });
                } else {
                    var xhr = new XMLHttpRequest();
                    xhr.open(
                        xhrData.method || "get",
                        xhrData.url,
                        true
                    );
                    if (xhrData.method === "POST") {
                        xhr.setRequestHeader(
                            "content-type",
                            "application/x-www-form-urlencoded; charset=utf-8"
                        );
                    }
                    if (xhrData.cookie) xhr.withCredentials = true;
                    xhr.responseType = xhrData.responseType || "";
                    xhr.timeout = 3e4;
                    xhr.onload = function(ev) {
                        var evt = ev.target;
                        resolve({ response: evt, body: evt.response });
                    };
                    xhr.onerror = reject;
                    xhr.ontimeout = reject;
                    xhr.send(xhrData.data);
                }
            });
        };
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
    var csgomt = (function () {
        function csgomt() {}
        csgomt.prototype.parseResult = function (result) {
            console.log(result);
            let retResult = {"floatvalue": result.iteminfo.floatvalue.toFixed(14)};
            let stickerConts = result.iteminfo.stickers;
            if (stickerConts.length > 0) {
                let stickerText = "印花：";
                for (let i=0;i<stickerConts.length;i++) {
                    if (stickerConts[i].wear==null) {stickerText += "100% ";}
                    else {let tmpNum = (1-stickerConts[i].wear)*100;stickerText += tmpNum.toFixed(2)+"% ";}
                }
                retResult.stickerText = stickerText;
            }
            if (result.iteminfo.imageurl.indexOf('phase')>=0) {
                let dopplerText = "多普勒：";
                let dopplerRe = /phase\d/gi;
                dopplerText += result.iteminfo.imageurl.match(dopplerRe)[0];
                retResult.dopplerText = dopplerText;
            }
            console.log(retResult);
            return retResult;
        }
        csgomt.prototype.getFloatValue = function (node) {
            let _this = this;
            util.xhr({
                url: "https://api.csgofloat.com/?url="+node.getAttribute("link")
            }).then(function (result) {
                result = JSON.parse(result.body);
                if (result.iteminfo) {
                    node.parentNode.parentNode.onclick = function () {};
                    let finalResult = _this.parseResult(result);
                    node.innerHTML = "<span>"+finalResult.floatvalue+"</span>";
                    node.className="btn_green_white_innerfade btn_small";
                    let nameList = node.parentNode.parentNode.parentNode.getElementsByClassName('market_listing_item_name_block')[0];
                    if (finalResult.hasOwnProperty('stickerText')) {
                        let stickerWear = util.createElement({node: "span", content: {class: "market_listing_game_name", style: "display: block; color: silver;"}, html: finalResult.stickerText});
                        nameList.appendChild(stickerWear);
                    }
                    if (finalResult.hasOwnProperty('dopplerText')) {
                        let dopplerPhase = util.createElement({node: "span", content: {class: "market_listing_game_name", style: "display: block; color: silver;"}, html: finalResult.dopplerText});
                        nameList.appendChild(dopplerPhase);
                    }
                    localStorage.setItem(node.id, JSON.stringify(finalResult));
                }
                else {
                    node.innerHTML = "<span>查询失败</span>";
                }
            });
        };
        csgomt.prototype.addButton = function () {
            let oriButtonDiv = document.getElementById('market_buyorder_info').children[0];
            let oriButton = document.getElementById('market_commodity_buyrequests');
            let newButton = util.createElement({node: "div", content: {style: "float: right; padding-right: 10px;"}, html: "<a class=\"btn_blue_white_innerfade btn_medium market_noncommodity_buyorder_button\" href=\"javascript:void(0)\"><span>清除本地缓存</span></a>"});
            newButton.onclick = function () {
                localStorage.clear();
                alert("清理完毕！");
            };
            oriButtonDiv.insertBefore(newButton, oriButton);
        };
        csgomt.prototype.addBanner = function () {
            let listBanner = document.getElementsByClassName('market_listing_table_header');
            listBanner = listBanner[listBanner.length-1];
            let nameBanner = listBanner.children[2];
            let childBanner = util.createElement({node: "span", content:{style: "padding-left: 4vw;"}});
            nameBanner.appendChild(childBanner);
            childBanner = util.createElement({node: "span", content: {style: "width: 20%;", class: "market_listing_right_cell market_listing_stickers_buttons market_listing_sticker"}, html: "印花"});
            listBanner.insertBefore(childBanner, nameBanner);
            childBanner = util.createElement({node: "span", content: {style: "width: 15%;", class: "market_listing_right_cell market_listing_action_buttons market_listing_wear"}, html: "磨损值"});
            listBanner.insertBefore(childBanner, nameBanner);
        };
        csgomt.prototype.addStyle = function () {
            let customstyle = util.createElement({node: "style", html: ".csgo-stickers-show img:hover{opacity:1;width:96px;margin:-16px -24px -24px -24px;z-index:4;-moz-transition:.2s;-o-transition:.2s;-webkit-transition:.2s;transition:.2s;} .csgo-sticker{width: 48px;opacity: 1;vertical-align: middle;z-index: 3;-moz-transition: .1s; -o-transition: .1s; -webkit-transition: .1s; transition: .1s;}"});
            document.head.appendChild(customstyle);
        };
        csgomt.prototype.addPageCtl = function () {
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
        };
        csgomt.prototype.load = function () {
            var _this = this;
            let isHandled = document.getElementsByClassName("market_listing_table_header");
            isHandled = isHandled[isHandled.length-1].children.length;
            if (isHandled > 3) {return false;}
            this.addBanner();
            this.addStyle();
            let itemDetails = g_rgAssets[730][2];
            let itemListInfo = g_rgListingInfo;
            let itemInfo = {};
            let reStickers = /(https+:\/\/.+?\.png)/gi;
            let reStickerDes = /<br>.{2,4}\: (.+?)<\/center>/;
            for (var listingid in itemListInfo) {
                itemInfo[itemListInfo[listingid].asset.id] = {};
            }
            for (var assetid in itemDetails) {
                itemInfo[assetid].link = itemDetails[assetid].actions[0].link.replace("%assetid%", assetid);
                itemInfo[assetid].nametag = itemDetails[assetid].hasOwnProperty('fraudwarnings')?itemDetails[assetid].fraudwarnings[0]:'';
                let sticker = '<div class="market_listing_right_cell market_listing_stickers_buttons"><div class="csgo-stickers-show" style="top: 12px;right: 300px;z-index: 3;">';
                let stickerInfo = itemDetails[assetid].descriptions[itemDetails[assetid].descriptions.length-1].value;
                if (stickerInfo.length > 1) {
                    let stickerImgs = stickerInfo.match(reStickers);
                    let stickerDes = stickerInfo.match(reStickerDes)[1].split(', ');
                    for (let i=0;i<stickerImgs.length;i++) {
                        sticker += '<img class="csgo-sticker" src="'+stickerImgs[i]+'" title="'+stickerDes[i]+'">';
                    }
                }
                else {
                    sticker += '<img class="csgo-sticker">';
                }
                itemInfo[assetid].sticker = sticker + '</div></div>';
            }
            let itemList = document.getElementsByClassName('market_recent_listing_row');
            for (let i=0;i<itemList.length;i++) {
                if (itemList[i].id.substring(0,7) != 'listing') {
                    continue;
                }
                let listingid = itemList[i].id.substring(8);
                let assetid = itemListInfo[listingid].asset.id;
                let floatButton;
                let nameList = itemList[i].children[3];
                let namePlace = nameList.children[2];
                util.setElement({node: namePlace, content: {style: "color: yellow;"}, html: itemInfo[assetid].nametag});
                let itemSticker = util.createElement({node: "span", content: {style: "width: 20%;", class: "market_listing_right_cell market_listing_sticker"}, html: itemInfo[assetid].sticker});
                itemList[i].insertBefore(itemSticker, nameList);
                let savedItem = localStorage.getItem(listingid);
                if (savedItem) {
                    savedItem = JSON.parse(savedItem);
                    floatButton = util.createElement({node: "span", content: {style: "width: 15%;", class: "market_listing_right_cell market_listing_action_buttons market_listing_wear"}, html: '<div class="market_listing_right_cell market_listing_action_buttons" style="float:left;"><a link='+itemInfo[assetid].link+' id='+listingid+' class="btn_green_white_innerfade btn_small"><span>'+savedItem.floatvalue+'</span></a></div>'});
                    if (savedItem.hasOwnProperty('stickerText')) {
                        let stickerWear = util.createElement({node: "span", content: {class: "market_listing_game_name", style: "display: block; color: silver;"}, html: savedItem.stickerText});
                        nameList.appendChild(stickerWear);
                    }
                    if (savedItem.hasOwnProperty('dopplerText')) {
                        let dopplerPhase = util.createElement({node: "span", content: {class: "market_listing_game_name", style: "display: block; color: silver;"}, html: savedItem.dopplerText});
                        nameList.appendChild(dopplerPhase);
                    }
                }
                else {
                    floatButton = util.createElement({node: "span", content: {style: "width: 15%;", class: "market_listing_right_cell market_listing_action_buttons market_listing_wear"}, html: '<div class="market_listing_right_cell market_listing_action_buttons" style="float:left;"><a link='+itemInfo[assetid].link+' id='+listingid+' class="floatvalue_button btn_darkblue_white_innerfade btn_small"><span>点击查询磨损</span></a></div>'});
                    floatButton.onclick = function () {
                        let clickedButton = this.children[0].children[0];
                        util.setElement({node: clickedButton, html: "<span>磨损查询中…</span>"});
                        _this.getFloatValue(clickedButton);
                    };
                }
                itemList[i].insertBefore(floatButton, nameList);
            }
        };
        csgomt.prototype.run = function () {
            var _this = this;
            this.load();
            this.addButton();
            this.addPageCtl();
            var csgoinv = document.getElementById("searchResultsRows");
            var observer = new MutationObserver(function (recs) {
                for (let i=0;i<recs.length;i++) {
                    let rec = recs[i];
                    if (rec.target.classList.contains('market_listing_item_img_container')) {
                        _this.load();
                        break;
                    }
                }
            });
            observer.observe(csgoinv, { childList: true, subtree: true });
        };
        return csgomt;
    })();
    var script = new csgomt();
    script.run();
})();