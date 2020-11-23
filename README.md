# WebdeskUI Admin
# Web系统的管理面板（仿桌面应用）
>没有基于Vue，也没有基于JQuery，完全自主开发。仿桌面应用，例如弹窗可以自由缩放、拖放、切换、最大化、最小化；

>可切换风格，内置校园风格、Win10风格和Win7风格。日间模式/夜间模式。

>包括常用控件，登录、下拉菜单、树形菜单、选项卡、弹窗等；内页采用IFrame嵌套。
![pic1](http://webdesk.weisha100.cn/other/images/ui.png)

## 开发初衷：
> 为公司主打产品《微厦在线学习系统》的管理界面升级而开发。例如，课程管理打开后，还要有章节管理、试题管理、价格管理、通知公告，等等；章节管理进去还有视频、资料的编辑等等；层层深入，交互功能比较复杂。如果通过普通的页面跳转实现，太繁杂，我就想写个弹窗，能像windows窗体一样，操作直观一些。且可缩放、可拖放、可以与其它控件进行互动，有事件机制和它组件进行交互，等等。

> 同类软件有很多，但免费的太弱鸡，功能强的要收费。为了满足自身需求，同时不希望在版权上受制于人，趁春节疫情期间，就自己写了。

## 使用说明：
> 该管理面板只提供了一些常用控件，内页采用iFrame嵌套；内页可以采用其它前端框架，例如我们产品采用了ElementUI。

> 用户登录的验证与状态管理，需要自己编写。（下述代码在/Admin/Scripts/Index.js文件）
``` javascript
    //登录框的构建
    $login.create({
        target: '#login-area',
        //width: '320px',
        title: '微厦在线学习系统',
        company: '微厦科技',
        success: true,   //默认登录验证的状态，如果为true,则直接跳过登录
        website: 'http://www.weishakeji.net',
        tel: '400 6015615'
    }).onload(function (s, e) {  //加载后，判断是否为登录状态
        /* 此处可编写：判断是否为已经登录的状态 */
        if (s.success) {
            s.loading = true;
            ready(s);
        }
    }).ondragfinish(function (s, e) {
        /* 此处可编写：当拖动滑块后，加载验证码图片 */
    }).onsubmit(function (s, e) {   //提交事件
        s.loading = true;
        /* 此处可编写：登录校验相关代码 */
        if (s.success) ready(s);
    }).verify([{            //自定义验证
        ctrl: 'user', regex: /^[a-zA-Z0-9_-]{4,16}$/,
        tips: '长度不得小于4位大于16位'
    }, {
        ctrl: 'vcode', regex: /^\d{4}$/,
        tips: '请输入4位数字'
    }]);
```
## 控件说明
* Pagebox.js 页面窗体 <a href="https://github.com/weishakeji/WebdeskUI" target="_blank">演示</a>
   * 可拖放，可缩放，模拟windows桌面窗体
   * 可上溯父级，遍历下级，父子窗体可互动

## 开源地址：
* GitHub ：<a href="http://webdesk.weisha100.cn/ctrls/pagebox.html" target="_blank">https://github.com/weishakeji/WebdeskUI</a> 
* Gitee（同步镜像）： <a href="https://gitee.com/weishakeji/WebdeskUI" target="_blank">https://gitee.com/weishakeji/WebdeskUI</a> 

## 开发团队：
* 郑州微厦计算机科技有限公司
* QQ交流群：10236993

<hr/>


# 其它开源项目：
<b> 微厦在线学习云服务平台</b>
>“在线视频学习、在线试题练习、在线同步考试”紧密相联，打造“学、练、考”于一体的在线教育系统，能够利用电脑、手机、微信等多种设备进行学习，方便学员利用碎片化时间进行随时随地的学习。并带有“分享、分润、分销”的辅助功能，对于平台推广、课程销售起到非常有效的帮助。

## 

<b> 学习系统的开源地址：</b>
* GitHub ：<a href="https://github.com/weishakeji/LearningSystem" target="_blank">https://github.com/weishakeji/LearningSystem</a> 
* Gitee（同步镜像）： <a href="https://gitee.com/weishakeji/LearningSystem" target="_blank">https://gitee.com/weishakeji/LearningSystem</a> 

