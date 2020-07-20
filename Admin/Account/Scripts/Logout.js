
$ready(function () {
    var vue = new Vue({
        el: '#app',
        data: {
            account: {
                Acc_Name: '管理员'
            } //当前登录账号对象
        },
        created: function () {
            /*$api.post('Admin/User').then(function (req) {
                if (req.data.success) {
                    var result = req.data.result;
                    vue.account = result;
                } else {
                    throw '未登录，或登录状态已失效';
                }
            }).catch(function (err) {
                alert(err);
            });*/
        },
        methods: {
            btnLogout: function () {
                $api.loginstatus('admin', '');
                window.top.location.reload();
            },
            btnCancel: function () {
                var name = $dom.trim(window.name);
                if (window.top.$pagebox)
                    window.top.$pagebox.shut(name);
            }
        },
    });
});
