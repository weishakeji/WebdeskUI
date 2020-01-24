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
		this.dom = null; //html对象
		this._watchlist = new Array(); //自定义监听  
		/* 自定义事件 */
		var customEvents = ['shown', 'shut', 'shutall', 'shutright', , 'shutleft'];
		//
		$ctrls.add({
			id: this.id,
			obj: this,
			type: 'tabs'
		});
		this._open();
		this.width = this._width;
		this.height = this._height;
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
			area.addClass('tabsbox');
			obj.dom = area;
		},
		title: function(obj) {
			var title = obj.dom.append('tabs_titlebar').find('tabs_titlebar');
			obj.domtit = title;
			//右上角的更多按钮
			obj.dom.append('tabs_more');
		},
		body: function(obj) {
			var body = obj.dom.append('tabs_body').find('tabs_body');
			obj.dombody = body;
		},
		morebox: function(obj) {
			var more = obj.dom.append('tabs_morebox').find('tabs_morebox');
			obj.domore = more;
		}
	};
	fn.add = function(tab) {
		var t = {
			title: '标题',
			path: '路径',
			url: '',
			id: 0
		}
	}
	/*** 
    以下是静态方法
    *****/
	tabs.create = function(param) {
		if (param == null) param = {};
		var tobj = new tabs(param);
		//pbox._initialization();
		return tobj;
	};

	win.$tabs = tabs;
})(window);