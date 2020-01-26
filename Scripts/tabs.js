(function(win) {
	var tabs = function(param) {
		if (param == null || typeof(param) != 'object') param = {};
		var defaultAttr = {
			target: '', //所在Html区域
			size: 0, //选项卡个数
			maximum: 100, //最多能有多少个选项卡
			width: 100,
			height: 200,
			id: ''
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
		}
	};
	fn._open = function() {
		this._initialization();
		//创建控件html对象
		for (var t in this._builder) this._builder[t](this);
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
		morebox: function(obj) {
			//var more = obj.dom.append('tabs_morebox').find('tabs_morebox');
			//obj.domore = more;
		}
	};
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
		if (!tab.ico) tab.ico = '&#xe72f';
		this.childs.push(tab);
		//添加标签
		var tabtag = this.domtit.append('tab_tag').childs('tab_tag').last();
		tabtag.attr('title', tab.title).attr('tabid', tab.id);
		tabtag.append('ico').find('ico').html(tab.ico);
		tabtag.append('tagtxt').find('tagtxt').html(tab.title);
		tabtag.append('close');
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
		this._tagClick(tab.id);
		this._mousewheel(tab.id);
		this.focus(tab.id, false);
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
		var tag = $dom.isdom(tabid) ? tabid : this.domtit.find('tab_tag[tabid=' + tabid + ']');
		//当前处于焦点的标签
		var tagcurr = this.domtit.find('.tagcurr');
		if (tagcurr.length > 0 && tag.attr('tabid') == tagcurr.attr('tabid')) return;
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
		var visiWidth = this.domtit.parent().width();
		//
		var tagleft = tag.offset().left;
		if (tagleft - visiLeft > visiWidth) {
			var scroll = tagleft - visiLeft - visiWidth;
			console.log(scroll);
			var area=this.domtit.parent();
			//area[0].scrollLeft = scroll+120;
			//this.domtit.css('margin-left',(-scroll)+'px');
			//this.domtit.css('scrollLeft',scroll+'px');
		}
		/*
		this.domtit.childs().each(function() {
			var left = $dom(this).offset().left;
			$dom(this).find('tagtxt').html(left-visiLeft);
		});
		//var offset = this.dom.offset();
		var offset = tag.offset(false);
		console.log('当前标签的坐标: x_' + offset.left + ", y_" + offset.top);
		*/
	};
	//标签栏的可视区域
	fn._tagVisiblearea = function() {
		var offset = this.dom.offset();
		var tt = $dom('tabs_offset');
		tt.left(offset.left);
		tt.top(offset.top);
		tt.height(this.domtit.height());
		tt.width(this.dom.width() - 30);
		//this.dom.width() - 40
	};
	//设置标签的点击事件
	fn._tagClick = function(tabid) {
		this.domtit.find('tab_tag[tabid=' + tabid + ']').click(function(e) {
			var node = event.target ? event.target : event.srcElement;
			//是否移除
			var isremove = node.tagName.toLowerCase() == 'close';
			//获取标签id
			while (node.tagName.toLowerCase() != 'tab_tag') node = node.parentNode;
			var tabid = $dom(node).attr('tabid');
			//获取组件id
			while (node.tagName.toLowerCase() != 'tabs_tagarea') node = node.parentNode;
			var ctrid = $dom(node).parent().attr('ctrid');
			//获取组件对象
			var crt = $ctrls.get(ctrid);
			//
			//是否移除标签
			if (isremove) {
				crt.obj.remove(tabid);
				return;
			}
			//切换焦点
			crt.obj.focus(tabid, true);
		});
	};
	//设置标签的鼠标滚轴事件
	fn._mousewheel = function(tabid) {
		this.domtit.find('tab_tag[tabid=' + tabid + ']').bind('mousewheel', function(e) {
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
	};
	//移除某个选项卡
	fn.remove = function(tabid) {
		var tittag = this.domtit.find('tab_tag[tabid=' + tabid + ']');
		var title = tittag.text();
		//设置关闭后的焦点选项卡
		var next = tittag.next();
		if (next.length < 1) next = tittag.prev();
		//移除
		tittag.remove();
		this.dombody.find('tabspace[tabid=' + tabid + ']').remove();
		//设置关闭后的焦点选项卡		
		this.trigger('shut', {
			tabid: tabid,
			title: title
		});
		this.focus(next, true);
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
	//关闭某个选项卡
	tabs.remove = function(tagid) {
		console.log(tagid);
	};
	win.$tabs = tabs;

})(window);