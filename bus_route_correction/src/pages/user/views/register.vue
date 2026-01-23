<template>
  <div class="login">
    <div class="login_header">
      <a class="title" href="/">{{ $l("header_title") }}</a>
      <el-select class="select" v-model="page_language" size="mini" @change="handleChangeLanguage">
        <el-option label="简体中文" value="zh-CN" />
        <el-option label="English" value="en-US" />
      </el-select>
      <el-switch v-model="theme" active-value="dark" active-color="#555" inactive-value="light" @change="handleChangeTheme" />

      <!-- <a class="btn_text">资料下载</a>
      <a class="btn_text">注销</a> -->
    </div>
    <div class="login_body">
      <div class="left dark_hide" src="@/assets/image/user/登录背景插画.png"></div>
      <!-- <img class="left dark_show" src="@/assets/image/user/登录背景插画.dark.png" /> -->
      <div class="right">
        <div class="login_form_box">
          <el-form class="login_form" :model="registerForm" ref="registerForm" :rules="registerRules" label-position="top">
            <el-form-item label-width="0">
              <div class="title">{{ $l("form_title") }}</div>
            </el-form-item>
            <el-form-item :label="$l('form_username_label')" prop="username">
              <el-input v-model="registerForm.username" auto-complete="off" :placeholder="$l('form_username_placeholder')"></el-input>
            </el-form-item>
            <el-form-item :label="$l('form_password_label')" prop="password">
              <el-input v-model="registerForm.password" :placeholder="$l('form_password_placeholder')" auto-complete="off" type="password"></el-input>
            </el-form-item>
            <el-form-item :label="$l('form_confirmPassword_label')" prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" :placeholder="$l('form_confirmPassword_placeholder')" auto-complete="off" type="password"></el-input>
            </el-form-item>
            <el-form-item :label="$l('form_email_label')" prop="email">
              <el-input v-model="registerForm.email" :placeholder="$l('form_email_placeholder')" auto-complete="off" type="password"></el-input>
            </el-form-item>
            <el-form-item :label="$l('form_code_label')" prop="code" v-if="captchaEnabled">
              <div class="code_box">
                <el-input v-model="registerForm.code" :placeholder="$l('form_code_placeholder')"></el-input>
                <img class="login-code-img" :src="codeUrl" @click="getCode" />
              </div>
            </el-form-item>
            <el-form-item label-width="0">
              <div class="register_box">
                <span class="register">
                  <el-checkbox v-model="registerForm.rememberMe" auto-complete="off" style="margin: 0px 5px 0px 0px"></el-checkbox>
                  <span>{{ $l("Agree_to_the") }} </span><a>&nbsp;{{ $l("user_agreement") }}</a>
                </span>
                <span class="register">
                  <span>{{ $l("form_register_text1") }}</span>
                  <a href="#/">{{ $l("form_register_text2") }}</a>
                </span>
              </div>
              <el-button class="submit_button" type="primary" :loading="loading" @click.native.prevent="handleRegister">
                <span v-if="!loading">{{ $l("form_submit") }}</span>
                <span v-else>{{ $l("form_submitting") }}</span>
              </el-button>
            </el-form-item>
            <el-form-item label-width="0">
              <BeiAnBox class="copy" />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<language>
{
  "header_title": {
    "zh-CN":"在线交通规划-MATSim",
    "en-US":"MATSim",
  },
  "header_btn1": {
    "zh-CN":"资料下载",
    "en-US":"Download",
  },
  "header_btn2": {
    "zh-CN":"注销",
    "en-US":"Log out",
  },
  "form_title": {
    "zh-CN":"用户注册",
    "en-US":"Welcome to log in",
  },
  "form_username_label": {
    "zh-CN":"用户名", 
    "en-US":"Username", 
  },
  "form_username_placeholder": {
    "zh-CN":"请输入用户名" ,
    "en-US":"Please enter username" ,
  },
  "form_password_label": {
    "zh-CN":"密码", 
    "en-US":"Password", 
  },
  "form_password_placeholder": {
    "zh-CN":"请输入密码" ,
    "en-US":"Please enter password" ,
  },
  "form_confirmPassword_label": {
    "zh-CN":"确认密码", 
    "en-US":"Confirm Password", 
  },
  "form_confirmPassword_placeholder": {
    "zh-CN":"请重新输入密码" ,
    "en-US":"Please re-enter your password" ,
  },
  "form_email_label": {
    "zh-CN":"电子邮箱", 
    "en-US":"E-mail", 
  },
  "form_email_placeholder": {
    "zh-CN":"请输入电子邮箱号码" ,
    "en-US":"Please enter E-mail" ,
  },
  "form_code_label": {
    "zh-CN":"验证码", 
    "en-US":"Code", 
  },
  "form_code_placeholder": {
    "zh-CN":"请输入验证码" ,
    "en-US":"Please enter code" ,
  },
  "Agree_to_the": {
    "zh-CN":"同意",
    "en-US":"Agree to the ",
  },
  "user_agreement": {
    "zh-CN":"用户协议",
    "en-US":"User Agreement",
  },
  "form_submit": {
    "zh-CN":"注 册",
    "en-US":"Login",
  },
  "form_submitting": {
    "zh-CN":"注 册 中...",
    "en-US":"Logging in..",
  },
  "form_forgetPasswork": {
    "zh-CN":"忘记密码？",
    "en-US":"Forgot password?",
  },
  "form_register_text1": {
    "zh-CN":"已有账号？", 
    "en-US":"Has account? ", 
  },
  "form_register_text2": {
    "zh-CN":"立即登录" ,
    "en-US":"Log in now" ,
  },
  "username_error1": {
    "zh-CN":"请输入您的账号" ,
    "en-US":"Please enter your account" ,
  },
  "username_error2": {
    "zh-CN":"用户账号长度必须介于 2 和 20 之间" ,
    "en-US":"The length of the user account must be between 2 and 20" ,
  },
  "password_error1": {
    "zh-CN":"请输入您的密码" ,
    "en-US":"Please enter your password" ,
  },
  "password_error2": {
    "zh-CN":"用户密码长度必须介于 5 和 20 之间" ,
    "en-US":"The length of the user password must be between 5 and 20" ,
  },
  "password_error3": {
    "zh-CN":`不能包含非法字符：< > " ' \ |` ,
    "en-US":`Cannot contain illegal characters: < > " ' \ |` ,
  },
  "confirmPassword_error1": {
    "zh-CN":"请再次输入您的密码" ,
    "en-US":"Please enter your password again" ,
  },
  "confirmPassword_error1": {
    "zh-CN":"两次输入的密码不一致" ,
    "en-US":"The passwords entered twice are inconsistent" ,
  },
  "email_error1": {
    "zh-CN":"请输入您的邮箱" ,
    "en-US":"Please enter your email address" ,
  },
  "email_error2": {
    "zh-CN":"邮箱格式不正确" ,
    "en-US":"Email format incorrect" ,
  },
  "code_error1": {
    "zh-CN":"请输入验证码" ,
    "en-US":"Please enter the verification code" ,
  },
}
</language>

