// ==UserScript==
// @name         CSGO Inventory Float Value
// @namespace    https://coding.net/u/sffxzzp
// @version      0.07
// @description  A script that displays float value & screenshot of csgo skins
// @author       sffxzzp
// @match        *://steamcommunity.com/*/inventory*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @connect      api.csgofloat.com
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
        return util;
    })();
    var ifv = (function () {
        function ifv() {}
        ifv.prototype.getFloatValue = function (node) {
            let _this = this;
            util.xhr({
                url: "https://api.csgofloat.com/?url="+node.getAttribute("link")
            }).then(function (result) {
                result = JSON.parse(result.body);
                if (result.iteminfo) {
                    node.onclick = function () {};
                    node.target = "_blank";
                    node.href = "https://csgo.gallery/"+node.getAttribute("link");
                    node.innerHTML = "<span>"+result.iteminfo.floatvalue.toFixed(14)+"</span>";
                    node.className="btn_green_white_innerfade btn_small";
                    localStorage.setItem(node.id, JSON.stringify({fv:result.iteminfo.floatvalue.toFixed(14)}));
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
                            let fvbtn = document.createElement("a");
                            fvbtn.setAttribute("class", "btn_small btn_darkblue_white_innerfade");
                            fvbtn.setAttribute("link", rec.target.children[0].href);
                            fvbtn.innerHTML = "<span>点击查询磨损</span>";
                            fvbtn.onclick = function () {
                                this.innerHTML = "<span>磨损查询中…</span>";
                                _this.getFloatValue(this);
                            };
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