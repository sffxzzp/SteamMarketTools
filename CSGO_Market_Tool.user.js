// ==UserScript==
// @name         CSGO Market Tool
// @namespace    https://coding.net/u/sffxzzp
// @version      1.02
// @description  A script that displays float value and stickers of guns in market list.
// @author       sffxzzp
// @match        *://steamcommunity.com/market/listings/730/*
// @icon         https://steamcommunity.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @connect      metjm.net
// @updateURL    https://coding.net/u/sffxzzp/p/CSGO-Market-Tool/git/raw/master/CSGO_Market_Tool.user.js
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
        util.wrun = function (data) {
            setTimeout(data.run||null, data.ms);
        };
        util.guid = function () {
            function S4() {
                return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            }
            return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
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
        util.getElement = function (data) {};
        return util;
    })();
    var csgomt = (function () {
        function csgomt() {}
        csgomt.prototype.getFloatValue = function (node, guid, itemId) {
            let _this = this;
            if (itemId=="first") {
                util.xhr({
                    url: "http://metjm.net/shared/screenshots-v5.php?cmd=request_new_link&user_uuid="+guid+"&user_client=1&custom_rotation_id=0&use_logo=0&mode=7&resolution=2&forceOpskins=0&inspect_link="+encodeURIComponent(node.getAttribute("link"))
                }).then(function (result) {
                    result = JSON.parse(result.body);
                    if (result.success===true) {
                        node.onclick = function () {};
                        _this.getFloatValue(node, guid, result.result.screen_id);
                    }
                    else if (result.success===false) {
                        node.innerHTML = "<span>查询失败</span>";
                    }
                });
            }
            else {
                util.xhr({
                    url: "http://metjm.net/shared/screenshots-v5.php?cmd=request_screenshot_status&id="+itemId,
                }).then(function (result) {
                    result = JSON.parse(result.body);
                    if (result.success===true) {
                        if (result.result.status==1) {
                            if (result.result.item_floatvalue===0) {
                                node.innerHTML = "<span>队列中：第"+result.result.place_in_queue+"位</span>";
                            }
                            else if (result.result.item_floatvalue > 0) {
                                node.innerHTML = "<span>"+result.result.item_floatvalue+"</span>";
                            }
                            util.wrun({ run: function () { _this.getFloatValue(node, guid, itemId); }, ms: 10000});
                        }
                        else if (result.result.status==2) {
                            node.innerHTML = "<span>"+result.result.item_floatvalue+"</span>";
                            node.className="btn_green_white_innerfade btn_small";
                            node.onclick = function() {
                                window.open(result.result.image_url);
                            };
                            localStorage.setItem(node.id, JSON.stringify({fv:result.result.item_floatvalue, url:result.result.image_url}));
                        }
                    }
                    else if (result.success===false) {
                        node.innerHTML = "查询失败";
                    }
                });
            }
        };
        csgomt.prototype.addButton = function () {
            let oriButtonDiv = document.getElementById('market_buyorder_info').children[0];
            let oriButton = document.getElementById('market_commodity_buyrequests');
            let newButton = util.createElement({node: "div", content: {style: "float: right; padding-right: 10px;"}, html: "<a class=\"btn_blue_white_innerfade btn_medium market_noncommodity_buyorder_button\" href=\"javascript:void(0)\"><span>清除本地缓存</span></a>"});
            newButton.onclick = function () {
                localStorage.clear();
            };
            oriButtonDiv.insertBefore(newButton, oriButton);
        };
        csgomt.prototype.addBanner = function () {
            let listBanner = document.getElementsByClassName('market_listing_table_header')[0];
            let nameBanner = listBanner.children[2];
            let childBanner = util.createElement({node: "span", content:{style: "padding-left: 4vw;"}});
            nameBanner.appendChild(childBanner);
            childBanner = util.createElement({node: "a", content: {id: "getAllFloat", class: "btn_darkblue_white_innerfade btn_small"}, html: "<span>查询所有物品磨损</span>"});
            childBanner.onclick = function() {
                var subButton = document.getElementsByClassName('floatvalue_button');
                for (var i=0;i<subButton.length;i++) {
                    subButton[i].click();
                }
                this.onclick = function () {};
            };
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
            let isHandled = document.getElementsByClassName("market_listing_table_header")[0].children.length;
            if (isHandled > 3) {return false;}
            this.addBanner();
            this.addStyle();
            let itemDetails = g_rgAssets[730][2];
            let itemLinks = [];
            let itemStickers = [];
            var NameTags = [];
            let reStickers = /(https+:\/\/.+?\.png)/gi;
            let reStickerDes = /Sticker\:\ (.+?)<\/center>/;
            var StickerImgs, StickerDes, StickerInfo, lastCount;
            let i = 0;
            for (var itemDetail in itemDetails) {
                itemLinks[i] = itemDetails[itemDetail].actions[0].link.replace("%assetid%", itemDetails[itemDetail].id);
                itemStickers[i] = '<div class="market_listing_right_cell market_listing_stickers_buttons"><div class="csgo-stickers-show" style="top: 12px;right: 300px;z-index: 3;">';
                lastCount = itemDetails[itemDetail].descriptions.length - 1;
                NameTags[i] = itemDetails[itemDetail].hasOwnProperty('fraudwarnings')?itemDetails[itemDetail].fraudwarnings[0]:'';
                StickerInfo = itemDetails[itemDetail].descriptions[lastCount].value;
                if (StickerInfo.length > 1) {
                    StickerImgs = StickerInfo.match(reStickers);
                    StickerDes = StickerInfo.match(reStickerDes)[1].split(', ');
                    for (let j=0;j<StickerImgs.length;j++) {
                        itemStickers[i] += '<img class="csgo-sticker" src="'+StickerImgs[j]+'" title="'+StickerDes[j]+'">';
                    }
                } else {
                    itemStickers[i] += '<img class="csgo-sticker">';
                }
                itemStickers[i] += '</div></div>';
                i++;
            }
            let itemList = document.getElementsByClassName('market_recent_listing_row');
            for (let i=0;i<itemList.length;i++) {
                let floatButton;
                let nameList = itemList[i].children[3];
                let namePlace = nameList.children[2];
                util.setElement({node: namePlace, content: {style: "color: yellow;"}, html: NameTags[i]});
                let itemSticker = util.createElement({node: "span", content: {style: "width: 20%;", class: "market_listing_right_cell market_listing_sticker"}, html: itemStickers[i]});
                itemList[i].insertBefore(itemSticker, nameList);
                let savedItem = localStorage.getItem(itemList[i].id);
                if (savedItem) {
                    savedItem = JSON.parse(savedItem);
                    floatButton = util.createElement({node: "span", content: {style: "width: 15%;", class: "market_listing_right_cell market_listing_action_buttons market_listing_wear"}, html: '<div class="market_listing_right_cell market_listing_action_buttons" style="float:left;"><a link='+itemLinks[i]+' id='+itemList[i].id+' class="btn_green_white_innerfade btn_small"><span>'+savedItem.fv+'</span></a></div>'});
                    floatButton.onclick = function () {
                        window.open(savedItem.url);
                    };
                }
                else {
                    floatButton = util.createElement({node: "span", content: {style: "width: 15%;", class: "market_listing_right_cell market_listing_action_buttons market_listing_wear"}, html: '<div class="market_listing_right_cell market_listing_action_buttons" style="float:left;"><a link='+itemLinks[i]+' id='+itemList[i].id+' class="floatvalue_button btn_darkblue_white_innerfade btn_small"><span>点击查询磨损</span></a></div>'});
                    floatButton.onclick = function () {
                        let clickedButton = this.children[0].children[0];
                        util.setElement({node: clickedButton, html: "<span>磨损查询中…</span>"});
                        _this.getFloatValue(clickedButton, util.guid(), "first");
                        this.onclick = function () {};
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