(function(win) {
	var tabs = function(param) {
		if (param == null || typeof(param) != 'object') param = {};
		var defaultAttr = {
			target: '', //所在Html区域
			size: 0, //选项卡个数
			maximum: 100, //最多能有多少个选项卡
			width: 100,
			height: 200,
			id: '',
			morebox: false, //更多标签的面板是否显示
			cntmenu: false //右键菜单是否显示
		};
		for (var t in param) defaultAttr[t] = param[t];
		//defaultAttr+param的参数，全部实现双向绑定
		for (var t in defaultAttr) {
			this['_' + t] = defaultAttr[t];
			eval($ctrl.def(t));
		}
		this.childs = new Array(); //子级
		//this.pageboxs=new Array();	//当前
		this.dom = null; //html对象
		this._eventlist = new Array(); //自定义的事件集合     
		this._watchlist = new Array(); //自定义监听  
		/* 自定义事件 */
		var customEvents = ['shut', 'shutall', 'shutright', , 'shutleft', 'add', 'change'];
		for (var i = 0; i < customEvents.length; i++) {
			eval('this.on' + customEvents[i] + '=function(f){\
                return arguments.length > 0 ?  \
                this.bind(\'' + customEvents[i] + '\', f) :  \
                this.trigger(\'' + customEvents[i] + '\');};');
		}
		//绑定自定义事件
		this.bind = function(eventName, func) {
			if (typeof(func) == "function")
				this._eventlist.push({
					'name': eventName,
					'event': func
				});
			return this;
		};
		//触发自定义事件
		this.trigger = function(eventName, eventArgs) {
			var arrEvent = this.events(eventName);
			if (arrEvent.length < 1) return true;
			//事件参数处理，增加事件名称与形为
			if (!eventArgs) eventArgs = {};
			if (!eventArgs['event']) eventArgs['event'] = eventName;
			if (!eventArgs['action']) eventArgs['action'] = eventName;
			if (!eventArgs['target']) eventArgs['target'] = this.dom[0];
			//执行事件，当事件中有任一事件返回false，则不再继续执行后续事件
			var results = [];
			for (var i = 0; i < arrEvent.length; i++) {
				var res = arrEvent[i](this, eventArgs);
				//不管返回结果是什么类型的值，都转为bool型
				res = (typeof(res) == 'undefined' ? true : (typeof(res) == 'boolean' ? res : true));
				results.push(res);
				if (!res) break;
			}
			for (var i = 0; i < results.length; i++)
				if (!results[i]) return false;
			return true;
		};
		//获取某类自定义事件的列表
		this.events = function(eventName) {
			var arrEvent = new Array();
			for (var i = 0; i < this._eventlist.length; i++) {
				if (this._eventlist[i].name == eventName)
					arrEvent.push(this._eventlist[i].event);
			}
			return arrEvent;
		};
		this._open();
		this.width = this._width;
		this.height = this._height;
		//
		$ctrls.add({
			id: this.id,
			obj: this,
			dom: this.dom,
			type: 'tabs'
		});
	};
	var fn = tabs.prototype;
	fn._initialization = function() {
		this._id = 'tabs_' + new Date().getTime();
	};
	//当属性更改时触发相应动作
	fn._watch = {
		'width': function(obj, val, old) {
			if (obj.dom) obj.dom.width(val);
		},
		'height': function(obj, val, old) {
			if (obj.dom) obj.dom.height(val);
		},
		//更多标签的面板是否显示
		'morebox': function(obj, val, old) {
			if (obj.domore) {
				if (val) obj.domore.width(200).css('opacity', 1);
				if (!val) obj.domore.width(0).css('opacity', 0);
			}
		},
		//右键菜单的显示
		'cntmenu': function(obj, val, old) {
			if (obj.domenu) {
				if (val) obj.domenu.show();
				if (!val) obj.domenu.hide();
			}
		}
	};
	fn._open = function() {
		this._initialization();
		//创建控件html对象
		for (var t in this._builder) this._builder[t](this);
		for (var t in this._baseEvents) this._baseEvents[t](this);
	};
	fn._builder = {
		shell: function(obj) {
			var area = $dom(obj.target);
			if (area.length < 1) {
				console.log('tabs所在区域不存在');
				return;
			}
			area.addClass('tabsbox').attr('ctrid', obj.id);
			obj.dom = area;
		},
		title: function(obj) {
			var tagarea = obj.dom.append('tabs_tagarea').find('tabs_tagarea');
			var tagsbox = tagarea.append('tabs_tagbox').find('tabs_tagbox');
			obj.domtit = tagsbox;
			//右上角的更多按钮
			obj.dom.append('tabs_more');
		},
		body: function(obj) {
			var body = obj.dom.append('tabs_body').find('tabs_body');
			obj.dombody = body;
		},
		//右侧，更多标签的区域
		morebox: function(obj) {
			var more = obj.dom.append('tabs_morebox').find('tabs_morebox');
			obj.domore = more;
		},
		//右键菜单
		contextmenu: function(obj) {
			var menu = obj.dom.append('tabs_contextmenu').find('tabs_contextmenu');
			menu.append('menu_fresh').find('menu_fresh').html('刷新');
			menu.append('menu_freshtime').find('menu_freshtime').html('定时刷新(10秒)');
			menu.append('hr');
			menu.append('menu_max').find('menu_max').html('最大化');
			menu.append('menu_restore').find('menu_restore').html('还原');
			menu.append('hr');
			menu.append('menu_closeleft').find('menu_closeleft').html('关闭左侧');
			menu.append('menu_closeright').find('menu_closeright').html('关闭右侧');
			menu.append('menu_closeall').find('menu_closeall').html('关闭所有');
			menu.append('hr');
			menu.append('menu_close').find('menu_close').html('关闭');
			obj.domenu = menu;
		}
	};
	//tabs的基础事件
	fn._baseEvents = {
		//设置自动执行的方法,用于一些菜单项的定时隐藏
		setinterval: function(obj) {

		},
		//右上角按钮事件
		morebtn: function(obj) {
			obj.dom.find('tabs_more').click(function(e) {
				var node = event.target ? event.target : event.srcElement;
				//获取组件id
				while (!node.classList.contains('tabsbox')) node = node.parentNode;
				var crt = $ctrls.get($dom(node).attr('ctrid'));
				crt.obj.morebox = !crt.obj.morebox;
			});
			//当鼠标滑动到面板上时
			obj.domore.bind('mouseover', function(e) {
				var node = event.target ? event.target : event.srcElement;
				//获取组件id
				while (!node.classList.contains('tabsbox')) node = node.parentNode;
				var crt = $ctrls.get($dom(node).attr('ctrid'));
				crt.obj.morebox = true;
			});
			obj.domore.bind('mouseleave', function(e) {
				var node = event.target ? event.target : event.srcElement;
				//获取组件id
				while (!node.classList.contains('tabsbox')) node = node.parentNode;
				var crt = $ctrls.get($dom(node).attr('ctrid'));
				crt.obj._morebox = false;
				window.setTimeout(function() {
					if (!crt.obj._morebox)
						crt.obj.morebox = false;
				}, 3000);
				//crt.obj.morebox = false;
			});
		},
		//右键菜单事件
		dropmenu: function(obj) {
			obj.domenu.bind('mouseover', function(e) {
				tabs._getObj(e).cntmenu = true;
			});
			obj.domenu.bind('mouseleave', function(e) {
				var obj = tabs._getObj(e);
				obj._cntmenu = false;
				window.setTimeout(function() {
					if (!obj._cntmenu) obj.cntmenu = false;
				}, 500);
			});
			//菜单项的事件
			obj.dom.find('tabs_contextmenu>*').click(function(e) {
				//识别按钮，获取事件动作             
				var node = event.target ? event.target : event.srcElement;
				if (node.tagName.indexOf('_') < 0) return;
				var action = node.tagName.substring(node.tagName.indexOf('_') + 1).toLowerCase();
				//当前tabid
				var obj = tabs._getObj(node);
				var tabid = obj.domenu.attr('tabid');
				
				//刷新
				if (action == 'fresh') {
					var iframe = obj.dombody.find('tabspace[tabid=' + tabid + '] iframe');
					iframe.attr('src',iframe.attr('src'));
				}
				/*
				//当前pagebox.js对象
				var obj = box._getObj(e);
				//最大化
				if (action == 'max')
				    if (!obj.full) obj.full = true;
				//最小化
				if (action == 'min')
				    if (obj.min) obj.mini = true;
				//还原，从最大化还原
				if (action == 'win') obj.full = false;
				//刷新
				if (action == 'fresh') obj.url = obj._url;*/
				obj.cntmenu=false;
			});
		}

	};
	//增加选项卡
	fn.add = function(tab) {
		if (tab == null) return;
		if (tab instanceof Array) {
			for (var i = 0; i < tab.length; i++)
				this.add(tab[i]);
			return;
		}
		//添加tab到控件
		var size = this.childs.length;
		tab.id = 'tab_' + Math.floor(Math.random() * 100000) + '_' + (size + 1);
		if (!tab.index) tab.index = size + 1;
		if (!tab.ico) tab.ico = '&#xa007';
		this.childs.push(tab);
		//添加标签
		var tabtag = this.domtit.append('tab_tag').childs('tab_tag').last();
		tabtag.attr('title', tab.title).attr('tabid', tab.id);
		tabtag.append('ico').find('ico').html(tab.ico);
		tabtag.append('tagtxt').find('tagtxt').html(tab.title);
		tabtag.append('close');
		//添加更多标签区域
		var mtag = this.domore.append('tab_tag').childs('tab_tag').last();
		mtag.append('ico').find('ico').html(tab.ico);
		mtag.attr('tabid', tab.id);
		mtag.append('tagtxt').find('tagtxt').html(tab.title);
		mtag.append('close');
		//添加内容区
		var space = this.dombody.append('tabspace').childs('tabspace').last();
		space.attr('tabid', tab.id);
		var iframe = $dom(document.createElement('iframe'));
		iframe.attr({
			'name': tab.id,
			'id': tab.id,
			'frameborder': 0,
			'border': 0,
			'marginwidth': 0,
			'marginheight': 0,
			'src': tab.url
		});
		iframe.width('100%');
		space.append(iframe);
		if (!!tab.path) {
			var path = space.append('tabpath').find('tabpath');
			path.html('路径：' + tab.path).width('100%').height(30);
			iframe.height('calc(100% - 30px)');
		} else {
			iframe.height('100%');
		}
		this.order();
		for (var t in this._tagBaseEvents) this._tagBaseEvents[t](this, tab.id);
		this.focus(tab.id, false);
		//新增标签的事件
		this.trigger('add', {
			tabid: tab.id,
			title: tab.title
		});
	};
	//标签栏的可视区域,没有用到此代码
	fn._tagVisiblearea = function() {
		var offset = this.dom.offset();
		var tt = $dom('tabs_offset');
		tt.left(offset.left);
		tt.top(offset.top);
		tt.height(this.domtit.height());
		tt.width(this.dom.width() - 30);
		//this.dom.width() - 40
	};
	//标签tag的基础事件
	fn._tagBaseEvents = {
		//标签点击事件
		tagclick: function(obj, tabid) {
			obj.domtit.find('tab_tag[tabid=' + tabid + ']')
				.merge(obj.domore.find('tab_tag[tabid=' + tabid + ']'))
				.click(function(e) {
					var node = event.target ? event.target : event.srcElement;
					//是否移除
					var isremove = node.tagName.toLowerCase() == 'close';
					//获取标签id
					while (node.tagName.toLowerCase() != 'tab_tag') node = node.parentNode;
					var tabid = $dom(node).attr('tabid');
					//获取组件id
					while (!node.classList.contains('tabsbox')) node = node.parentNode;
					var ctrid = $dom(node).attr('ctrid');
					//获取组件对象
					var crt = $ctrls.get(ctrid);
					//是否移除标签
					if (isremove) return crt.obj.remove(tabid, true);
					//切换焦点
					crt.obj.focus(tabid, true);
				});
		},
		//鼠标滚轴事件
		mousewheel: function(obj, tabid) {
			obj.domtit.find('tab_tag[tabid=' + tabid + ']').bind('mousewheel', function(e) {
				e = e || window.event;
				var whell = e.wheelDelta ? e.wheelDelta : e.detail;
				var action = whell > 0 ? "up" : "down"; //上滚或下滚
				//获取组件
				var node = event.target ? event.target : event.srcElement;
				while (node.tagName.toLowerCase() != 'tabs_tagarea') node = node.parentNode;
				var ctrid = $dom(node).parent().attr('ctrid');
				var crt = $ctrls.get(ctrid);
				//当前活动标签
				var tag = crt.obj.domtit.find('.tagcurr');
				if (action == 'up') {
					var next = tag.prev();
					if (next.length < 1) next = crt.obj.domtit.childs().last();
					crt.obj.focus(next, true);
				}
				if (action == 'down') {
					var next = tag.next();
					if (next.length < 1) next = crt.obj.domtit.childs().first();
					crt.obj.focus(next, true);
				}
			});
		},
		//右键菜单
		contextmenu: function(obj, tabid) {
			obj.domtit.find('tab_tag[tabid=' + tabid + ']').bind('contextmenu', function(e) {
				var node = event.target ? event.target : event.srcElement;
				while (node.tagName.toLowerCase() != "tab_tag") node = node.parentNode;
				//当前标签id
				var tabid = $dom(node).attr('tabid');
				//当前tabs对象
				var obj = tabs._getObj(node);
				var off = obj.dom.offset();
				var mouse = $dom.mouse(e);
				obj.cntmenu = true;
				obj.domenu.left(mouse.x - off.left - 5).top(mouse.y - off.top - 5);
				obj.domenu.attr('tabid', tabid);
				event.preventDefault();
				return false;
			});
		}
	};
	//排序
	fn.order = function() {
		var tags = this.domtit.childs();
		tags.each(function(index) {
			$dom(this).level(tags.length - index).attr('index', index);
		});
	};
	//设置某一个标签为焦点
	//istrigger:是否触发事件
	fn.focus = function(tabid, istrigger) {
		if (tabid == null || !tabid.length || tabid.length < 1) return false;
		var tag = $dom.isdom(tabid) ? tabid : this.domtit.find('tab_tag[tabid=' + tabid + ']');
		//当前处于焦点的标签
		var tagcurr = this.domtit.find('.tagcurr');
		if (tagcurr.length > 0 && tag.attr('tabid') == tagcurr.attr('tabid')) return false;
		//
		//去除所有的焦点
		tagcurr.removeClass('tagcurr');
		this.dombody.childs().hide();
		this.order();
		//设置当前标签为焦点
		tag.addClass('tagcurr');
		tag.level(this.domtit.childs().level() + 1);
		this.dombody.find('tabspace[tabid=' + tag.attr('tabid') + ']').show();
		//触发事件
		if (istrigger) this.trigger('change', {
			tabid: tag.attr('tabid'),
			title: tag.text()
		});
		//
		//计算标签区域的可视区域，左侧坐标与宽度
		var visiLeft = this.dom.offset().left;
		var visiWidth = this.domtit.parent().width() - 30;
		var area = this.domtit.parent();
		///*
		//向左滚动
		var tagleft = (Number(tag.attr('index')) + 1) * 125;
		if (tagleft - visiLeft > visiWidth)
			area[0].scrollLeft = tagleft - visiLeft - visiWidth;
		//向右滚动
		tagleft = Number(tag.attr('index')) * tag.width();
		if (tagleft - visiLeft <= 0)
			area[0].scrollLeft = tagleft - visiLeft;
		return true;
	};
	//移除某个选项卡
	//istrigger：是否触发事件
	fn.remove = function(tabid, istrigger) {
		var tittag = this.domtit.find('tab_tag[tabid=' + tabid + ']');
		var title = tittag.text();
		//设置关闭后的焦点选项卡
		var next = tittag.next();
		if (next.length < 1) next = tittag.prev();
		//移除
		tittag.remove();
		this.dombody.find('tabspace[tabid=' + tabid + ']').remove();
		this.domore.find('tab_tag[tabid=' + tabid + ']').remove();
		//设置关闭后的焦点选项卡	
		if (istrigger) {
			this.trigger('shut', {
				tabid: tabid,
				title: title
			});
		}
		return this.focus(next, true);
	};
	/*** 
    以下是静态方法
    *****/
	tabs.create = function(param) {
		if (param == null) param = {};
		var tobj = new tabs(param);
		//pbox._initialization();
		return tobj;
	};
	//用于事件中，取点击的对象
	tabs._getObj = function(e) {
		var node = event.target ? event.target : event.srcElement;
		while (!node.classList.contains('tabsbox')) node = node.parentNode;
		var ctrl = $ctrls.get(node.getAttribute('ctrid'));
		return ctrl.obj;
	};
	//一些基础事件
	tabs._baseEvents = function() {

	};
	win.$tabs = tabs;
	win.$tabs._baseEvents();
})(window);