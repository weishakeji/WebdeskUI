(function(win) {
	var tabs = function(param) {
		if (param == null || typeof(param) != 'object') param = {};
		this.attrs = {
			target: '', //所在Html区域
			size: 0, //选项卡个数
			maximum: 100, //最多能有多少个选项卡
			width: 100,
			height: 200,
			id: '',
			morebox: false, //更多标签的面板是否显示
			cntmenu: false //右键菜单是否显示
		};
		for (var t in param) this.attrs[t] = param[t];
		eval($ctrl.attr_generate(this.attrs));
		/* 自定义事件 */
		eval($ctrl.event_generate(['shut', 'add', 'change']));
		//以下不支持双向绑定
		this.childs = new Array(); //子级		
		this.dom = null; //控件的html对象
		this.domtit = null; //控件标签栏部分的html对象
		this.dombody = null; //控件内容区
		this.domenu = null; //控件右键菜单的html对象
		this.domore = null; //控件右侧更多标签的区域名		

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
			var tagarea = obj.dom.add('tabs_tagarea');
			var tagsbox = tagarea.add('tabs_tagbox');
			obj.domtit = tagsbox;
			//右上角的更多按钮
			obj.dom.append('tabs_more');
		},
		body: function(obj) {
			obj.dombody = obj.dom.add('tabs_body');
		},
		//右侧，更多标签的区域
		morebox: function(obj) {
			obj.domore = obj.dom.add('tabs_morebox');
		},
		//右键菜单
		contextmenu: function(obj) {
			var menu = obj.dom.add('tabs_contextmenu');
			menu.add('menu_fresh').html('刷新');
			//menu.add('menu_freshtime').attr('num', 10).html('定时刷新(10秒)');
			menu.add('hr');
			menu.add('menu_full').html('最大化');
			menu.add('menu_restore').html('还原').addClass('disable');

			menu.add('hr');
			menu.add('menu_closeleft').html('关闭左侧');
			menu.add('menu_closeright').html('关闭右侧');
			menu.add('menu_closeall').html('关闭所有');
			menu.add('hr');
			menu.add('menu_close').html('关闭');
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
				//当前tabid和索引号
				var obj = tabs._getObj(node);
				var tabid = obj.domenu.attr('tabid');
				var index = Number(obj.domenu.attr('index'));
				//刷新
				if (action == 'fresh') {
					var iframe = obj.dombody.find('tabspace[tabid=' + tabid + '] iframe');
					iframe.attr('src', iframe.attr('src'));
				}
				//关闭
				if (action.indexOf('close') > -1) {
					var tabids = new Array();
					if (action == 'close') tabids.push(tabid, true);
					if (action == 'closeall') {
						for (var i = 0; i < obj.childs.length; i++) tabids.push(obj.childs[i].id);
					}
					if (action == 'closeright') {
						for (var i = obj.childs.length - 1; i > index; i--) tabids.push(obj.childs[i].id);
					}
					if (action == 'closeleft') {
						for (var i = 0; i < index; i++) tabids.push(obj.childs[i].id);
					}
					obj.remove(tabids, true);
				}
				//最大化
				if (action == 'full') {
					obj.focus(tabid);
					tabs.full(obj, tabid);
				}
				//还原
				if (action == 'restore') {

				}
				obj.cntmenu = false;
			});
		}

	};
	//增加选项卡
	fn.add = function(tab) {
		if (tab == null) return;
		if (tab instanceof Array) {
			for (var i = 0; i < tab.length; i++)
				this.add(tab[i]);
			return this;
		}
		//添加tab到控件	
		var size = this.childs.length;
		tab.id = 'tab_' + Math.floor(Math.random() * 100000) + '_' + (size + 1);
		if (!tab.index) tab.index = size + 1;
		if (!tab.ico) tab.ico = '&#xa007';
		this.childs.push(tab);
		//添加标签
		var tabtag = this.domtit.add('tab_tag');
		tabtag.attr('title', tab.title).attr('tabid', tab.id);
		tabtag.add('ico').html(tab.ico);
		tabtag.add('tagtxt').html(tab.title);
		tabtag.add('close');
		//添加更多标签区域
		var mtag = this.domore.add('tab_tag');
		mtag.add('ico').html(tab.ico);
		mtag.attr('tabid', tab.id);
		mtag.add('tagtxt').html(tab.title);
		mtag.add('close');
		//添加内容区
		var space = this.dombody.add('tabpace');
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
		if (!!tab.path) {
			var path = space.add('tabpath');
			path.html('路径：' + tab.path).width('100%').height(30);
			iframe.height('calc(100% - 30px)');
		} else {
			iframe.height('100%');
		}
		space.append(iframe[0]);
		this.order();
		for (var t in this._tagBaseEvents) this._tagBaseEvents[t](this, tab.id);
		this.focus(tab.id, false);
		//新增标签的事件
		this.trigger('add', {
			tabid: tab.id,
			title: tab.title
		});
		return this;
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
				//当前标签id和索引号，用于关闭右侧或左侧时使用
				var tabid = $dom(node).attr('tabid');
				var index = $dom(node).attr('index');
				//当前tabs对象
				var obj = tabs._getObj(node);
				var off = obj.dom.offset();
				var mouse = $dom.mouse(e);
				obj.cntmenu = true;
				obj.domenu.left(mouse.x - off.left - 5).top(mouse.y - off.top - 5);
				obj.domenu.attr('tabid', tabid).attr('index', index);
				event.preventDefault();
				return false;
			});
		}
	};
	//排序
	fn.order = function() {
		var th = this;
		var tags = this.domtit.childs();
		th.domtit.childs().each(function(index) {
			//设置索引
			$dom(this).level(tags.length - index).attr('index', index);
			var tabid = $dom(this).attr('tabid');
			//索引号同步到tab对象上
			for (var i = 0; i < th.childs.length; i++) {
				if (th.childs[i].id == tabid) th.childs[i].index = index;
			}
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
		this.dombody.find('tabpace[tabid=' + tag.attr('tabid') + ']').show();
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
		if (tabid instanceof Array) {
			var titles = new Array();
			for (var i = 0; i < tabid.length; i++) {
				for (var j = 0; j < this.childs.length; j++) {
					if (this.childs[j].id == tabid[i]) titles.push(this.childs[j].title)
				}
				this.remove(tabid[i], false);
			}
			this.trigger('shut', {
				tabid: tabid,
				title: titles
			});
			return this;
		}
		var tittag = this.domtit.find('tab_tag[tabid=' + tabid + ']');
		var title = tittag.text();
		//设置关闭后的焦点选项卡
		if (tittag.hasClass('tagcurr')) {
			var next = tittag.next();
			if (next.length < 1) next = tittag.prev();
			this.focus(next, true);
		}
		//移除
		tittag.remove();
		this.dombody.find('tabpace[tabid=' + tabid + ']').remove();
		this.domore.find('tab_tag[tabid=' + tabid + ']').remove();
		//触发事件
		if (istrigger) {
			this.trigger('shut', {
				tabid: tabid,
				title: title
			});
		}
		return this;
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
	//最大化内容区域
	tabs.full = function(obj, tabid) {
		var fbox = $dom('tabs_fullbox');
		if (fbox.length < 1) fbox = $dom(document.body).add('tabs_fullbox');
		//当前内容区，放到全屏fullbox中
		var tabpace = obj.dombody.find('tabpace[tabid=' + tabid + ']');
		fbox.append(tabpace.find('iframe')).attr({
			crtid: obj.id,
			tabid: tabid
		});
		//设置fullbox的初始位置
		var offset = tabpace.offset();
		fbox.left(offset.left).top(offset.top);
		fbox.width(tabpace.width()).height(tabpace.height()).show();
		fbox.css('transition', 'width 0.3s,height 0.3s,left 0.3s,top 0.3s,opacity 0.3s');
		window.setTimeout(function() {
			fbox.left(0).top(0);
			fbox.width('100%').height('100%');
		}, 300);
		//添加返回按钮
		var close = fbox.add('tabs_fullbox_back');
		close.click(function(e) {
			var fbox = $dom('tabs_fullbox');
			var crt = $ctrls.get(fbox.attr('crtid'));
			var tbody = crt.obj.dombody.find('tabpace[tabid=' + tabid + ']');
			tbody.append(fbox.find('iframe'));
			//
			var tabpace = obj.dombody.find('tabpace[tabid=' + tabid + '] iframe');
			var offset = tabpace.offset();
			fbox.left(offset.left).top(offset.top);
			fbox.width(tabpace.width()).height(tabpace.height());
			window.setTimeout(function() {
				$dom('tabs_fullbox').remove();
			}, 300);

		});
		///var iframe = obj.dombody.find('tabspace[tabid=' + tabid + ']');
		///iframe.level(99999);
	}
	win.$tabs = tabs;
	win.$tabs._baseEvents();
})(window);