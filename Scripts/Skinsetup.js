(function() {
	//所有风格
	var list = top.window.$skins.list;
	list.sort(function(a, b) {
		return a.tag > b.tag;
	});
	//当前风格
	var curr=top.window.$skins.current();
	console.log(curr);
	//生成页面效果
	for (var i = 0; i < list.length; i++) {
		var skin = list[i];
		var box = $dom('.skins').add('skin');
		box.attr('tag', skin.tag);
		box.add('name').html(skin.name);
		box.add('img').attr('src', skin.path + '/logo.jpg');
		if(skin.tag==curr){
			box.addClass('curr');
		}
		//点击切换风格
		box.click(function(event) {
			var n = event.target ? event.target : event.srcElement;
			while (n.tagName.toLowerCase() != 'skin') n = n.parentNode;
			$dom('skin').removeClass('curr');
			var box=$dom(n);
			box.addClass('curr');
			var tag=box.attr('tag');
			top.window.$skins.setup(tag);
		});
	}
	//console.log(list);
})();