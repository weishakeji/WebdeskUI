/*!
 * 主 题：控件管理，
 * 说 明：
 * 1、类似JQuery，主要为了方便操作DOM;
 * 2、满足大多数DOM操作，不兼容IE678;
 * 3、另外写了动态加载css和js的方法，在最后面
 *
 * 作 者：微厦科技_宋雷鸣_10522779@qq.com
 * 开发时间: 2020年1月1日
 * 最后修订：2020年2月4日
 * github开源地址:https://github.com/weishakeji/WebdeskUI
 */
(function() {
	//html节点查询，类似jquery
	var webdom = function(query, context) {
		return new webdom.init(query, context);
	};

	webdom.init = function(query, context) {
		var nodes = [];
		if (typeof(query) == 'string') nodes = (context || document).querySelectorAll(query);
		if (query instanceof Node) nodes[0] = query;
		if (query instanceof NodeList || query instanceof Array) nodes = query;
		//查询结果附加到对象自身
		this.length = nodes.length;
		for (var i = 0; i < this.length; i++) this[i] = nodes[i];
		this.typeof = 'webui.element';
		return this;
	};
	var fn = webdom.init.prototype;
	//遍历节点元素，并执行fun函数
	//ret:默认返回自身对象，如果ret有值，则返回fun函的执行结果
	fn.each = function(fun, ret) {
		var results = [],
			res;
		for (var i = 0; i < this.length; i++) {
			res = fun.call(this[i], i);
			if (res instanceof NodeList || res instanceof Array) {
				for (var j = 0; j < res.length; j++) {
					if (res[j] instanceof Node) {
						if (res[j].nodeType == 1) results.push(res[j])
					} else {
						results.push(res[j]);
					}
				}
			} else {
				switch (typeof(res)) {
					case 'string':
						results.push(res.replace(/^\s*|\s*$/g, ""));
						break;
					case 'boolean':
					case 'number':
						results.push(res);
						break;
					default:
						if (res instanceof Node) {
							if (res.nodeType && res.nodeType == 1)
								results.push(res);
						} else {
							results.push(res);
						}
						break;
				}
			}
		}
		if (ret) {
			if (results instanceof NodeList || results instanceof Array)
				return results.length == 1 ? results[0] : results;
		}
		return this;
	};
	fn.find = function(query) {
		var nodes = [];
		var res = this.each(function() {
			return this.querySelectorAll(query);
		}, 1);
		if (res instanceof Array) {
			for (var i = 0; i < res.length; i++) {
				nodes.push(res[i]);
			}
		} else {
			nodes = res;
		}
		return new webdom(nodes);
	};
	//获取第n个元素,如果为负，则倒序取，例如-1为最后一个
	fn.get = function(index) {
		if (arguments.length < 1 || index == 0 || typeof index !== 'number') return this;
		if (this.length < Math.abs(index)) throw 'webdom.get error : index greater than length';
		return index > 0 ? new webdom(this[index - 1]) : new webdom(this[this.length - Math.abs(index)]);
	};
	fn.first = function() {
		return this.length > 0 ? this.get(1) : null;
	};
	fn.last = function() {
		return this.length > 0 ? this.get(-1) : null;
	};
	fn.parent = function() {
		var nodes = this.each(function() {
			var p = this.parentNode;
			while (p.nodeType != 1) p = p.previousSibling;
			return p;
		}, 1);
		return new webdom(nodes);
	};
	fn.next = function() {
		var nodes = this.each(function() {
			var cur = this.nextSibling;
			while (cur.nodeType != 1) cur = cur.nextSibling;
			return cur;
		}, 1);
		return new webdom(nodes);
	};
	fn.prev = function() {
		var nodes = this.each(function() {
			var p = this.previousSibling;
			while (p.nodeType != 1) p = p.previousSibling;
			return p;
		}, 1);
		return new webdom(nodes);
	};
	fn.siblings = function() {
		return this.each(function() {
			return this.parentNode.childNodes;
		}, 1);
	};
	fn.childs = function(query) {
		var nodes = this.each(function() {
			if (query == null) return this.childNodes;
			var chs = this.childNodes
			var tm = new Array();
			for (var i = 0; i < chs.length; i++) {
				if (chs[i].tagName.toLowerCase() == query.toLowerCase())
					tm.push(chs[i]);
			}
			return tm;
		}, 1);
		return new webdom(nodes);
	}
	fn.hide = function() {
		return this.each(function() {
			this.style.display = "none";
		});
	};
	fn.show = function() {
		return this.each(function() {
			this.style.display = "block";
		});
	};
	fn.toggle = function() {
		this.each(function() {
			var styles = document.defaultView.getComputedStyle(this, null);
			var display = styles.getPropertyValue('display');
			this.style.setProperty('display', display == 'none' ? 'block' : 'none', 'important');
			//this.css('display',display=='' ? 'none' : '','important');
		});
	};
	fn.text = function(str) {
		if (str != undefined) {
			return this.each(function() {
				this.innerText = str;
			});
		} else {
			return this.each(function() {
				return this.innerText;
			}, 1);
		}
	};
	fn.html = function(str) {
		if (str != undefined) {
			return this.each(function() {
				this.innerHTML = str;
			});
		} else {
			return this.each(function() {
				return this.innerHTML;
			}, 1);
		}
	};
	fn.outHtml = function(str) {
		if (str != undefined) {
			return this.each(function() {
				this.outerHTML = str;
			});
		} else {
			return this.each(function() {
				return this.outerHTML;
			}, 1);
		}
	};
	fn.val = function(str) {
		if (str != undefined) {
			return this.each(function() {
				this.value = str;
			});
		} else {
			return this.each(function() {
				if (this.getAttribute('type') == 'checkbox') return this.checked;
				if (this.getAttribute('type') == 'radio') return this.checked;
				return this.value;
			}, 1);
		}
	};
	//设置或获取属性
	//arguments:
	fn.attr = function() {
		var len = arguments.length;
		if (len < 1) return this;
		//如果只有一个参数
		if (len == 1) {
			var key = arguments[0];
			if (typeof(key) == 'string') {
				return this.each(function(index) {
					return this.getAttribute(key);
				}, 1);
			}
			//批量设置属性
			if (typeof(key) == 'object') {
				for (var k in key) this.attr(k, key[k]);
				return this;
			}
		}
		//两个参数，则一个为key，一个为value
		if (len >= 2) {
			var key = arguments[0];
			var val = arguments[1];
			return this.each(function(index) {
				this.setAttribute(key, val);
			});
		}
	}
	//移除属性
	fn.removeAttr = function(key) {
		return this.each(function() {
			this.removeAttribute(key);
		});
	};
	//设置css样式
	fn.css = function(key, value, important) {
		if (typeof(key) == 'object') {
			for (var k in key) this.css(k, key[k]);
			return this;
		}
		if (value != undefined) {
			return this.each(function() {
				this.style.setProperty(key, value, important ? 'important' : '');
			});
		} else {
			return this.each(function() {
				var styles = document.defaultView.getComputedStyle(this, null);
				return styles.getPropertyValue(key);
			}, 1);
		}
	};
	fn.hasClass = function(str) {
		return this.each(function() {
			return this.classList.contains(str);
		}, 1);
	};
	fn.addClass = function(str) {
		return this.each(function() {
			return this.classList.add(str);
		});
	};
	fn.removeClass = function(str) {
		return this.each(function() {
			return this.classList.remove(str);
		});
	};
	fn.remove = function() {
		return this.each(function() {
			if (this.remove) this.remove();
			if (this.removeNode) this.removeNode(true);
		});
	};
	//设置或读取层深，即z-index的值
	fn.level = function(num) {
		if (arguments.length < 1) {
			var res = this.each(function() {
				return this.style.getPropertyValue("z-Index");
			}, 1);
			if (typeof(res) == 'string') return res == '' ? 0 : parseInt(res);
			var l = 0;
			for (var i = 0; i < res.length; i++) {
				var n = parseInt(res[i]);
				if (n > l) l = n;
			}
			return l;
		} else {
			this.css("z-Index", num);
		}
		return this;
	};
	fn.width = function(num) {
		if (arguments.length < 1) {
			var ele = this[0] ? this[0] : null;
			if (ele == null) return 0;
			var styles = document.defaultView.getComputedStyle(ele, null);
			var bleft = parseInt(styles.getPropertyValue('border-left-width'));
			var bright = parseInt(styles.getPropertyValue('border-right-width'));
			var width = ele.offsetWidth - bleft - bright;
			return width;
		} else {
			if (typeof arguments[0] == 'number')
				return this.css('width', arguments[0] + 'px');
			if (typeof arguments[0] == 'string')
				return this.css('width', arguments[0]);
		}
	};

	fn.height = function(num) {
		if (arguments.length < 1) {
			//return this[0] ? this[0].offsetHeight : 0;

			var ele = this[0] ? this[0] : null;
			if (ele == null) return 0;
			var styles = document.defaultView.getComputedStyle(ele, null);
			var bleft = parseInt(styles.getPropertyValue('border-top-width'));
			var bright = parseInt(styles.getPropertyValue('border-bottom-width'));
			var height = ele.offsetHeight - bleft - bright;
			return height;
		} else {
			if (typeof arguments[0] == 'number')
				return this.css('height', arguments[0] + 'px');
			if (typeof arguments[0] == 'string')
				return this.css('height', arguments[0]);
		}
	};
	fn.left = function(num) {
		if (arguments.length < 1) {
			var offset = this.offset();
			return offset.length ? offset[0].left : offset.left;
		} else {
			if (typeof arguments[0] == 'number')
				return this.css('left', arguments[0] + 'px');
		}
	};
	fn.top = function(num) {
		if (arguments.length < 1) {
			var offset = this.offset();
			return offset.length ? offset[0].top : offset.top;
		} else {
			if (typeof arguments[0] == 'number')
				return this.css('top', arguments[0] + 'px');
		}
	};
	fn.offset = function() {
		var offest = {
			top: 0,
			left: 0
		};
		if (this.length < 1) return offest;
		var node = this[0];
		// 当前为IE11以下, 直接返回{top: 0, left: 0}
		if (!node.getClientRects().length) return offest;
		// 当前DOM节点的 display === 'node' 时, 直接返回{top: 0, left: 0}
		if (window.getComputedStyle(node)['display'] === 'none') return offest;
		// Element.getBoundingClientRect()方法返回元素的大小及其相对于视口的位置。
		// 返回值包含了一组用于描述边框的只读属性——left、top、right和bottom，单位为像素。除了 width 和 height 外的属性都是相对于视窗的左上角位置而言的。
		// 返回如{top: 8, right: 1432, bottom: 548, left: 8, width: 1424…}
		offest = node.getBoundingClientRect();
		var docElement = node.ownerDocument.documentElement;
		return {
			top: offest.top + window.pageYOffset - docElement.clientTop,
			left: offest.left + window.pageXOffset - docElement.clientLeft
		};
	};
	fn.append = function(ele) {
		if (typeof(ele) == 'string') {
			return this.each(function() {
				var element = document.createElement(ele);
				this.appendChild(element);
			});
		}
		if (webdom.isdom(ele)) {
			return this.each(function() {
				if (ele.length > 0)
					this.appendChild(ele[0]);
			});
		}
		if (ele instanceof Node) {
			return this.each(function() {
				this.appendChild(ele);
			});
		}
	};
	//合并两个对象，返回新对象
	fn.merge = function(obj) {
		var arr = new Array();
		this.each(function() {
			arr.push(this);
		});
		if (obj instanceof Node) {
			arr.push(obj);
		} else {
			if (webdom.isdom(obj)) {
				obj.each(function(index) {
					arr.push(this);
				});
			}
		}
		return new webdom(arr);
	}
	//绑定事件
	fn.bind = function(event, func, useCapture) {
		this.each(function() {
			this.addEventListener(event, func, useCapture);
			if (event == 'click') {
				var iframe = this.querySelector('iframe');
				if (iframe) {
					webdom.IframeOnClick.track(iframe, function(sender, boxid) {
						sender.click();
					});
				}
			}
		});
	};
	//触发事件
	fn.trigger = function(event) {
		this.each(function() {
			var eObj = document.createEvent('HTMLEvents');
			eObj.initEvent(event, true, false);
			this.dispatchEvent(eObj);
		});
	};
	//若含有参数就注册事件，无参数就触发事件
	fn.click = function(f) {
		if (typeof(f) == "function") {
			this.bind('click', f, true);
		} else {
			this.trigger('click');
		}
	};
	fn.dblclick = function(f) {
		if (typeof(f) == "function") {
			this.bind('dblclick', f, true);
		} else {
			this.trigger('dblclick');
		}
	};
	fn.mousedown = function(f) {
		if (typeof(f) == "function") {
			this.bind('mousedown', f, true);
		} else {
			this.trigger('mousedown');
		}
	};
	/*
	静态方法
	*/
	//是否是webdom对象
	webdom.isdom = function(obj) {
		return typeof(obj) == 'object' && obj.typeof == 'webui.element';
	}
	//鼠标的坐标值
	webdom.mouse = function(e) {
		var x = 0,
			y = 0;
		var e = e || window.event;
		if (e.pageX || e.pageY) {
			x = e.pageX;
			y = e.pageY;
		} else if (e.clientX || e.clientY) {
			x = e.clientX;
			y = e.clientY;
		}
		return {
			'x': x,
			'y': y
		};
	};
	//当click事件时，如果有iframe时，添加iframe的点击事件
	webdom.IframeOnClick = {
		resolution: 10,
		iframes: [],
		interval: null,
		Iframe: function() {
			this.element = arguments[0];
			this.cb = arguments[1];
			this.hasTracked = false;
		},
		track: function(element, cb) {
			this.iframes.push(new this.Iframe(element, cb));
			if (!this.interval) {
				var _this = this;
				this.interval = setInterval(function() {
					_this.checkClick();
				}, this.resolution);
			}
		},
		checkClick: function() {
			if (document.activeElement) {
				var activeElement = document.activeElement;
				for (var i in this.iframes) {
					var iframe = this.iframes[i];
					if (!(iframe && iframe.element)) continue;
					var name = iframe.element.getAttribute('name');
					var pagebox = document.querySelector('.pagebox[boxid=\'' + name + '\']');
					if (activeElement === this.iframes[i].element) { // user is in this Iframe  
						if (this.iframes[i].hasTracked == false) {
							this.iframes[i].cb.apply(window, [pagebox, name]);
							this.iframes[i].hasTracked = true;
						}
					} else {
						this.iframes[i].hasTracked = false;
					}
				}
			}
		}
	};
	//加载css或js文件
	webdom.load = {
		css: function(url) {
			var head = document.getElementsByTagName('head')[0];
			var link = document.createElement('link');
			link.type = 'text/css';
			link.rel = 'stylesheet';
			link.href = url;
			head.appendChild(link);
		},
		js: function(url) {
			var body = document.getElementsByTagName('body').item(0);
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = url;
			body.appendChild(script);
		}
	};
	//创建全局对象，方便调用
	window.$dom = webdom;
	window.$dom.load.css('styles/webdesk.ui.core.css');
})();