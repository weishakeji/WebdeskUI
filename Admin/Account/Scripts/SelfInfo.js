
$ready(function () {

    var vue = new Vue({
        el: '#app',
        data: {
            //当前登录账号对象
            account: {
                Acc_Name: '管理员',
                Acc_AccName: 'testAccount',
                Acc_EmpCode: '10522779',
                Acc_MobileTel: '400 - 6015 615',
                Acc_Tel: '18037155753',
                Acc_Email: '10522779@qq.com'
            }
        },
        created: function () {
            /*
            $api.post('Admin/User').then(function (req) {
                if (req.data.success) {
                    var result = req.data.result;
                    vue.account = result;
                } else {
                    throw '未登录，或登录状态已失效';
                }
            }).catch(function (err) {
                alert(err);
            });
*/
        }
    });

});
