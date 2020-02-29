/*!
 * 主 题：时间显示
 * 说 明：
 * 1、用于显示时间，可以格式化;
 *
 * 作 者：微厦科技_宋雷鸣_10522779@qq.com
 * 开发时间: 2020年2月27日
 * 最后修订：2020年2月28日
 * github开源地址:https://github.com/weishakeji/WebdeskUI
 */
(function(win) {
	var timer = function(param) {
		if (param == null || typeof(param) != 'object') param = {};
		this.attrs = {
			time: null, //初始时间
			year: 0, //年
			month: 0,
			day: 0,
			week: 0,
			hour: 0,
			minute: 0,
			second: 0,
			millisecond: 0
		};
		for (var t in param) this.attrs[t] = param[t];
		eval($ctrl.attr_generate(this.attrs));
		/* 自定义事件 */
		//time:当时间初始化时
		eval($ctrl.event_generate(['time']));
		//本地Js时间
		this.localtime = new Date();
		this._initialization();
		//this._restructure();
		for (var t in this._baseEvents) this._baseEvents[t](this);
	};
	var fn = timer.prototype;
	fn._initialization = function() {
		if (!this._id) this._id = 'timer_' + new Date().getTime();
		this.time = new Date();
	};
	//当属性更改时触发相应动作
	fn._watch = {
		'time': function(obj, val, old) {
			if (val instanceof Date) obj._time = val;
			if (Object.prototype.toString.call(val) === "[object String]") {
				obj._time = new Date(val);
			}
		},
		'second': function(obj, val, old) {
			//console.log(val);
		}
	}
	fn.format = function(fmt) {
		return timer.format(fmt, this.time);
	}
	//重构
	fn._restructure = function() {
		var th = this;
		$dom('timer').each(function() {
			var fmt = $dom(this).attr('format');
			if (fmt == null) return;
			var ret = th.format(fmt)
			$dom(this).html(ret);
		});
	};
	fn._baseEvents = {
		interval: function(obj) {
			obj.interval = window.setInterval(function() {
				var mil = obj.time.getTime() + 1000;
				obj._time = new Date(mil);
				//
				obj.year = obj.time.getFullYear();
				obj.month = obj.time.getMonth() + 1;
				obj.day = obj.time.getDate();
				obj.week = obj.time.getDay();
				obj.hour = obj.time.getHours();
				obj.minute = obj.time.getMinutes();
				obj.second = obj.time.getSeconds();
				obj.millisecond = obj.time.getTime();
				obj._restructure();
			}, 1000);
		}
	}
	/*
	timer的静态方法
	*/
	timer.create = function(param) {
		if (param == null) param = {};
		var tobj = new verticalbar(param);
		return tobj;
	};
	timer.format = function(fmt, date) {
		fmt = fmt.replace(/\Y/g, "y");
		//24小时制
		var h24 = date.toLocaleString('chinese', {
			hour12: false
		});
		h24 = h24.substring(h24.indexOf(' ') + 1, h24.indexOf(':'));
		//12小时制
		var h12 = date.toLocaleString('chinese', {
			hour12: true
		});
		h12 = h12.substring(h12.indexOf(' ') + 1, h12.indexOf(':'));
		//星期
		var week = ['天', '一', '二', '三', '四', '五', '六'];
		//
		var ret;
		var opt = {
			"yyyy": date.getFullYear().toString(), // 年
			"yy": date.getFullYear().toString().substring(2),
			"M+": (date.getMonth() + 1).toString(), // 月
			"d+": date.getDate().toString(), // 日
			"w+": week[date.getDay()], // 星期
			"H+": h24, //小时
			"h+": h12,
			"m+": date.getMinutes().toString(), // 分
			"s+": date.getSeconds().toString() // 秒			
		};
		for (var k in opt) {
			ret = new RegExp("(" + k + ")").exec(fmt);
			if (ret) {
				fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
			};
		};
		return fmt;
	}

	win.$timer = new timer();
	window.addEventListener('load', function() {
		window.$timer._restructure();
	}, true);
})(window);