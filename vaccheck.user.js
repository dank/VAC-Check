// ==UserScript==
// @name         VAC Check
// @namespace    https://scriptr.org
// @version      0.2
// @description  Easily see VAC bans on players you've played with in the past.
// @author       Eyepawd
// @contributor  Gat
// @match        http://steamcommunity.com/*/friends/coplay*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @grant        none
// @updateURL    https://scriptr.org/dl/vaccheck.user.js
// ==/UserScript==

var friends = $('.friendCheckbox').toArray();
var recent = $('.friendCheckbox2').toArray();

recent.forEach(function(friend) {
    getPlayerBans(friend.outerHTML.match('friends\\[(.*?)\\]')[1], function(data) {
        if(data.VACBanned)
            $('<span class="friendSmallText" style="display: block; color: rgb(255, 73, 73); font-weight: bold;">' + data.NumberOfVACBans + ' VAC ban(s); ' + data.DaysSinceLastBan + ' day(s) ago</span>').insertAfter($('.friendSmallText', friend.closest('div')));
    });
});

friends.forEach(function(friend) {
    var url = friend.closest('div').outerHTML.match('top.location.href=\'(.*?)\'')[1];
    if(url.indexOf("/profile/") === -1 && (url.indexOf("/id/") != -1)) {
        resolveVanityURL(url.split("/id/")[1], function(id) {
            getPlayerBans(id, function(data) {
                if(data.VACBanned)
                    $('<span class="friendSmallText" style="display: block; color: rgb(255, 73, 73); font-weight: bold;">' + data.NumberOfVACBans + ' VAC ban(s); ' + data.DaysSinceLastBan + ' day(s) ago</span>').insertAfter($('.friendSmallText', friend.closest('div')));
            });
        });
    } else {
        getPlayerBans(url.split("/profiles/")[1], function(data) {
            if(data.VACBanned)
                $('<span class="friendSmallText" style="display: block; color: rgb(255, 73, 73); font-weight: bold;">' + data.NumberOfVACBans + ' VAC ban(s); ' + data.DaysSinceLastBan + ' day(s) ago</span>').insertAfter($('.friendSmallText', friend.closest('div')));
        });
    }
});

function resolveVanityURL(user, cb) {
    $.get('https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=F6F90A461E30D38AB4AE8AADB5AD8658&vanityurl=' + user, function(data) {
        return cb(data.response.steamid);
    });
}

function getPlayerBans(user, cb) {
    $.get('https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=F6F90A461E30D38AB4AE8AADB5AD8658&steamids=' + user, function(data) {
        return cb(data.players[0]);
    });
}