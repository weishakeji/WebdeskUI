//
/*
我想它应该有如下功能：
1、获取元素，设置属性，类似Jquery
2、事件管理
3、状态管理
*/
(function() {
	//html节点查询，类似jquery
	var webdom = function(query, context) {
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
	var fn = webdom.prototype;
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
	fn.childs = function() {
		var nodes = this.each(function() {
			return this.childNodes;
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
			this.remove();
		});
	};
	//设置或读取层深，即z-index的值
	fn.level = function(num) {
		if (arguments.length < 1) {
			var res = this.each(function() {
				return this.style.getPropertyValue("z-Index");
			}, 1);
			if (typeof(res) == 'string') return parseInt(res);
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
			return this[0] ? this[0].offsetWidth : 0;
		} else {
			if (typeof arguments[0] == 'number')
				return this.css('width', arguments[0] + 'px');
		}
	};
	fn.height = function(num) {
		if (arguments.length < 1) {
			return this[0] ? this[0].offsetHeight : 0;
		} else {
			if (typeof arguments[0] == 'number')
				return this.css('height', arguments[0] + 'px');
		}
	};
	fn.offset = function() {
		return this.each(function() {
			var styles = document.defaultView.getComputedStyle(this, null);
			return {
				left: parseFloat(styles.getPropertyValue('left')),
				top: parseFloat(styles.getPropertyValue('top'))
			};
		}, 1);
	};
	fn.append = function(ele) {
		if (typeof(ele) == 'string') {
			return this.each(function() {
				var element = document.createElement(ele);
				this.appendChild(element);
			});
		}
		if (typeof(ele) == 'object' && ele.typeof == 'webui.element') {
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
			if (typeof(obj) == 'object' && obj.typeof == 'webui.element') {
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
					window.$dom.IframeOnClick.track(iframe, function(sender, boxid) {
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
	//创建全局对象，方便调用
	window.$dom = function(query, context) {
		return new webdom(query, context);
	};
	//当click事件时，如果有iframe时，添加iframe的点击事件
	window.$dom.IframeOnClick = {
		resolution: 200,
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
	//获取鼠标位置
	window.$mouse = function(e) {
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
	}

})();