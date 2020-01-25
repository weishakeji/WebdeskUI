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
		for (var t in defaultAttr) {
			this['_' + t] = defaultAttr[t];
			var str = 'Object.defineProperty(this, t, {\
                        get: function() {return this._' + t + ';},\
                        set: function(newValue) {\
                            var old = this._' + t + ';\
                            this._' + t + '= newValue;\
                            for (var wat in this._watch) {\
                                if (\'' + t + '\' == wat) {\
                                    this._watch[wat](this,newValue,old);\
                                }\
                            }\
                            for (var i=0;i<this._watchlist.length;i++) {\
                                if (\'' + t + '\' == this._watchlist[i].key) {\
                                    this._watchlist[i].func(this,newValue,old);\
                                }\
                            }\
                        }\
                    });';
			eval(str);
		}
		this.childs = new Array(); //子级
		//this.pageboxs=new Array();	//当前
		this.dom = null; //html对象
		this._watchlist = new Array(); //自定义监听  
		/* 自定义事件 */
		var customEvents = ['shown', 'shut', 'shutall', 'shutright', , 'shutleft'];

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
			var title = obj.dom.append('tabs_tagarea').find('tabs_tagarea');
			obj.domtit = title;
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
		if (tab instanceof Array) {
			for (var i = 0; i < tab.length; i++)
				this.add(tab[i]);
			return;
		}
		//添加tab到控件
		var size = this.childs.length;
		if (!tab.id) tab.id = 'tab_' + Math.floor(Math.random() * 100000) + '_' + (size + 1);
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
		this.focus(tab.id);
	};
	//排序
	fn.order = function() {
		var tags = this.domtit.childs();
		tags.each(function(index) {
			$dom(this).level(tags.length - index);
		});
	};
	//设置某一个
	fn.focus = function(tabid) {
		//去除所有的焦点
		this.domtit.childs().removeClass('tagcurr');
		this.dombody.childs().hide();
		this.order();
		//设置当前标签为焦点
		var tag = this.domtit.find('tab_tag[tabid=' + tabid + ']');
		tag.addClass('tagcurr');
		tag.level(this.domtit.childs().level() + 1);
		this.dombody.find('tabspace[tabid=' + tabid + ']').show();
		console.log('焦点：' + tag.text());
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
			crt.obj.focus(tabid);			
		});
	};
	//移除某个选项卡
	fn.remove = function(tabid) {
console.log('要移除的标签：'+tabid);
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