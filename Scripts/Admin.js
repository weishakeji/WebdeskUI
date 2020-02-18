/*!
 * 主 题：管理后台
 * 说 明：
 * 1、web端管理后台，集成树形菜单等控件；
 
 * 作 者：微厦科技_宋雷鸣_10522779@qq.com
 * 开发时间: 2020年2月1日
 * 最后修订：2020年2月28日
 * github开源地址:https://github.com/weishakeji/WebdeskUI
 */
window.onload = function() {
	//加载控件资源
	var resources = ['treemenu', 'dropmenu', 'tabs', 'verticalbar', 'pagebox'];
	for (var i = 0; i < resources.length; i++) {
		window.$dom.load.css('styles/' + resources[i] + '.css');
		//window.$dom.load.js('Scripts/' + resources[i] + '.js');
	}

}
$dom.ready(function() {
	//左上角下拉菜单
	var drop = window.$dropmenu.create({
		target: '#dropmenu-area',
		width: 100
	}).ondata(function(s, e) {
		//设置页面顶部的文本（系统名称）
		var left = s.dom.width() + 20;
		$dom('#headbar').left(left).width('calc(100% - ' + left + 'px - ' + ($dom("#user-area").width() + 20) + 'px)');
	});
	$api.get('dropmenu.json').then(function(req) {
		drop.add(req.data);
	});
	//右上角菜单,用户信息
	var usermenu = window.$dropmenu.create({
		target: '#user-area',
		width: 100,
		plwidth: 120
	});
	$api.get('userinfo.json').then(function(req) {
		usermenu.add(req.data);
	});
	//树形菜单
	var tree = $treemenu.create({
		target: '#treemenu-area',
		width: 200
	});
	$api.get('treemenu.json').then(function(req) {
		tree.add(req.data);
	});
	//竖形工具条
	var vbar = $vbar.create({
		target: '#vbar-area',
		id: 'rbar-156',
		width: 30,
		height: 'calc(100% - 35px)'
	});
	$api.get('vbar.json').then(function(req) {
		vbar.add(req.data);
	});
	//选项卡
	var tabs = $tabs.create({
		target: '#tabs-area',
		width: 1,
		default: {
			title: '启始页',
			path: '树形菜单,启始页',
			url: 'other/treemenu-1.html'
		}
	});

	var size = function(s, e) {
		//console.log('treemenu的宽:' + e.width + '，高：' + e.height);
		$dom('#tabs-area').width('calc(100% - ' + (e.width + vbar.width + 10) + 'px )');
	};
	tree.onresize(size);
	//tree.width = 260;
	//折叠
	tree.onfold(function(s, e) {
		if (e.action == 'fold') {
			$dom('#tabs-area').width('calc(100% - ' + (vbar.width + 50) + 'px )');
		} else {
			$dom('#tabs-area').width('calc(100% - ' + (s.width + vbar.width + 10) + 'px )');
		}
	});
	//树形菜单节点点击事件
	tree.onclick(function(s, e) {
		//var url = e.data.url ? e.data.url : '';
		tabs.add(e.data);
	});

	//创建窗体
	var box = $pagebox.create({
		width: 400,
		height: 300,
		resize: true,
		min: true,
		max: true,
		close: true,
		url: 'pagebox-child.html',
		title: '可移动，可缩放；双击标题栏全屏,标题右键菜单'
	});
	box.open();
});