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
	}).onclick(nodeClick);
	$api.get('dropmenu.json').then(function(req) {
		drop.add(req.data);
	});
	//右上角菜单,用户信息
	var usermenu = window.$dropmenu.create({
		target: '#user-area',
		width: 100,
		plwidth: 120,
		level: 2000
	}).onclick(nodeClick);
	$api.get('userinfo.json').then(function(req) {
		usermenu.add(req.data);
	});
	//树形菜单
	var tree = $treemenu.create({
		target: '#treemenu-area',
		width: 200
	}).onresize(function(s, e) { //当宽高变更时
		$dom('#tabs-area').width('calc(100% - ' + (e.width + vbar.width + 10) + 'px )');
	}).onfold(function(s, e) { //当右侧树形折叠时
		var width = e.action == 'fold' ? vbar.width + 50 : s.width + vbar.width + 10;
		$dom('#tabs-area').width('calc(100% - ' + width + 'px )');
	}).onclick(nodeClick);
	$api.get('treemenu.json').then(function(req) {
		tree.add(req.data);
	});
	//竖形工具条
	var vbar = $vbar.create({
		target: '#vbar-area',
		id: 'rbar-156',
		width: 30,
		height: 'calc(100% - 35px)'
	}).onclick(nodeClick);
	$api.get('vbar.json').then(function(req) {
		vbar.add(req.data);
	});
	//选项卡
	window.tabsContent = $tabs.create({
		target: '#tabs-area',
		width: 1,
		default: {
			title: '启始页',
			path: '树形菜单,启始页',
			url: 'other/treemenu-1.html'
		}
	});
});
//节点点击事件，tree,drop,vbar统一用这一个
function nodeClick(sender, eventArgs) {
	var data = eventArgs.data;
	if(data.childs)return;
	//节点类型
	//open：弹窗，item菜单项（在tabs中打开)，event脚本事件,
	//link外链接（直接响应）,node节点下的子项将一次性打开（此处不触发）
	//console.log(eventArgs.data.title);
	switch (data.type) {
		case 'open':
			$pagebox.create({
				id: data.id ? data.id : null,
				width: data.width ? data.width : 400,
				height: data.height ? data.height : 200,
				url: data.url ? data.url : '',
				title: data.title
			}).open();
			break;
		case 'event':
			if (!data.url) return;
			try {
				eval(data.url);
			} catch (err) {
				alert('脚本执行错误，请仔细检查：\n' + data.url);
			}

			break;
		default:
			window.tabsContent.add(data);
			break;
	}
}