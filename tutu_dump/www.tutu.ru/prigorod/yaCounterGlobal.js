(function (e, f, g, a, b, d, c) {
	e[b] =
		e[b] ||
		function () {
			(e[b].a = e[b].a || []).push(arguments);
		};
	e[b].l = 1 * new Date();
	d = f.createElement(g);
	c = f.getElementsByTagName(g)[0];
	d.async = 1;
	d.src = a;
	c.parentNode.insertBefore(d, c);
})(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
(function () {
	function e() {
		var a = {},
			b = f();
		b && (a.UserID = b);
		return a;
	}
	function f() {
		var a = document.cookie.match(/SESSIONID=(.+?);/);
		a || (a = document.cookie.match(/SESSIONID=(.+?)$/));
		return a ? a[1] : null;
	}
	function g(a, b) {
		var d = [],
			c;
		for (c in b) {
			var h = a ? a + '[' + c + ']' : c;
			'object' == typeof b[c] ? d.push(g(h, b[c])) : d.push(h + '\x3d' + b[c]);
		}
		return d.join('\x26');
	}
	ym(7294060, 'init', { clickmap: !0, trackLinks: !0, accurateTrackBounce: !0, webvisor: !0, userParams: e() });
	ym(7294060, 'getClientID', function (a) {
		a = {
			data: {
				0: {
					title: 'client_id_join',
					type: 'special',
					_type: 'event',
					_eventTimeMs: +new Date(),
					page_id: 'undefined',
					yandex_id: a,
				},
			},
			session_id: f(),
			sendTimeMs: +new Date(),
		};
		a = g(null, a);
		a = encodeURI('https://api-an.tutu.ru/userway/sendEvent/?' + a);
		var b = document.createElement('img');
		b.setAttribute('src', a);
		b.setAttribute('style', 'display:none');
		document.body.appendChild(b);
	});
})();
