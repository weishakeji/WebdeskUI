/*!
 * 主 题：管理后台
 * 说 明：
 * 1、web端管理后台，集成树形菜单等控件；
 * 2、各控件数据源基本相同，可以相互转换；
 * 3、当tabs.js（选项卡）切换时，关联pagebox窗体同步切换；
 *
 * 作 者：微厦科技_宋雷鸣_10522779@qq.com
 * 开发时间: 2020年2月1日
 * 最后修订：2020年2月28日
 * github开源地址:https://github.com/weishakeji/WebdeskUI
 */
window.onload = function() {
	window.$skins.loadCss();
};


$dom.ready(function() {
	var login = $login.create({
        target: '#login-area',
        //width: '320px',
        title: '微厦在线学习系统',
        company: '微厦科技',
        website: 'http://www.weishakeji.net',
        tel: '400 6015615'
    });
    login.onsubmit(function(s,e){
    	$dom('panel#login').hide();
    	$dom('panel#admin').show().css('opacity',1);
    	window.$skins.onchange();
    });
	//左上角下拉菜单
	var drop = window.$dropmenu.create({
		target: '#dropmenu-area',
		//width: 280,
		id: 'main_menu'
	}).onclick(nodeClick);
	$dom.get('datas/dropmenu.json', function(d) {
		drop.add(eval(d));
	});

	//右上角菜单,用户信息
	var usermenu = window.$dropmenu.create({
		target: '#user-area',
		width: 100,
		plwidth: 120,
		level: 2000
	}).onclick(nodeClick);
	$dom.get('datas/userinfo.json', function(req) {
		usermenu.add(eval('(' + req + ')'));
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
	$dom.get('datas/treemenu.json', function(req) {
		tree.add(eval(req));
	});
	//竖形工具条
	var vbar = $vbar.create({
		target: '#vbar-area',
		id: 'rbar-156',
		width: 30,
		height: 'calc(100% - 35px)'
	}).onclick(nodeClick);
	$dom.get('datas/vbar.json', function(req) {
		vbar.add(eval('(' + req + ')'));
	});
	//选项卡
	var tabs = $tabs.create({
		target: '#tabs-area',
		width: 1,
		default: {
			title: '启始页',
			path: '树形菜单,启始页',
			url: 'startpage.html',
			ico:'a020'
		}
	});
	tabs.onshut(tabsShut).onchange(tabsChange);
	tabs.onhelp(function(s, e) {
		$pagebox.create({
			pid: e.data.id, //父id,此处必须设置，用于判断该弹窗属于哪个选项卡
			width: 600,
			height: 400,
			url: e.data.help,
			title: e.data.title + '- 帮助'
		}).open();
	});
	window.tabsContent = tabs;

	//风格切换事件
	window.$skins.onchange(function(s, e) {
		$dom('panel#admin').css('opacity', 0);
		//设置页面顶部的文本（系统名称）
		window.setTimeout(function() {
			var left = $dom('#dropmenu-area').width() + 10;
			$dom('#headbar').css('opacity', 1).left(left);
			$dom('#headbar').width('calc(100% - ' + left + 'px - ' + (100) + 'px)');
			$dom('panel#admin').css('opacity', 1);
		}, 300);
	});
	window.setTimeout(function() {
		//window.$skins.onchange();
	}, 1000)

});
/*
	事件
*/
//节点点击事件，tree,drop,vbar统一用这一个
function nodeClick(sender, eventArgs) {
	var data = eventArgs.data;
	if (data.childs) return; //如果有下级节点，则不响应事件
	//节点类型
	//open：弹窗，item菜单项（在tabs中打开)，event脚本事件,
	//link外链接（直接响应）,node节点下的子项将一次性打开（此处不触发）
	//console.log(eventArgs.data.title);
	switch (data.type) {
		case 'open':
			$pagebox.create(data).open();
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
			if (!!data.url)
				window.tabsContent.add(data);
			break;
	}
}
//选项卡关闭事件
function tabsShut(sender, eventArgs) {
	var data = eventArgs.data;
	//获取当前标签生成的窗体
	var boxs = $ctrls.all('pagebox');
	var arr = new Array();
	for (var i = 0; i < boxs.length; i++) {
		if (boxs[i].obj.pid == data.id) {
			arr.push(boxs[i].obj);
			var childs = boxs[i].obj.getChilds();
			for (var j = 0; j < childs.length; j++) {
				arr.push(childs[j]);
			}
		}
	}
	//关闭当前标签生成的窗体
	if (arr.length > 0) {
		if (confirm('当前选项卡“' + data.title + '”有 ' + arr.length + '个 窗体未关闭，\n是否全部关闭？')) {
			for (var i = 0; i < arr.length; i++) arr[i].shut();
			return true;
		}
		return false;
	}
	return true;
}
//选项卡切换事件
function tabsChange(sender, eventArgs) {
	//获取当前标签生成的窗体，全部还原
	var selfbox = getSelfbox(eventArgs.data.id);
	for (var i = 0; i < selfbox.length; i++) {
		selfbox[i].toWindow().focus();
	}
	//非当前标签的窗体，全部最小化
	var elsebox = getElsebox(sender, eventArgs.data.id);
	for (var i = 0; i < elsebox.length; i++) elsebox[i].mini = true;

	//当前标签生成的窗体
	function getSelfbox(tabid) {
		var boxs = $ctrls.all('pagebox');
		//获取当前标签生成的窗体，全部还原
		var arr = new Array();
		for (var i = 0; i < boxs.length; i++) {
			if (boxs[i].obj.pid == tabid) {
				arr.push(boxs[i].obj);
				var childs = boxs[i].obj.getChilds();
				for (var j = 0; j < childs.length; j++)
					arr.push(childs[j]);
			}
		}
		//按层深排序，以保证在还原时保持窗体原有层叠效果
		for (var i = 0; i < arr.length - 1; i++) {			
			for (var j = 0; j < arr.length - 1 - i; j++) {				
				if (arr[j].level > arr[j + 1].level) {
					var temp = arr[j];
					arr[j] = arr[j + 1];
					arr[j + 1] = temp;
				}
			}
		}
		return arr;
	}
	//非当前标签的窗体(不包括其它控件生成的窗体)
	function getElsebox(sender, tabid) {
		var boxs = $ctrls.all('pagebox');
		var tabs = sender.childs;
		var arr = [];
		for (var i = 0; i < tabs.length; i++) {
			if (tabs[i].id == tabid) continue;
			for (var j = 0; j < boxs.length; j++) {
				if (boxs[j].obj.pid == tabs[i].id) {
					arr.push(boxs[j].obj);
					var childs = boxs[j].obj.getChilds();
					for (var n = 0; n < childs.length; n++)
						arr.push(childs[n]);
				}
			}
		}
		return arr;
	}

}