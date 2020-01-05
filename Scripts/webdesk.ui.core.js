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
        this.typeof = 'webui.element';
        return this;
    }
    var fn = webui.prototype;
    //遍历节点元素，并执行fun函数
    //ret:默认返回自身对象，如果ret有值，则返回fun函的执行结果
    fn.each = function(fun, ret) {
        var results = [];
        for (var i = 0; i < this.length; i++) {
            var res = fun.call(this[i], i);
            if (res instanceof Node && res.nodeType && res.nodeType == 1) results[i] = res;
            if (res instanceof NodeList) {
                for (var j = 0; j < res.length; j++) {
                    if (res[j].nodeType && res[j].nodeType == 1)
                        results.push(res[j])
                };
            }
            if (res instanceof Array) {
                for (var j = 0; j < res.length; j++)
                    results.push(res[j]);
            }
        }
        if (ret) {
            if (typeof(res) == 'string') return res.replace(/^\s*|\s*$/g, "");
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
        return new webui(nodes);
    };

    //获取第n个元素,如果为负，则倒序取，例如-1为最后一个
    fn.get = function(index) {
        if (arguments.length < 1 || index == 0 || typeof index !== 'number') return this;
        if (this.length < Math.abs(index)) throw 'webui.get error : index greater than length';
        return index > 0 ? new webui(this[index - 1]) : new webui(this[this.length - Math.abs(index)]);
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
        return new webui(nodes);
    };
    fn.next = function() {
        var nodes = this.each(function() {
            var cur = this.nextSibling;
            while (cur.nodeType != 1) cur = cur.nextSibling;
            return cur;
        }, 1);
        return new webui(nodes);
    };
    fn.prev = function() {
        var nodes = this.each(function() {
            var p = this.previousSibling;
            while (p.nodeType != 1) p = p.previousSibling;
            return p;
        }, 1);
        return new webui(nodes);
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
        return new webui(nodes);
    }
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
    fn.remove = function() {
        return this.each(function() {
            this.remove();
        });
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
    fn.create = function(name) {
        var node = null;
        if (typeof(ele) == 'string') node = document.createElement(name);
        return new webui(node);
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
    //若含有参数就注册事件，无参数就触发事件
    fn.click = function(f) {
        if (typeof(f) == "function") {
            this.each(function() {
                this.addEventListener("click", f);
            });
        } else {
            //触发事件
            this.each(function() {
                var event = document.createEvent('HTMLEvents');
                event.initEvent("click", true, true);
                this.dispatchEvent(event);
            });
        }
    };
    //创建全局对象，方便调用
    window.$dom = function(query, context) {
        return new webui(query, context);
    };
})();