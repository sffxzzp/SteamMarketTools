// ==UserScript==
// @name         24h Market Sells
// @namespace    https://coding.net/u/sffxzzp
// @version      0.02
// @description  Shows 24 hours sell number on market page
// @author       sffxzzp
// @match        *://steamcommunity.com/market/listings/*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @updateURL    https://sffxzzp.coding.net/p/SteamMarketTools/d/SteamMarketTools/git/raw/master/24h_sells.user.js
// ==/UserScript==

(function() {
    let oriLink = location.href.split('/');
    let appid = oriLink[oriLink.length-2];
    oriLink = oriLink[oriLink.length-1];
    GM_xmlhttpRequest({
        method: "get",
        url: `https://steamcommunity.com/market/priceoverview/?appid=${appid}&market_hash_name=${oriLink}`,
        responseType: "json",
        timeout: 3e4,
        onload: function (result) {
            result = result.response;
            var volume = '';
            if (result.success) {
                volume = `在 <span class="market_commodity_orders_header_promote">24</span> 小时内卖出了 <span class="market_commodity_orders_header_promote">${parseInt(result.volume.replace(/\, ?/gi, ''))}</span> 个`;
            }
            let oriDesc = document.getElementById('largeiteminfo_item_descriptors');
            if (oriDesc.getAttribute('style').length > 0) {
                oriDesc.setAttribute('style', 'display: block;');
            }
            let newDesc = document.createElement('div');
            newDesc.setAttribute('class', 'descriptor');
            newDesc.innerHTML = volume;
            console.log(volume);
            oriDesc.appendChild(newDesc);
        }
    });
})();