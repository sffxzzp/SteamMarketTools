// ==UserScript==
// @name         CSGO Market Tool
// @namespace    https://coding.net/u/sffxzzp
// @version      2.42
// @description  A script that displays float value and stickers of guns in market list.
// @author       sffxzzp
// @include      /https?:\/\/steamcommunity\.com\/market\/listings\/730(%.{2})?\/*/
// @icon         https://store.steampowered.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @connect      api.csgofloat.com
// @connect      money.csgofloat.com
// @updateURL    https://github.com/sffxzzp/SteamMarketTools/raw/main/CSGO_Market_Tool.user.js
// @grant        unsafeWindow
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
                        headers: xhrData.headers || {},
                        responseType: xhrData.type || "",
                        timeout: 3e5,
                        onload: function onload(res) {
                            return resolve({ response: res, body: res.response });
                        },
                        onerror: reject,
                        ontimeout: reject
                    });
                } else {
                    var xhr = new XMLHttpRequest();
                    xhr.open(xhrData.method || "get", xhrData.url, true);
                    if (xhrData.method === "post") {xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded; charset=utf-8");}
                    if (xhrData.cookie) {xhr.withCredentials = true;}
                    xhr.responseType = xhrData.type || "";
                    xhr.timeout = 3e5;
                    if (xhrData.headers) {for (var k in xhrData.headers) {xhr.setRequestHeader(k, xhrData.headers[k]);}}
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
                if (data.content) {this.setElement({node: node, content: data.content});}
                if (data.html) {node.innerHTML = data.html;}
            }
            return node;
        };
        util.setElement = function (data) {
            if (data.node) {
                for (let name in data.content) {data.node.setAttribute(name, data.content[name]);}
                if (data.html!=undefined) {data.node.innerHTML = data.html;}
            }
        };
        return util;
    })();
    var csgomt = (function () {
        function csgomt() {}
        csgomt.prototype.lsName = 'csgomt_data';
        csgomt.prototype.getItem = function (listingid) {
            let itemData = localStorage.getItem(this.lsName);
            let retData = null;
            if (itemData) {
                retData = JSON.parse(itemData)[listingid] || null;
            }
            else {
                this.initItem();
            }
            return retData;
        }
        csgomt.prototype.setItem = function (listingid, indata) {
            let itemData = localStorage.getItem(this.lsName);
            if (itemData) {
                itemData = JSON.parse(itemData);
                itemData[listingid] = indata;
                localStorage.setItem(this.lsName, JSON.stringify(itemData));
            }
            else {
                this.initItem();
            }
        }
        csgomt.prototype.initItem = function () {
            localStorage.setItem(this.lsName, '{}');
        }
        csgomt.prototype.parseResult = function (result) {
            let retResult = {"floatvalue": result.iteminfo.floatvalue.toFixed(14)};
            let stickerConts = result.iteminfo.stickers;
            if (stickerConts.length > 0) {
                let stickerText = "???????????????";
                for (let i=0;i<stickerConts.length;i++) {
                    if (stickerConts[i].wear==null) {stickerText += "100% ";}
                    else {let tmpNum = (1-stickerConts[i].wear)*100;stickerText += tmpNum.toFixed(2)+"% ";}
                }
                retResult.stickerText = stickerText;
            }
            if (result.iteminfo.imageurl.indexOf('phase')>=0) {
                let dopplerText = "????????????";
                let dopplerRe = /phase\d/gi;
                dopplerText += result.iteminfo.imageurl.match(dopplerRe)[0];
                retResult.dopplerText = dopplerText;
            }
            if (result.iteminfo.hasOwnProperty('paintseed')) {
                retResult.seedText = "???????????????"+result.iteminfo.paintseed;
            }
            return retResult;
        }
        csgomt.prototype.getScreenShot = function (node) {
            var _this = this;
            node.className = "btn_darkred_white_innerfade btn_small";
            node.parentNode.parentNode.onclick = function () {};
            util.xhr({url: atob('aHR0cHM6Ly9tb25leS5jc2dvZmxvYXQuY29tL21vZGVsP3VybD0')+node.getAttribute('link'), headers: {'Origin': atob('Y2hyb21lLWV4dGVuc2lvbjovL2pqaWNiZWZwZW1ucGhpbmNjZ2lrcGRhYWdqZWJibmhn')}, type: 'json'}).then(function (res) {
                if (res.body.hasOwnProperty('screenshotLink')) {
                    let preResult = JSON.parse(_this.getItem(node.id));
                    preResult.screenshot = res.body.screenshotLink;
                    _this.setItem(node.id, JSON.stringify(preResult));
                    util.setElement({node: node, content: {class: "btn_green_white_innerfade btn_small", href: res.body.screenshotLink}});
                    GM_openInTab(res.body.screenshotLink, false);
                }
                else {
                    node.className = "btn_blue_white_innerfade btn_small";
                    node.parentNode.parentNode.onclick = function () {_this.getScreenShot(node);};
                }
            });
        }
        csgomt.prototype.getFloatValue = function (node) {
            var _this = this;
            node.parentNode.parentNode.onclick = function () {};
            util.xhr({url: atob('aHR0cHM6Ly9hcGkuY3Nnb2Zsb2F0LmNvbS8/dXJsPQ')+node.getAttribute("link"), headers: {Origin: atob('Y2hyb21lLWV4dGVuc2lvbjovL2pqaWNiZWZwZW1ucGhpbmNjZ2lrcGRhYWdqZWJibmhn')}, type: 'json'}).then(function (result) {
                if (result.body.iteminfo) {
                    node.parentNode.parentNode.onclick = function () {_this.getScreenShot(node);};
                    let finalResult = _this.parseResult(result.body);
                    util.setElement({node: node, content: {class: "btn_blue_white_innerfade btn_small"}, html: "<span>"+finalResult.floatvalue+"</span>"});
                    let nameList = node.parentNode.parentNode.parentNode.getElementsByClassName('market_listing_item_name_block')[0];
                    _this.addInfo(nameList, finalResult);
                    _this.setItem(node.id, JSON.stringify(finalResult));
                }
                else {
                    node.innerHTML = "<span>????????????</span>";
                }
            });
        };
        csgomt.prototype.addInfo = function (nameList, result) {
            if (result.hasOwnProperty('seedText')) {
                let paintSeed = util.createElement({node: "span", content: {class: "market_listing_game_name", style: "display: block; color: silver;"}, html: result.seedText});
                nameList.appendChild(paintSeed);
            }
            if (result.hasOwnProperty('stickerText')) {
                let stickerWear = util.createElement({node: "span", content: {class: "market_listing_game_name", style: "display: block; color: silver;"}, html: result.stickerText});
                nameList.appendChild(stickerWear);
            }
            if (result.hasOwnProperty('dopplerText')) {
                let dopplerPhase = util.createElement({node: "span", content: {class: "market_listing_game_name", style: "display: block; color: silver;"}, html: result.dopplerText});
                nameList.appendChild(dopplerPhase);
            }
        }
        csgomt.prototype.addButton = function () {
            var _this = this;
            let oriButtonDiv = document.getElementById('market_buyorder_info').children[0];
            let oriButton = document.getElementById('market_commodity_buyrequests');
            let newButton = util.createElement({node: "div", content: {style: "float: right; padding-right: 10px;"}, html: "<a class=\"btn_blue_white_innerfade btn_medium market_noncommodity_buyorder_button\" href=\"javascript:void(0)\"><span>??????????????????</span></a>"});
            newButton.onclick = function () {
                _this.initItem();
                alert("???????????????");
            };
            oriButtonDiv.insertBefore(newButton, oriButton);
        };
        csgomt.prototype.addBanner = function () {
            let listBanner = document.getElementsByClassName('market_listing_table_header');
            listBanner = listBanner[listBanner.length-1];
            let nameBanner = listBanner.children[2];
            let childBanner = util.createElement({node: "span", content:{style: "padding-left: 4vw;"}});
            nameBanner.appendChild(childBanner);
            childBanner = util.createElement({node: "span", content: {style: "width: 20%;", class: "market_listing_right_cell market_listing_stickers_buttons market_listing_sticker"}, html: "??????"});
            listBanner.insertBefore(childBanner, nameBanner);
            childBanner = util.createElement({node: "span", content: {style: "width: 15%;", class: "market_listing_right_cell market_listing_action_buttons market_listing_wear"}, html: "?????????"});
            listBanner.insertBefore(childBanner, nameBanner);
        };
        csgomt.prototype.addStyle = function () {
            let customstyle = util.createElement({node: "style", html: ".market_listing_item_name_block {margin-top: 0px !important;}.csgo-stickers-show img:hover{opacity:1;width:96px;margin:-16px -24px -24px -24px;z-index:4;-moz-transition:.2s;-o-transition:.2s;-webkit-transition:.2s;transition:.2s;} .csgo-sticker{width: 48px;opacity: 1;vertical-align: middle;z-index: 3;-moz-transition: .1s; -o-transition: .1s; -webkit-transition: .1s; transition: .1s;}"});
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
                unsafeWindow.g_oSearchResults.GoToPage( (newPageInput.value-1), true );
                newPageInput.value = "";
            };
            newPageCtl.appendChild(newPageGo);
            oriPageDiv.insertBefore(newPageCtl, oriPageCtl);
            let newPageSizeCtl = util.createElement({node: "div", content: {class: "market_pagesize_options", style: "margin: 0 0 2em 0; font-size: 12px;"}, html: "??????????????????		"});
            let newPageSizeInput = util.createElement({node: "input", content: {class: "filter_search_box market_search_filter_search_box", style: "width: 30px;", type: "text", autocomplete: "off"}});
            let newPageSizeGo = util.createElement({node: "span", content: {class: "btn_darkblue_white_innerfade btn_small"}, html: "&nbsp;??????&nbsp;"});
            newPageSizeGo.onclick = function () {
                if (unsafeWindow.g_oSearchResults.m_cPageSize != newPageSizeInput.value && newPageSizeInput.value < 101) {
                    let oldPageSize = unsafeWindow.g_oSearchResults.m_cPageSize;
                    unsafeWindow.g_oSearchResults.m_cPageSize = newPageSizeInput.value;
                    unsafeWindow.g_oSearchResults.m_cMaxPages = Math.ceil(unsafeWindow.g_oSearchResults.m_cTotalCount / newPageSizeInput.value);
                    unsafeWindow.g_oSearchResults.GoToPage(unsafeWindow.g_oSearchResults.m_iCurrentPage, true);
                }
                newPageSizeInput.value = "";
            };
            newPageSizeCtl.appendChild(newPageSizeInput);
            newPageSizeCtl.appendChild(newPageSizeGo);
            document.getElementById('searchResults_ctn').appendChild(newPageSizeCtl);
        };
        csgomt.prototype.addType = function () {
            var _this = this;
            var type = {
                "FN": {"name": "????????????", "des": encodeURIComponent("Factory New"), "class": "btn_green_white_innerfade"},
                "MW": {"name": "????????????", "des": encodeURIComponent("Minimal Wear"), "class": "btn_blue_white_innerfade"},
                "FT": {"name": "????????????", "des": encodeURIComponent("Field-Tested"), "class": "btn_darkblue_white_innerfade"},
                "WW": {"name": "????????????", "des": encodeURIComponent("Well-Worn"), "class": "btn_grey_white_innerfade"},
                "BS": {"name": "????????????", "des": encodeURIComponent("Battle-Scarred"), "class": "btn_darkred_white_innerfade"}
            };
            let oriLink = location.href.split('/');
            oriLink = oriLink[oriLink.length-1];
            let curType = null;
            for (let i in type) {if (RegExp(type[i].des).test(oriLink)) {curType = i; break;}}
            let oriButton = document.getElementById('largeiteminfo_item_actions');
            if (curType != null) {
                oriButton.append(document.createElement('br'));
                for (let i in type) {
                    if (i != curType) {
                        let newBtn = util.createElement({node: "a", content: {class: "btn_small "+type[i].class, href: location.href.replace(type[curType].des, type[i].des), target: "_blank"}, html: "<span>"+type[i].name+"</span>"});
                        oriButton.append(newBtn);
                    }
                }
            }
        }
        csgomt.prototype.addVolume = function () {
            let oriLink = location.href.split('/');
            oriLink = oriLink[oriLink.length-1];
            util.xhr({url: `https://steamcommunity.com/market/priceoverview/?appid=730&market_hash_name=${oriLink}`, type: 'json'}).then(function (result) {
                var volume = '';
                if (result.body.success) {volume = `??? <span class="market_commodity_orders_header_promote">24</span> ?????????????????? <span class="market_commodity_orders_header_promote">${parseInt(result.body.volume.replace(/\, ?/gi, ''))}</span> ???`;}
                let oriDesc = document.getElementById('largeiteminfo_item_descriptors');
                let newDesc = util.createElement({node: "div", content: {class: "descriptor"}, html: volume});
                oriDesc.appendChild(newDesc);
            });
        }
        csgomt.prototype.load = function () {
            var _this = this;
            let isHandled = document.getElementsByClassName("market_listing_table_header");
            isHandled = isHandled[isHandled.length-1].children.length;
            if (isHandled > 3) {return false;}
            this.addBanner();
            this.addStyle();
            let itemDetails = unsafeWindow.g_rgAssets[730][2];
            let itemListInfo = unsafeWindow.g_rgListingInfo;
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
                let stickerInfo = itemDetails[assetid].descriptions[itemDetails[assetid].descriptions.length-1].value.replace(/\r/gi, '').replace(/\n/gi, '');
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
                let savedItem = this.getItem(listingid);
                if (savedItem) {
                    savedItem = JSON.parse(savedItem);
                    if (savedItem.hasOwnProperty('screenshot')) {
                        floatButton = util.createElement({node: "span", content: {style: "width: 15%;", class: "market_listing_right_cell market_listing_action_buttons market_listing_wear"}, html: '<div class="market_listing_right_cell market_listing_action_buttons" style="float:left;"><a target="_blank" href="'+savedItem.screenshot+'" id="'+listingid+'" class="btn_green_white_innerfade btn_small"><span>'+savedItem.floatvalue+'</span></a></div>'});
                    }
                    else {
                        floatButton = util.createElement({node: "span", content: {style: "width: 15%;", class: "market_listing_right_cell market_listing_action_buttons market_listing_wear"}, html: '<div class="market_listing_right_cell market_listing_action_buttons" style="float:left;"><a link="'+itemInfo[assetid].link+'" target="_blank" id="'+listingid+'" class="btn_blue_white_innerfade btn_small"><span>'+savedItem.floatvalue+'</span></a></div>'});
                        floatButton.onclick = function () {_this.getScreenShot(this.children[0].children[0]);};
                    }
                    _this.addInfo(nameList, savedItem);
                }
                else {
                    floatButton = util.createElement({node: "span", content: {style: "width: 15%;", class: "market_listing_right_cell market_listing_action_buttons market_listing_wear"}, html: '<div class="market_listing_right_cell market_listing_action_buttons" style="float:left;"><a link="'+itemInfo[assetid].link+'" target="_blank" id="'+listingid+'" class="floatvalue_button btn_darkblue_white_innerfade btn_small"><span>??????????????????</span></a></div>'});
                    floatButton.onclick = function () {
                        let clickedButton = this.children[0].children[0];
                        util.setElement({node: clickedButton, html: "<span>??????????????????</span>"});
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
            this.addType();
            this.addVolume();
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