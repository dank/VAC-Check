// ==UserScript==
// @name         VAC Check
// @namespace    https://scriptr.org
// @version      0.1
// @description  Easily see VAC bans on players you've played with in the past.
// @author       Eyepawd
// @match        http://steamcommunity.com/*/friends/coplay*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @grant        none
// ==/UserScript==

var friends = $('.friendCheckbox2').toArray();
friends.forEach(function(friend) {
    var id = friend.outerHTML.match('friends\\[(.*?)\\]')[1];
    $.get('https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=F6F90A461E30D38AB4AE8AADB5AD8658&steamids=' + id, function(data) {
        if(data.players[0].VACBanned) {
            $('<span class="friendSmallText" style="display: block; color: rgb(255, 73, 73); font-weight: bold;">' + data.players[0].NumberOfVACBans + ' VAC ban(s); ' + data.players[0].DaysSinceLastBan + ' day(s) ago</span>').insertAfter($('.friendSmallText', friend.closest('div')));
        }
    });
});