// ==UserScript==
// @name         VAC Check
// @namespace    https://scriptr.org
// @version      0.5
// @description  Easily see VAC bans on players you've played with in the past.
// @author       Eyepawd
// @contributor  Gat
// @match        http://steamcommunity.com/*/friends/coplay*
// @match        https://steamcommunity.com/*/friends/coplay*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @grant        none
// @updateURL    https://scriptr.org/dl/vaccheck.user.js
// ==/UserScript==

var api = 'A0A47E806ED927C2F71C9B16EE27FD4D';

var friends = $('.friendCheckbox').toArray();
var recent = $('.friendCheckbox2').toArray();

var querypairs = new Map();
for (var i=0; i < recent.length; i++) {
    var id = recent[i].outerHTML.match('friends\\[(.*?)\\]')[1];
    if(!querypairs.has(id)) {
        querypairs.set(id, [recent[i]]);
    } else {
        querypairs.get(id).push(recent[i]);
    }
}
getPlayerBans(querypairs);

querypairs = new Map();
vanitypairs = new Map();
for (var i=0; i < friends.length; i++) {
    var url = friends[i].closest('div').outerHTML.match('top.location.href=\'(.*?)\'')[1];
    if(url.indexOf("/profiles/") === -1 && (url.indexOf("/id/") != -1)) {
        var vanity = url.split("/id/")[1];
        if(!vanitypairs.has(vanity)) {
            vanitypairs.set(vanity, [friends[i]]);
        } else {
            vanitypairs.get(vanity).push(friends[i]);
        }
    } else {
        var id = url.split("/profiles/")[1];
        if(!querypairs.has(id)) {
            querypairs.set(id, [friends[i]]);
        } else {
            querypairs.get(id).push(friends[i]);
        }
    }
}
getPlayerBans(querypairs);
getVanityBans(vanitypairs);

function writehtml(friend, data) {
    if(data.VACBanned && data.NumberOfGameBans > 0)
        $('<span class="friendSmallText" style="display: block; color: rgb(255, 73, 73); font-weight: bold;">' + data.NumberOfVACBans + ' VAC ban(s); ' + data.NumberOfGameBans + ' game ban(s); ' + data.DaysSinceLastBan + ' day(s) ago</span>').insertAfter($('.friendSmallText', friend.closest('div')));
    else if(data.NumberOfGameBans > 0)
        $('<span class="friendSmallText" style="display: block; color: rgb(255, 73, 73); font-weight: bold;">' + data.NumberOfGameBans + ' game ban(s); ' + data.DaysSinceLastBan + ' day(s) ago</span>').insertAfter($('.friendSmallText', friend.closest('div')));
    else if(data.VACBanned)
        $('<span class="friendSmallText" style="display: block; color: rgb(255, 73, 73); font-weight: bold;">' + data.NumberOfVACBans + ' VAC ban(s); ' + data.DaysSinceLastBan + ' day(s) ago</span>').insertAfter($('.friendSmallText', friend.closest('div')));
}

function resolveVanityURL(user, cb) {
    $.get('https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' + api + '&vanityurl=' + user, function(data) {
        return cb(data.response.steamid);
    });
}

function getSingleBan(user, cb) {
    $.get('https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=' + api + '&steamids=' + user, function(data) {
        return cb(data);
    });
}

function getPlayerBans(querypairs) {
    querylist = Array.from(querypairs.keys());
    // the api will only query 100 players at a time
    for (var start = 0; start < querylist.length; start += 90) {
        idlist = querylist.slice(start, start + 90);
        $.get('https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=' + api + '&steamids=' + idlist.join(), function(data) {
            data["players"].forEach(function(bans) {
                var friend = querypairs.get(bans.SteamId)
                friend.forEach(function(ele) {
                    return writehtml(ele, bans);
                });
            });
        });
    }
}

function getVanityBans(vanitypairs) {
    var querylist = Array.from(vanitypairs.keys());

    querylist.forEach(function(user) {
        resolveVanityURL(user, function(id) {
            getSingleBan(id, function(data) {
                var friend = vanitypairs.get(user)
                friend.forEach(function(ele) {
                    writehtml(ele, data);
                });
            });
        });
    });
}
