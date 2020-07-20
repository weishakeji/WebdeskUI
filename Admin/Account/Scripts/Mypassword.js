
$ready(function () {

    var vue = new Vue({
        el: '#app',
        data: {
            form: {
                oldpw: '',
                newpw: '',
                newpw2: ''
            },
            account: {
                Acc_Name: '管理员',
                Acc_AccName:'testAccount'
            }, //当前登录账号对象
            rules: {
                oldpw: [
                    { required: true, message: '请输入原密码', trigger: 'blur' }
                ],
                newpw: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
                newpw2: [
                    { required: true, message: '请输入新密码', trigger: 'blur' },
                    {
                        validator: function (rule, value, callback) {
                            if (value !== vue.form.newpw) {
                                callback(new Error('两次输入密码不一致!'));
                            } else {
                                callback();
                            }
                        }, trigger: 'blur'
                    }
                ]
            }
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
            });
*/
        },
        methods: {
            btnEnter: function (formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        vue.$message({
                            type: 'success',
                            message: '修改成功!',
                            center: true
                        });
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            }
        },
    });

});
