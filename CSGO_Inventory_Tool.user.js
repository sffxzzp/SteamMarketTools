// ==UserScript==
// @name         CSGO Inventory Float Value
// @namespace    https://coding.net/u/sffxzzp
// @version      0.01
// @description  A script that displays float value & screenshot of csgo skins
// @author       sffxzzp
// @match        *://steamcommunity.com/*/inventory*
// @icon         https://steamcommunity.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @connect      metjm.net
// @updateURL    https://coding.net/u/sffxzzp/p/CSGO-Market-Tool/git/raw/master/CSGO_Inventory_Tool.user.js
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
                    if (xhrData.method === "POST")
                        xhr.setRequestHeader(
                            "content-type",
                            "application/x-www-form-urlencoded; charset=utf-8"
                        );
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
        return util;
    })();
    var ifv = (function () {
        function ifv() {}
        ifv.prototype.getFloatValue = function (node, guid, itemId) {
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
                        }
                    }
                    else if (result.success===false) {
                        node.innerHTML = "查询失败";
                    }
                });
            }
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
                                _this.getFloatValue(this, util.guid(), "first");
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