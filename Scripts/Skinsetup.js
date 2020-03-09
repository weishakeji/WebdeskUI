(function() {
	var list = top.window.$skins.list;
	list.sort(function(a, b) {
		return a.tag > b.tag;
	})
	for (var i = 0; i < list.length; i++) {
		var skin = list[i];
		var box = $dom('.skins').add('skin');
		box.attr('tag', skin.tag);
		box.add('name').html(skin.name);
		box.add('img').attr('src', skin.path + '/logo.jpg');
		box.click(function(event) {
			var n = event.target ? event.target : event.srcElement;
			while (n.tagName.toLowerCase() != 'skin') n = n.parentNode;
			var box=$dom(n);
			var tag=box.attr('tag');
			top.window.$skins.setup(tag);
		});
	}
	//console.log(list);
})();