/*!
 * 主 题：登录框
 * 说 明：
 * 1、支持支持滑块；
 * 2、可加载验证码
 * 3、异步加载验证
 *
 * 作 者：微厦科技_宋雷鸣_10522779@qq.com
 * 开发时间: 2020年3月25日
 * 最后修订：2020年3月31日
 * github开源地址:https://github.com/weishakeji/WebdeskUI
 */
(function(win) {
    var login = function(param) {
        if (param == null || typeof(param) != 'object') param = {};
        this.attrs = {
            target: '', //所在Html区域			
            width: '100%',
            height: '100%',
            title: '', //标题
            ico: '', //图标的字体符号
            icoimg: '', //图标的图片样式
            company: '', //公司名称
            website: '', //公司的网址
            tel: '', //联系电话
            id: '',
            loading: false //加载中
        };
        for (var t in param) this.attrs[t] = param[t];
        eval($ctrl.attr_generate(this.attrs));
        /* 自定义事件 */
        //shut:关闭标签; add:添加标签；change:切换标签; full:标签项全屏
        eval($ctrl.event_generate(['loyout', 'drag', 'vefiry', 'submit', 'success', 'error']));
        //以下不支持双向绑定
        this.childs = new Array(); //子级		
        this.dom = null; //控件的html对象
        this.domtit = null; //控件标签栏部分的html对象
        this.dombody = null;
        this.domfoot = null;
        //
        if (!this._id) this._id = 'login_' + new Date().getTime();
        $ctrls.add({
            id: this.id,
            obj: this,
            dom: this.dom,
            type: 'login'
        });
    };
    var fn = login.prototype;
    fn._initialization = function() {
        if (!this._id) this._id = 'login_' + new Date().getTime();
    };
    //当属性更改时触发相应动作
    fn._watch = {
        'width': function(obj, val, old) {
            if (obj.dom) obj.dom.width(val);
            obj.trigger('resize', {
                width: val,
                height: obj._height
            });
        },
        'height': function(obj, val, old) {
            if (obj.dom) obj.dom.height(val);
            obj.trigger('resize', {
                width: obj._width,
                height: val
            });
        },
        'title': function(obj, val, old) {
            if (obj.domtit) obj.domtit.find('login_tit').html(val);
        },
        'company': function(obj, val, old) {
            if (obj.domfoot) obj.domfoot.find('login_company a').html(val);
        },
        'website': function(obj, val, old) {
            if (obj.domfoot) obj.domfoot.find('login_company a').attr('href', val);
        },
        'tel': function(obj, val, old) {
            if (obj.domfoot) obj.domfoot.find('login_tel').html(val);
        }
    };
    fn.open = function() {
        this._initialization();
        //创建登录窗体
        for (var t in this._builder) this._builder[t](this);
        //
        this.width = this._width;
        this.height = this._height
        return this;
    };
    fn._builder = {
        //生成外壳
        shell: function(obj) {
            var area = $dom(obj.target);
            if (area.length < 1) {
                console.log('Login所在区域不存在');
                return;
            }
            area.addClass('loginbox').attr('ctrid', obj.id);
            obj.dom = area;
        },
        title: function(obj) {
            obj.domtit = obj.dom.add('login_titlebar');
            var ico = obj.domtit.add('login_ico');
            if (obj.icoimg != '') ico.add('img').attr('src', obj.icoimg);
            if (obj.icoimg == '') ico.add('i').html('&#x' + obj.ico);
            obj.domtit.add('login_tit').html(obj.title);
        },
        body: function(obj) {
            obj.dombody = obj.dom.add('login_body');
        },
        footer: function(obj) {
            obj.domfoot = obj.dom.add('login_footbar');
            var company = obj.domfoot.add('login_company');
            company.add('a').html(obj.company).attr({
                'target': '_blank',
                'href': obj.website
            });
            obj.domfoot.add('login_tel').html(obj.tel);
        }
    };
    /*** 
    以下是静态方法
    *****/
    login.create = function(param) {
        if (param == null) param = {};
        var tobj = new login(param);
        return tobj.open();
    };
    win.$login = login;
})(window);