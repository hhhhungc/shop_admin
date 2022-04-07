<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="Avatar" class="cover-fit" />
      </div>
      <el-form
        label-width="0"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
      >
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item class="login_btns">
          <el-button type="primary" @click="login">登入</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表單驗證規則對象
      loginFormRules: {
        // 驗證用戶名
        username: [
          { required: true, message: '請輸入登入名稱', trigger: 'blur' },
          { min: 3, max: 10, message: '長度在 3 到 10 個字符', trigger: 'blur' }
        ],
        // 驗證密碼
        password: [
          { required: true, message: '請輸入登入密碼', trigger: 'blur' },
          { min: 4, max: 8, message: '長度在 4 到 6 個字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) {
          return this.$message.error('登入失敗')
        }
        this.$message.success('登入成功')
        console.log(res.data.token)
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
        /**
         * 1. 將登入成功的 token 保存到客戶端的 sessionStroage 中
         *   - 項目中除了登入之外的其他api接口 必須在登入之後才能訪問
         *   - token 只應在當前網站打開期間生效，所以將 token 保存在 sessionStroage
         * 2. 通過編程式導航跳轉到後台主頁，路由地址是 /home
         **/
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login_container {
  background: #303f9f;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 4px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 120px;
    width: 120px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 8px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    img {
      border-radius: 50%;
      background: #bdbdbd;
    }
  }
}
.login_form {
  position: absolute;
  width: 100%;
  bottom: 0;
  padding: 0 20px;
  box-sizing: border-box;
}
.login_btns {
  display: flex;
  justify-content: center;
}
</style>
