(function(win) {
	var treemenu = function(param) {
		if (param == null || typeof(param) != 'object') param = {};
		this.attrs = {
			target: '', //所在Html区域			
			width: 100,
			height: 200,
			id: ''
		};
		for (var t in param) this.attrs[t] = param[t];
		eval($ctrl.attr_generate(this.attrs));
		/* 自定义事件 */
		//shut,菜单条合起来;pull，菜单区域打开；add，增加菜单项; change，切换根菜单
		eval($ctrl.event_generate(['shut', 'pull', 'add', 'change', 'resize']));

		this.childs = new Array(); //子级		
		this.dom = null; //控件的html对象
		this.domtit = null; //控件标签栏部分的html对象
		this.dombody = null; //控件内容区
		//初始化并生成控件
		this._initialization();
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
	fn._initialization = function() {
		this._id = 'tabs_' + new Date().getTime();
	};
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
		//左侧标题区
		title: function(obj) {
			var tagarea = obj.dom.append('tree_tags').find('tree_tags');
			obj.domtit = tagarea;
		},
		//右侧内容区
		body: function(obj) {
			var body = obj.dom.append('tree_body').find('tree_body');
			obj.dombody = body;
		}
	};
	//添加菜单项
	fn.add = function(item) {
		if (item == null) return;
		if (item instanceof Array) {
			for (var i = 0; i < item.length; i++)
				this.add(item[i]);
			return;
		}
		var size = this.childs.length;
		item.id = 'tree_' + Math.floor(Math.random() * 100000) + '_' + (size + 1);
		if (!item.index) item.index = size + 1;
		if (!item.ico || item.ico == '') item.ico = '&#xa009';
		if (!item.tit || item.tit == '') item.tit = item.title;
		this.childs.push(item);
		//左侧选项卡
		var tabtag = this.domtit.append('tree_tag').childs('tree_tag').last();
		tabtag.attr('item', item.title).attr('treeid', item.id);
		tabtag.append('ico').find('ico').html(item.ico);
		tabtag.append('itemtxt').find('itemtxt').html(item.title);
		//右侧树形菜单区
		var area = this.dombody.append('tree_area').childs('tree_area').last();
		area.attr('treeid', item.id);
		area.append('tree_tit').find('tree_tit').html(item.title);
		//添加左侧标签事件
		for (var t in this._tagBaseEvents) this._tagBaseEvents[t](this, tabtag);
		//设置第一个为打开
		this.switch(this.domtit.childs().first());

	};
	fn._addchild = function(item) {

	};
	//计算层深
	fn.calcLevel = function(item) {

	};
	//标签tag的基础事件
	fn._tagBaseEvents = {
		//标签点击事件
		tagclick: function(obj, tab) {
			tab.click(function(e) {
				var node = event.target ? event.target : event.srcElement;
				//获取标签id
				while (node.tagName.toLowerCase() != 'tree_tag') node = node.parentNode;
				var tag = $dom(node);
				//获取组件id
				while (!node.classList.contains('treemenu')) node = node.parentNode;
				var ctrid = $dom(node).attr('ctrid');
				//获取组件对象
				var crt = $ctrls.get(ctrid);
				//切换选项卡
				crt.obj.switch(tag);
			});
		}
	};
	//切换选项卡
	fn.switch = function(tag) {
		this.domtit.find('tree_tag').removeClass('curr');
		tag.addClass('curr');
		this.dombody.childs().hide();
		this.dombody.find('tree_area[treeid=' + tag.attr('treeid') + ']').show();
	}
	/*treemenu的静态方法*/
	treemenu.create = function(param) {
		if (param == null) param = {};
		var tobj = new treemenu(param);
		return tobj;
	};
	win.$treemenu = treemenu;
})(window);