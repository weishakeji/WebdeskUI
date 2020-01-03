//
/*
我想它应该有如下功能：
1、获取元素，设置属性，类似Jquery
2、事件管理
3、状态管理
*/
(function() {
	//html节点查询，类似jquery
	var webui = function(query, context) {
		var nodes = [];
		if (typeof(query) == 'string') nodes = (context || document).querySelectorAll(query);
		if (query instanceof Node) nodes[0] = query;
		if (query instanceof NodeList || query instanceof Array) nodes = query;
		//查询结果附加到对象自身
		this.length = nodes.length;
		for (var i = 0; i < this.length; i++) this[i] = nodes[i];
		return this;
	}
	var fn = webui.prototype;
	//遍历节点元素，并执行fun函数
	//ret:默认返回自身对象，如果ret有值，则返回fun函的执行结果
	fn.each = function(fun, ret) {
		var results = [];
		for (var i = 0; i < this.length; i++)
			results[i] = fun.call(this[i], i);
		if (ret) return results.length == 1 ? results[0] : results;
		return this;
	};
	//获取第n个元素,如果为负，则倒序取，例如-1为最后一个
	fn.get = function(index) {
		if (arguments.length < 1 || index == 0 || typeof index !== 'number') return this;
		if (this.length < Math.abs(index)) throw 'webui.get error : index greater than length';
		return index > 0 ? new webui(this[index - 1]) : new webui(this[this.length - Math.abs(index)]);
	};
	fn.first = function() {
		return this.length > 0 ? this.eq(0) : null;
	};
	fn.last = function() {
		return this.length > 0 ? this.eq(this.length - 1) : null;
	};

	fn.hide = function() {
		return this.each(function() {
			this.style.display = "none";
		});
	};
	fn.show = function() {
		return this.each(function() {
			this.style.display = "";
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
				this.style.setProperty(key, value, important);
			});
		} else {
			return this.each(function() {
				return this.style.getPropertyValue(key);
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
	//创建全局对象，方便调用
	window.$ui = function(query, context) {
		return new webui(query, context);
	};
})();