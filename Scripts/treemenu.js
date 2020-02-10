(function(win) {
	var treemenu = function(param) {
		if (param == null || typeof(param) != 'object') param = {};
		this.attrs = {
			target: '', //所在Html区域			
			width: 100,
			height: 200,
			id: '',
			fold: false //是否折叠
		};
		for (var t in param) this.attrs[t] = param[t];
		eval($ctrl.attr_generate(this.attrs));
		/* 自定义事件 */
		//fold,折叠或展开;add，增加菜单项; change，切换根菜单,click点击菜单项
		eval($ctrl.event_generate(['fold', 'add', 'change', 'resize', 'click']));

		this.datas = new Array(); //子级		
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
				obj.dombody.width(val - 40);
				obj.trigger('resize', {
					width: val,
					height: obj._height
				});
			}
		},
		'height': function(obj, val, old) {
			if (obj.dom) {
				obj.dom.height(val);
				obj.domtit.height(val);
				obj.dombody.height(val);
				obj.trigger('resize', {
					width: obj._width,
					height: val
				});
			}
		},
		//折叠与展开
		'fold': function(obj, val, old) {
			obj.domtit.find('tree-foldbtn').attr('class', obj.fold ? 'fold' : '');
			obj.dom.css('transition', 'width 0.3s,height 0.3s,left 0.3s,top 0.3s,opacity 0.3s');
			if (val) {
				obj.dom.width(40);
				obj.dombody.css('position', 'absolute').hide();
				var offset = obj.dom.offset();				
				obj.dombody.left(offset.left + 40);
			} else {
				obj.dom.width(obj.width);
				obj.dombody.css('position', 'relative').show();
				obj.dombody.left(0);
			}
			//折叠事件
			obj.trigger('fold', {
				action: val ? 'fold' : 'open'
			});
		}
	};
	//生成实始的构造
	fn._generate = function() {
		for (var t in this._builder) this._builder[t](this);
		for (var t in this._baseEvents) this._baseEvents[t](this);
	};
	//生成结构
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
			obj.domtit = obj.dom.add('tree_tags');
			obj.domtit.add('tree-foldbtn');
		},
		//右侧内容区
		body: function(obj) {
			obj.dombody = obj.dom.add('tree_body');
		}
	};
	//基础事件
	fn._baseEvents = {
		//树形菜单的收缩与展开
		fold: function(obj) {
			//左下角折叠按钮的事件
			obj.domtit.find('tree-foldbtn').click(function(e) {
				var node = event.target ? event.target : event.srcElement;
				while (!$dom(node).hasClass('treemenu')) node = node.parentNode;
				var crt = $ctrls.get($dom(node).attr('ctrid'));
				crt.obj.fold = !crt.obj.fold;
			});
			//当折叠时，鼠标滑过左侧标签后显示主体菜单，过几秒后自动消失
			obj.dombody.bind('mouseleave', function(e) {
				var node = event.target ? event.target : event.srcElement;
				while (!$dom(node).hasClass('treemenu')) node = node.parentNode;
				var crt = $ctrls.get($dom(node).attr('ctrid'));
				if (!crt.obj.fold) return;
				window.setTimeout(function() {
					if (crt.obj.fold) crt.obj.dombody.hide();
				}, 3000);
			});
		},

	};
	//添加菜单项
	fn.add = function(item) {
		if (item == null) return;
		if (item instanceof Array) {
			for (var i = 0; i < item.length; i++)
				this.add(item[i]);
			return;
		}
		var size = this.datas.length;
		item.id = 'tree_' + Math.floor(Math.random() * 100000) + '_' + (size + 1);
		if (!item.index) item.index = size + 1;
		if (!item.ico || item.ico == '') item.ico = '&#xa009';
		if (!item.tit || item.tit == '') item.tit = item.title;
		this.datas.push(item);
		//左侧选项卡
		var tabtag = this.domtit.add('tree_tag');
		tabtag.attr('item', item.title).attr('treeid', item.id);
		tabtag.add('ico').html(item.ico);
		tabtag.add('itemtxt').html(item.title);
		//添加左侧标签事件
		for (var t in this._tagBaseEvents) this._tagBaseEvents[t](this, tabtag);
		//设置第一个为打开
		this.switch(this.domtit.childs('tree_tag').first());

		//右侧树形菜单区
		var area = this.dombody.add('tree_area');
		area.attr('treeid', item.id);
		//右侧菜单的大标题
		area.add('tree_tit').html(item.title);
		item = this._calcLevel(item, 0);
		for (var i = 0; i < item.childs.length; i++) {
			this._addchild(area, item.childs[i]);
		}
	};
	//添加树形的子级节点
	fn._addchild = function(area, item) {
		var box = area.add('tree_box');
		box.attr('treeid', item.id);
		this._createNode(item, box);
		if (item.childs && item.childs.length > 0) {
			for (var i = 0; i < item.childs.length; i++) {
				this._addchild(box, item.childs[i]);
			}
		}
	};
	//创建树形节点
	fn._createNode = function(item, box) {
		var node = box.add('tree-node');
		node.css('padding-left', (item.level * 20) + 'px');
		if (item.intro) node.attr('title', item.intro);
		//node.add('tree-ico').html(item.ico ? item.ico : '&#xa003');

		var span = node.add('span');
		span.attr('ico', item.ico ? item.ico : '\ua015');
		//字体样式
		if (item.font) {
			if (item.font.color) span.css('color', item.font.color);
			if (item.font.bold) span.css('font-weight', item.font.bold ? 'bold' : 'normal');
			if (item.font.italic) span.css('font-style', item.font.italic ? 'italic' : 'normal');
		}
		span.html(item.title);
		//如果有下级节点
		if (item.childs && item.childs.length > 0) {
			node.addClass('folder').click(function(e) {
				var n = event.target ? event.target : event.srcElement;
				if (n.tagName == 'SPAN') return;
				while (n.tagName.toLowerCase() != 'tree-node') n = n.parentNode;
				var tnode = $dom(n);
				if (tnode.hasClass('folder')) {
					tnode.attr('class', 'folderclose');
					tnode.parent().find('tree_box').hide();
				} else {
					tnode.attr('class', 'folder');
					tnode.parent().find('tree_box').show();
				}
			});
		}
		//节点点击事件
		span.click(function(e) {
			var n = event.target ? event.target : event.srcElement;
			while (n.tagName.toLowerCase() != 'tree_box') n = n.parentNode;
			//节点id
			var treeid = $dom(n).attr('treeid');
			//对象
			var tree = n;
			while (!$dom(tree).hasClass('treemenu')) tree = tree.parentNode;
			var crt = $ctrls.get($dom(tree).attr('ctrid'));
			var datanode = crt.obj.getData(treeid); //数据源节点
			crt.obj.trigger('click', {
				treeid: treeid,
				data: datanode
			});
		});
		return node;
	};
	//计算层深
	fn._calcLevel = function(item, level) {
		//补全一些信息
		if (!item.id || item.id < 0) item.id = Math.floor(Math.random() * 100000);
		if (!item.pid || item.pid < 0) item.pid = 0;
		if (!item.level || item.level <= 0) item.level = level;
		//计算层深
		if (item.childs && item.childs.length > 0) {
			for (var i = 0; i < item.childs.length; i++) {
				item.childs[i].pid = item.id;
				item.childs[i] = this._calcLevel(item.childs[i], level + 1);
			}
		}
		return item;
	};
	//获取数据源的节点
	fn.getData = function(treeid) {
		if (this.datas.length < 1) return null;
		return getdata(treeid, this.datas);
		//
		function getdata(treeid, datas) {
			var d = null;
			for (var i = 0; i < datas.length; i++) {
				if (datas[i].id == treeid) return datas[i];
				if (datas[i].childs && datas[i].childs.length > 0)
					d = getdata(treeid, datas[i].childs);
			}
			return d;
		}
	};
	//左侧标签tag的基础事件
	fn._tagBaseEvents = {
		//左侧标签点击事件
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
			tab.bind('mouseover', function(e) {
				var node = event.target ? event.target : event.srcElement;
				//获取标签id
				while (node.tagName.toLowerCase() != 'tree_tag') node = node.parentNode;
				var tag = $dom(node);
				while (!$dom(node).hasClass('treemenu')) node = node.parentNode;
				var crt = $ctrls.get($dom(node).attr('ctrid'));
				if (!crt.obj.fold) return;
				crt.obj.dombody.show();
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
	/*
	treemenu的静态方法
	*/
	treemenu.create = function(param) {
		if (param == null) param = {};
		var tobj = new treemenu(param);
		return tobj;
	};
	win.$treemenu = treemenu;
})(window);