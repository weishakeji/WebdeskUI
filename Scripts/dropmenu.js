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
			width: '100%',
			height: 30,
			id: '',
			bind: true //是否实时数据绑定
		};
		for (var t in param) this.attrs[t] = param[t];
		eval($ctrl.attr_generate(this.attrs));
		/* 自定义事件 */
		//add:添加数据项时;click:点击菜单项
		eval($ctrl.event_generate(['add', 'click']));

		this.datas = new Array(); //数据源
		this._datas = ''; //数据源的序列化字符串
		this.dom = null; //控件的html对象
		this.domtit = null; //控件标签栏部分的html对象
		//this.dombody = null; //控件内容区
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
			if (obj.dom) obj.dom.width(val);
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
			area.html('');

			for (var i = 0; i < this.datas.length; i++)
				this.datas[i] = this._calcLevel(this.datas[i], 1);

			//this.datas = this._calcLevel(this.datas, 1);
			for (var t in this._builder) this._builder[t](this);
			this.width = this._width;
			this.height = this._height;
		}

	};
	//生成实始的构造
	fn._generate = function() {
		for (var t in this._builder) this._builder[t](this);
		//for (var t in this._baseEvents) this._baseEvents[t](this);
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
			if (obj.datas == null) return;
			//如果数据源不是数组，转为数组
			if (!(obj.datas instanceof Array)) {
				var tm = obj.datas;
				obj.datas = new Array();
				obj.datas.push(tm);
			}
			for (var i = 0; i < obj.datas.length; i++) {				
				obj.domtit.append(obj._createNode(obj.datas[i]));
			}
		},
		//子菜单内容区
		body: function(obj) {
			for (var i = 0; i < obj.datas.length; i++) {
				if (obj.datas[i].childs.length > 0)
					_childs(obj.datas[i], obj);
			}
			function _childs(item, obj) {
				var panel = $dom(document.createElement('drop-panel'));
				panel.attr('pid', item.id).level(item.level);
				panel.height(item.childs.length * obj.height);
				for (var i = 0; i < item.childs.length; i++) {
					panel.append(obj._createNode(item.childs[i]));
					if (item.childs[i].childs && item.childs[i].childs.length > 0)
						_childs(item.childs[i], obj);
				}
				obj.dom.append(panel);
			}
		}
	};
	//基础事件，初始化时即执行
	fn._baseEvents = {

	};

	//创建节点
	fn._createNode = function(item) {
		var node = $dom(document.createElement('drop-node'));
		node.attr('nid', item.id).css({
			'line-height': this._height + 'px',
			'height': this._height + 'px'
		});
		node.add('ico').html('&#x' + (item.ico ? item.ico : 'a022'));
		var span = node.add('span');
		//字体样式
		if (item.font) {
			if (item.font.color) node.css('color', item.font.color);
			if (item.font.bold) span.css('font-weight', item.font.bold ? 'bold' : 'normal');
			if (item.font.italic) span.css('font-style', item.font.italic ? 'italic' : 'normal');
		}
		span.html(item.title);
		if (item.childs && item.childs.length > 0) node.attr('child', true).add('child');
		return node;
	};
	//计算层深
	fn._calcLevel = function(item, level) {
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

	/*
	dropmenu的静态方法
	*/
	dropmenu.create = function(param) {
		if (param == null) param = {};
		var tobj = new dropmenu(param);
		return tobj;
	};
	dropmenu._initEvent = function() {

	}
	win.$dropmenu = dropmenu;
	win.$dropmenu._initEvent();
})(window);