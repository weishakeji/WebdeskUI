/*!
 * 主 题：下拉菜单
 * 说 明：
 * 1、支持无限级菜单分类;
 * 2、可自定义节点样式，例如：粗体、斜体、颜色;
 * 3、节点事件可定义
 *
 * 作 者：微厦科技_宋雷鸣_10522779@qq.com
 * 开发时间: 2020年2月14日
 * 最后修订：2020年2月28日
 * github开源地址:https://github.com/weishakeji/WebdeskUI
 */
(function(win) {
	var dropmenu = function(param) {
		if (param == null || typeof(param) != 'object') param = {};
		this.attrs = {
			target: '', //所在Html区域			
			width: 100,
			height: 30,
			id: '',
			bind: true //是否实时数据绑定
		};
		for (var t in param) this.attrs[t] = param[t];
		eval($ctrl.attr_generate(this.attrs));
		/* 自定义事件 */
		//data:数据项源变动时;click:点击菜单项
		eval($ctrl.event_generate(['data', 'click']));

		this.datas = new Array(); //数据源
		this._datas = ''; //数据源的序列化字符串
		this.dom = null; //控件的html对象
		this.domtit = null; //控件标签栏部分的html对象
		this.dombody = null; //控件内容区
		//初始化并生成控件
		this._initialization();
		this.bind = this._bind;
		//
		$ctrls.add({
			id: this.id,
			obj: this,
			dom: this.dom,
			type: 'dropmenu'
		});
	};
	var fn = dropmenu.prototype;
	fn._initialization = function() {
		if (!this._id) this._id = 'tabs_' + new Date().getTime();
	};
	//添加数据源
	fn.add = function(item) {
		if (item instanceof Array) {
			for (var i = 0; i < item.length; i++)
				this.add(item[i]);
		} else {
			this.datas.push(item);
		}
	};
	//当属性更改时触发相应动作
	fn._watch = {
		'width': function(obj, val, old) {
			if (obj.dom) {
				var root = obj.domtit.find('drop-node');
				if (root.length > 0) {
					var padding = parseInt(root.get(0).css('padding-right'));
					obj.domtit.find('drop-node').width(val - padding);
					if (obj.datas) obj.dom.width(obj.datas.length * val);
				}
				obj.dombody.find('drop-panel.level1').width(val > 200 ? val : 200);
			};
		},
		'height': function(obj, val, old) {
			if (obj.dom) obj.dom.height(val);
		},
		//是否启动实时数据绑定
		'bind': function(obj, val, old) {
			if (val) {
				obj._setinterval = window.setInterval(function() {
					var str = JSON.stringify(obj.datas);
					if (str != obj._datas) {
						obj._restructure();
						obj._datas = str;
						obj.trigger('data', {
							data: obj.datas
						});
					}
				}, 10);
			} else {
				window.clearInterval(obj._setinterval);
			}
		}
	};
	//重构
	fn._restructure = function() {
		var area = $dom(this.target);
		if (area.length < 1) {
			console.log('dropmenu所在区域不存在');
		} else {
			area.html(''); //清空原html节点
			$dom('drop-body[ctrid=\'' + this.id + '\']').remove();
			//计算数据源的层深等信息
			for (var i = 0; i < this.datas.length; i++)
				this.datas[i] = this._calcLevel(this.datas[i], 1);
			//生成Html结构和事件
			for (var t in this._builder) this._builder[t](this);
			for (var t in this._baseEvents) this._baseEvents[t](this);
			this.width = this._width;
			this.height = this._height;
		}
	};
	//生成结构
	fn._builder = {
		shell: function(obj) {
			var area = $dom(obj.target);
			if (area.length < 1) {
				console.log('dropmenu所在区域不存在');
				return;
			}
			area.addClass('dropmenu').attr('ctrid', obj.id);
			obj.dom = area;
		},
		//主菜单栏
		title: function(obj) {
			obj.domtit = obj.dom.add('drop_roots');
			if (obj.datas == null || obj.datas.length < 1) return;
			//如果数据源不是数组，转为数组
			if (!(obj.datas instanceof Array)) {
				var tm = obj.datas;
				obj.datas = new Array();
				obj.datas.push(tm);
			}
			for (var i = 0; i < obj.datas.length; i++) {
				var node = obj._createNode(obj.datas[i]);
				if (node != null) obj.domtit.append(node);
			}
		},
		//子菜单内容区
		body: function(obj) {
			obj.dombody = $dom(document.body).add('drop-body');
			obj.dombody.addClass('dropmenu').attr('ctrid', obj.id);
			for (var i = 0; i < obj.datas.length; i++) {
				if (obj.datas[i] == null) continue;
				if (obj.datas[i].childs && obj.datas[i].childs.length > 0)
					_childs(obj.datas[i], obj);
			}

			function _childs(item, obj) {
				var panel = $dom(document.createElement('drop-panel'));
				panel.attr('pid', item.id).level(item.level);
				panel.height(item.childs.length * obj.height).hide();
				for (var i = 0; i < item.childs.length; i++) {
					panel.append(obj._createNode(item.childs[i]));
					if (item.childs[i].childs && item.childs[i].childs.length > 0)
						_childs(item.childs[i], obj);
				}
				obj.dombody.append(panel);
			}
		}
	};
	//基础事件，初始化时即执行
	fn._baseEvents = {
		interval: function(obj) {
			obj.dombody.find('drop-panel').bind('mouseover', function(e) {
				obj.leavetime = 3;
				obj.leave = false;
			});
			obj.leaveInterval = window.setInterval(function() {
				if (!obj.leave) return;
				if (--obj.leavetime <= 0) {
					obj.dombody.find('drop-panel').hide();
					obj.domtit.find('drop-node').removeClass('hover');
				}
			}, 1000);
		},
		//根菜单滑过事件
		root_hover: function(obj) {
			obj.domtit.find('drop-node').bind('mouseover', function(e) {
				var n = event.target ? event.target : event.srcElement;
				while (n.tagName.toLowerCase() != 'drop-node') n = n.parentNode;
				var node = $dom(n);
				var obj = dropmenu._getObj(n);
				var nid = node.attr('nid');
				//隐藏其它面板
				var brother = obj.getBrother(nid);
				for (var i = 0; i < brother.length; i++) {
					obj.domtit.find('drop-node[nid=\'' + brother[i].id + '\']').removeClass('hover');
					$dom('drop-panel[pid=\'' + brother[i].id + '\']').hide();
					$dom('drop-panel[pid=\'' + brother[i].id + '\'] drop-node').removeClass('hover');
					var childs = obj.getChilds(brother[i].id);
					for (var j = 0; j < childs.length; j++) $dom('drop-panel[pid=\'' + childs[j].id + '\']').hide();
				}
				node.addClass('hover');
				//显示当前面板
				var offset = node.offset();
				var panel = $dom('drop-panel[pid=\'' + nid + '\']');
				if (panel != null || panel.length > 0) {
					panel.show();
					var maxwd = window.innerWidth;
					var maxhg = window.innerHeight;
					var left = offset.left + panel.width() > maxwd ? offset.left + node.width() - panel.width() - 1 : offset.left + 1;
					var top = offset.top + obj.height + panel.width() > maxhg ? offset.top - panel.height() : offset.top + obj.height;
					//当前面板的位置
					panel.left(left).top(top).attr('x', left - offset.left).attr('y', top - offset.top);
				}
				obj.leavetime = 3;
				obj.leave = false;
			});
		},
		//子菜单滑过事件
		node_hover: function(obj) {
			obj.dombody.find('drop-panel drop-node').bind('mouseover', function(e) {
				var n = event.target ? event.target : event.srcElement;
				while (n.tagName.toLowerCase() != 'drop-node') n = n.parentNode;
				var node = $dom(n);
				var obj = dropmenu._getObj(n);
				var nid = node.attr('nid');
				//隐藏其它面板
				var brother = obj.getBrother(nid);
				for (var i = 0; i < brother.length; i++) {
					$dom('drop-panel[pid=\'' + brother[i].id + '\']').hide();
					$dom('drop-panel[pid=\'' + brother[i].id + '\']').find('drop-node').removeClass('hover');
					obj.dombody.find('drop-node[nid=\'' + brother[i].id + '\']').removeClass('hover');
					var childs = obj.getChilds(brother[i].id);
					for (var j = 0; j < childs.length; j++) $dom('drop-panel[pid=\'' + childs[j].id + '\']').hide();
				}
				node.addClass('hover');
				//显示当前面板
				var offset = node.offset();
				var panel = $dom('drop-panel[pid=\'' + nid + '\']');
				if (panel != null || panel.length > 0) {
					panel.show();
					var maxwd = window.innerWidth;
					var maxhg = window.innerHeight;
					var x = Number(node.parent().attr('x'));
					var y = Number(node.parent().attr('y'));
					var left = x < 0 || offset.left + node.width() + panel.width() > maxwd ? offset.left - panel.width() + 5 : offset.left + node.width() - 5;
					var top = y <= 0 || offset.top + obj.height + panel.width() > maxhg ? offset.top - panel.height() + node.height() * 3 / 4 : offset.top + node.height() * 1 / 4;
					//当前面板的位置
					panel.left(left).top(top).attr('x', left - offset.left).attr('y', top - offset.top);
				}
			});
			//当鼠标离开面板时，才允许计算消失时间
			obj.dombody.find('drop-panel').merge(obj.domtit.find('drop-node'))
				.bind('mouseleave', function(e) {
					obj.leavetime = 3;
					obj.leave = true;
				});
		},
		//节点鼠标点击事件
		node_click: function(obj) {
			obj.dombody.find('drop-node').click(function(e) {
				var n = event.target ? event.target : event.srcElement;
				while (n.tagName.toLowerCase() != 'drop-node') n = n.parentNode;
				//节点id
				var nid = $dom(n).attr('nid');
				var obj = dropmenu._getObj(n);
				var data = obj.getData(nid);
				//
				obj.trigger('click', {
					data: data
				});
				obj.leave = true;
				obj.dombody.find('drop-panel').hide();
				obj.domtit.find('drop-node').removeClass('hover');
			});
		}
	};

	//创建节点
	fn._createNode = function(item) {
		if (item == null) return null;
		var node = $dom(document.createElement('drop-node'));
		node.attr('nid', item.id).css({
			'line-height': this._height + 'px',
			'height': this._height + 'px'
		});
		node.add('ico').html(item.ico ? '&#x' + item.ico : '');
		var span = node.add('span');
		//字体样式
		if (item.font) {
			if (item.font.color) node.css('color', item.font.color);
			if (item.font.bold) span.css('font-weight', item.font.bold ? 'bold' : 'normal');
			if (item.font.italic) span.css('font-style', item.font.italic ? 'italic' : 'normal');
		}
		span.html(item.title);
		node.attr('title', item.intro && item.intro.length > 0 ? item.intro : item.title);
		if (item.childs && item.childs.length > 0) node.attr('child', true).add('child');
		return node;
	};
	//计算层深
	fn._calcLevel = function(item, level) {
		if (item == null) return;
		//补全一些信息
		if (!item.id || item.id <= 0) item.id = Math.floor(Math.random() * 100000);
		if (!item.pid || item.pid < 0) item.pid = 0;
		if (!item.level || item.level <= 0) item.level = level;
		if (!item.path) item.path = item.title;
		//计算层深
		if (item.childs && item.childs.length > 0) {
			for (var i = 0; i < item.childs.length; i++) {
				item.childs[i].pid = item.id;
				item.childs[i].path = item.path + ',' + item.childs[i].title;
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
				if (d != null) return d;
			}
			return d;
		}
	};
	//获取当前节点的兄弟节点（数据源）
	fn.getBrother = function(treeid) {
		var d = this.getData(treeid);
		if (d == null) return null;
		var brt = [];
		var datas = d.pid == 0 ? this.datas : this.getData(d.pid).childs;
		for (var i = 0; i < datas.length; i++) {
			if (datas[i].id != treeid) brt.push(datas[i]);
		}
		return brt;
	};
	//当前节点的所有子级（递归）
	fn.getChilds = function(treeid) {
		var childs = [];
		var d = this.getData(treeid);
		if (d == null) return childs;
		getdata(d.childs, childs);

		function getdata(datas, childs) {
			if (!datas) return;
			for (var i = 0; i < datas.length; i++) {
				childs.push(datas[i]);
				if (datas[i].childs && 　datas[i].childs.length > 0)
					getdata(datas[i].childs, childs);
			}
		}
		return childs;
	};
	/*
	dropmenu的静态方法
	*/
	dropmenu.create = function(param) {
		if (param == null) param = {};
		var tobj = new dropmenu(param);
		return tobj;
	};
	//用于事件中，取点击的pagebox的对象
	dropmenu._getObj = function(e) {
		var node = event.target ? event.target : event.srcElement;
		while (!node.classList.contains('dropmenu')) node = node.parentNode;
		var ctrl = $ctrls.get(node.getAttribute('ctrid'));
		return ctrl.obj;
	};
	win.$dropmenu = dropmenu;

})(window);