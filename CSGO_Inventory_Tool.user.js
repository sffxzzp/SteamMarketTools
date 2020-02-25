// ==UserScript==
// @name         CSGO Inventory Float Value
// @namespace    https://coding.net/u/sffxzzp
// @version      0.10
// @description  A script that displays float value & screenshot of csgo skins
// @author       sffxzzp
// @match        *://steamcommunity.com/*/inventory*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @connect      api.csgofloat.com
// @connect      money.csgofloat.com
// @updateURL    https://sffxzzp.coding.net/p/SteamMarketTools/d/SteamMarketTools/git/raw/master/CSGO_Inventory_Tool.user.js
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
                        timeout: 3e4,
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
                    xhr.responseType = xhrData.responseType || "";
                    xhr.timeout = 3e4;
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
    var ifv = (function () {
        function ifv() {}
        ifv.prototype.getScreenShot = function (node) {
            var _this = this;
            node.className = "btn_darkred_white_innerfade btn_small";
            node.parentNode.parentNode.onclick = function () {};
            util.xhr({url: atob('aHR0cHM6Ly9tb25leS5jc2dvZmxvYXQuY29tL21vZGVsP3VybD0=')+node.getAttribute('link'), headers: {'Origin': atob('Y2hyb21lLWV4dGVuc2lvbjovL2pqaWNiZWZwZW1ucGhpbmNjZ2lrcGRhYWdqZWJibmhn')}, type: 'json'}).then(function (res) {
                if (res.body.hasOwnProperty('screenshotLink')) {
                    let preResult = JSON.parse(localStorage.getItem(node.id));
                    preResult.screenshot = res.body.screenshotLink;
                    localStorage.setItem(node.id, JSON.stringify(preResult));
                    util.setElement({node: node, content: {class: "btn_green_white_innerfade btn_small", href: res.body.screenshotLink}});
                }
                else {
                    util.setElement({node: node, content: {class: "btn_blue_white_innerfade btn_small"}});
                    node.parentNode.parentNode.onclick = function () {_this.getScreenShot(node);};
                }
            });
        }
        ifv.prototype.getFloatValue = function (node) {
            let _this = this;
            util.xhr({
                url: "https://api.csgofloat.com/?url="+node.getAttribute("link")
            }).then(function (result) {
                result = JSON.parse(result.body);
                if (result.iteminfo) {
                    node.onclick = function () {_this.getScreenShot(node);};
                    util.setElement({node: node, content: {class: "btn_blue_white_innerfade btn_small"}, html: "<span>"+result.iteminfo.floatvalue.toFixed(14)+"</span>"});
                    localStorage.setItem(node.id, JSON.stringify({floatvalue: result.iteminfo.floatvalue.toFixed(14)}));
                }
                else {
                    node.innerHTML = "<span>查询失败</span>";
                }
            });
        };
        ifv.prototype.Start = function () {
            let _this = this;
            var csgoinv = document.getElementsByClassName("inventory_page_right")[0];
            var observer = new MutationObserver(function (recs) {
                for (let i=0;i<recs.length;i++) {
                    let rec = recs[i];
                    if (rec.target.classList.contains('item_actions') && rec.target.parentNode.parentNode.classList.contains('app730') && rec.target.childElementCount>0) {
                        if (rec.target.childElementCount<2) {
                            let btnId = rec.target.children[0].href.match(/csgo_econ_action_preview%20(S\d*A\d*D\d*)/);
                            btnId = btnId[1] != undefined ? btnId[1] : '';
                            let savedItem = localStorage.getItem(btnId);
                            let fvbtn;
                            if (savedItem) {
                                savedItem = JSON.parse(savedItem);
                                if (savedItem.hasOwnProperty('screenshot')) {
                                    fvbtn = util.createElement({node: "a", content: {id: btnId, target: "_blank", class: "btn_small btn_green_white_innerfade", href: savedItem.screenshot}, html: "<span>"+savedItem.floatvalue+"</span>"});
                                }
                                else {
                                    fvbtn = util.createElement({node: "a", content: {id: btnId, target: "_blank", class: "btn_small btn_blue_white_innerfade", link: rec.target.children[0].href}, html: "<span>"+savedItem.floatvalue+"</span>"});
                                    fvbtn.onclick = function () {_this.getScreenShot(this)};
                                }
                            }
                            else {
                                fvbtn = util.createElement({node: "a", content: {id: btnId, target: "_blank", class: "btn_small btn_darkblue_white_innerfade", link: rec.target.children[0].href}, html: "<span>点击查询磨损</span>"});
                                fvbtn.onclick = function () {
                                    this.innerHTML = "<span>磨损查询中…</span>";
                                    _this.getFloatValue(this);
                                };
                            }
                            rec.target.appendChild(fvbtn);
                        }
                    }
                }
            });
            observer.observe(csgoinv, { childList: true, subtree: true });
        };
        return ifv;
    })();
    var program = new ifv();
    program.Start();
})();