<script>
import { getCodeImg, register } from "@/api/login";

export default {
  name: "Register",
  data() {
    return {
      codeUrl: "",
      registerForm: {
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        code: "",
        uuid: "",
      },
      loading: false,
      captchaEnabled: true,
      theme: localStorage.getItem("user-theme") || "light",
    };
  },
  computed: {
    registerRules() {
      const equalToPassword = (rule, value, callback) => {
        if (this.registerForm.password !== value) {
          callback(new Error(this.$l("confirmPassword_error1")));
        } else {
          callback();
        }
      };
      return {
        username: [
          { required: true, trigger: "blur", message: this.$l("username_error1") },
          { min: 2, max: 20, message: this.$l("username_error2"), trigger: "blur" },
        ],
        password: [
          { required: true, trigger: "blur", message: this.$l("password_error1") },
          { min: 5, max: 20, message: this.$l("password_error2"), trigger: "blur" },
          { pattern: /^[^<>"'|\\]+$/, message: this.$l("password_error3"), trigger: "blur" },
        ],
        confirmPassword: [
          { required: true, trigger: "blur", message: this.$l("confirmPassword_error1") },
          { required: true, validator: equalToPassword, trigger: "blur" },
        ],
        email: [
          { required: true, trigger: "blur", message: this.$l("email_error1") },
          { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, message: this.$l("email_error2"), trigger: "blur" },
        ],
        code: [{ required: true, trigger: "change", message: this.$l("code_error1") }],
      };
    },
  },
  created() {
    this.getCode();
  },
  methods: {
    handleChangeTheme(theme) {
      localStorage.setItem("user-theme", theme);
      document.body.setAttribute("data-theme", theme);
    },
    handleChangeLanguage(lan) {
      console.log(this);

      this.$setLanguage(lan);
    },
    getCode() {
      getCodeImg().then((res) => {
        this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled;
        if (this.captchaEnabled) {
          this.codeUrl = "data:image/gif;base64," + res.img;
          this.registerForm.uuid = res.uuid;
        }
      });
    },
    handleRegister() {
      this.$refs.registerForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          register(this.registerForm)
            .then((res) => {
              const username = this.registerForm.username;
              this.$alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", "系统提示", {
                dangerouslyUseHTMLString: true,
                type: "success",
              })
                .then(() => {
                  this.$router.push("/");
                })
                .catch(() => {});
            })
            .catch(() => {
              this.loading = false;
              if (this.captchaEnabled) {
                this.getCode();
              }
            });
        }
      });
    },
  },
};
</script>

