var FB = require('fb')
var moment = require('moment');

exports.map = function(req, res){
	FB.setAccessToken(req.user.accessToken);
	FB.api('fql', {q: {checkins: 'SELECT coords, author_uid, message,target_id, target_type, timestamp FROM checkin WHERE author_uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND timestamp > "'+(Math.round((new Date()).getTime()/1000)-365*24*60*60) + '" ORDER BY timestamp DESC LIMIT 0,100',  names: 'SELECT name,uid,pic_small,profile_url FROM user WHERE uid IN (SELECT author_uid FROM #checkins)', events: 'SELECT name,page_id,page_url FROM page WHERE page_id IN (SELECT target_id FROM #checkins)'}}, function (checkins) {
		if(!checkins || checkins.error) {
			console.log(!checkins ? 'error occurred' : checkins.error);
			return;
		}
		checkins.data[0].fql_result_set.forEach(function(checkin) {
			checkin.date = moment.unix(checkin.timestamp).fromNow();
			var i = ArrayIndexOf(checkins.data[2].fql_result_set, function(obj) {
				return obj.uid == checkin.author_uid;
			});
			checkin.name = checkins.data[2].fql_result_set[i].name;
			checkin.profile_pic = checkins.data[2].fql_result_set[i].pic_small;
			checkin.profile_url = checkins.data[2].fql_result_set[i].profile_url;
			
			if (checkin.target_type == 'page') {
				var i = ArrayIndexOf(checkins.data[1].fql_result_set, function(obj) {
					return obj.page_id == checkin.target_id;
				});
				checkin.page = checkins.data[1].fql_result_set[i].name;
				checkin.page_url = checkins.data[1].fql_result_set[i].page_url;
			}
		});
		res.render('map', {checkins:checkins.data[0].fql_result_set});
	});
};

function ArrayIndexOf(a, fnc) {
if (!fnc || typeof (fnc) != 'function') {
return -1;
}
if (!a || !a.length || a.length < 1) return -1;
for (var i = 0; i < a.length; i++) {
if (fnc(a[i])) return i;
}
return -1;
}