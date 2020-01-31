(function(win) {
	var treemenu = function(param) {
		if (param == null || typeof(param) != 'object') param = {};
		var defaultAttr = {
			target: '', //所在Html区域			
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
		this.dom = null; //控件的html对象
		this.domtit = null; //控件标签栏部分的html对象
		this.dombody = null; //控件内容区
		//this._eventlist = new Array(); //自定义的事件集合     
		//this._watchlist = new Array(); //自定义监听  
		/* 自定义事件 */
		//shut,菜单条合起来;pull，菜单区域打开；add，增加菜单项; change，切换根菜单
		var customEvents = ['shut', 'pull', 'add', 'change', 'resize'];
		eval($ctrl.event_generate(customEvents));
		
		this._generate();
		this.width = this._width;
		this.height = this._height;
		//
		$ctrls.add({
			id: this.id,
			obj: this,
			dom: this.dom,
			type: 'treemenu'
		});
	};
	var fn = treemenu.prototype;
	//当属性更改时触发相应动作
	fn._watch = {
		'width': function(obj, val, old) {
			if (obj.dom) {
				obj.dom.width(val);
				obj.trigger('resize', {
					width: val,
					height: obj._height
				});
			}
		},
		'height': function(obj, val, old) {
			if (obj.dom) {
				obj.dom.height(val);
				obj.trigger('resize', {
					width: obj._width,
					height: val
				});
			}
		}
	};
	//生成实始的构造
	fn._generate = function() {
		for (var t in this._builder) this._builder[t](this);
	};
	fn._builder = {
		shell: function(obj) {
			var area = $dom(obj.target);
			if (area.length < 1) {
				console.log('treemenu所在区域不存在');
				return;
			}
			area.addClass('treemenu').attr('ctrid', obj.id);
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
		}
	};
	/*treemenu的静态方法*/
	treemenu.create = function(param) {
		if (param == null) param = {};
		var tobj = new treemenu(param);
		return tobj;
	};
	win.$treemenu = treemenu;
})(window);