<style lang="scss">
.login {
  --left-back: url("@/assets/image/user/登录背景插画.png");
  --left-back-color: #f1f5fc;
  --background-color-base: #ffffff;

  --right-back-color: var(--background-color-base);

  overflow: hidden;
  width: 100vw;
  height: 100vh;
  color: var(--color-text-primary);
  background-color: var(--background-color-base);
}

[data-theme="dark"] .login {
  --left-back: url("@/assets/image/user/登录背景插画.dark.png");
  --left-back-color: #121a31;
  --background-color-base: #000000;
}

.login_header {
  height: 64px;
  background: var(--background-color-base);
  box-shadow: var(--box-shadow);
  border-radius: 0px 0px 0px 0px;
  display: flex;
  align-items: center;
  padding: 0 60px;
  gap: 24px;

  position: relative;
  z-index: 20;
}

.login_header .title {
  font-weight: 600;
  font-size: 18px;
  margin-right: auto;
}

.login_header .select {
  width: 120px;
}

.login_header .btn_text {
  font-weight: 400;
  font-size: 14px;
  color: var(--color-text-primary);
}

.login_body {
  width: 100%;
  height: calc(100vh - 64px);
  display: flex;
  align-items: stretch;
}

.login_body .left {
  width: 0;
  flex: 1;
  display: block;

  background-image: var(--left-back);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--left-back-color);
}

.login_body .right {
  position: relative;
  box-sizing: border-box;
  height: 100%;
  width: 45%;
  max-width: 600px;
  min-width: 400px;

  background-color: var(--right-back-color);

  display: flex;
  flex-direction: column;
  /* justify-content: safe center;
  align-items: safe center; */
  overflow: auto;

  padding: 40px;
}

.login_form_box {
  height: 0;
  flex: 1;

  display: flex;
  flex-direction: column;
  justify-content: safe center;
  align-items: safe center;
}

@media screen and (max-width: 670px) {
  .login_body .right {
    max-width: 100%;
    width: 100%;
  }
}

.login_form {
  width: 100%;
  max-width: 400px;
  min-width: 300px;
  display: block;
  position: relative;
  margin: auto;
}

.login_form .title {
  font-weight: 500;
  font-size: 32px;
}
.login_form .code_box {
  display: flex;
  gap: 20px;
}
.code_box .login-code-img {
  display: block;
  height: 40px;
}

.login_form .submit_button {
  width: 100%;
  margin: 0;
  display: block;
}

.register_box {
  display: flex;
  justify-content: space-between;
}

.register_box .sendEmail {
  font-weight: 400;
  font-size: 12px;
  color: var(--color-info);
}

.register_box .register {
  font-weight: 400;
  font-size: 12px;
  color: var(--color-info);
  display: flex;
  align-items: center;
}
.register_box .register a {
  color: var(--color-primary);
}

.copy {
  font-weight: 400;
  font-size: 12px;
  --color-white: var(--color-text-primary);
}
</style>
