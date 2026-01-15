<template>
  <div class="login">
    <div class="login_header">
      <div class="title">{{ $l("header_title") }}</div>
      <el-select class="select" v-model="page_language" size="mini" @change="handleChangeLanguage">
        <el-option label="简体中文" value="zh-CN" />
        <el-option label="English" value="en-US" />
      </el-select>
      <!-- <a class="btn_text">资料下载</a>
      <a class="btn_text">注销</a> -->
    </div>
    <div class="login_body">
      <img class="left" src="@/assets/image/login/登录背景插画.png" />
      <div class="right">
        <div class="login_form_box">
          <el-form class="login_form" :model="loginForm" ref="loginForm" label-position="top">
            <el-form-item label-width="0">
              <div class="title">{{ $l("form_title") }}</div>
            </el-form-item>
            <el-form-item :label="$l('header_btn2_label')" prop="username">
              <el-input v-model="loginForm.username" auto-complete="off" :placeholder="$l('header_btn2_placeholder')"></el-input>
            </el-form-item>
            <el-form-item :label="$l('form_password_label')" prop="password">
              <el-input v-model="loginForm.password" :placeholder="$l('form_password_placeholder')" auto-complete="off" type="password" @keyup.enter.native="handleLogin"></el-input>
            </el-form-item>
            <el-form-item :label="$l('form_code_label')" prop="code" v-if="captchaEnabled">
              <div class="code_box">
                <el-input v-model="loginForm.code" :placeholder="$l('form_code_placeholder')" @keyup.enter.native="handleLogin"></el-input>
                <img class="login-code-img" :src="codeUrl" @click="getCode" />
              </div>
            </el-form-item>
            <el-form-item label-width="0">
              <el-checkbox v-model="loginForm.rememberMe" auto-complete="off" style="margin: 0px 0px 5px 0px">{{ $l("form_save_password") }}</el-checkbox>
              <el-button class="submit_button" type="primary" :loading="loading" @click.native.prevent="handleLogin">
                <span v-if="!loading">{{ $l("form_submit") }}</span>
                <span v-else>{{ $l("form_submitting") }}</span>
              </el-button>
            </el-form-item>
            <el-form-item label-width="0">
              <div class="register_box">
                <a class="sendEmail" href="#/forgetPasswork">{{ $l("form_forgetPasswork") }}</a>
                <span class="register"
                  ><span>{{ $l("form_register_text1") }}</span
                  ><a href="#/register">{{ $l("form_register_text2") }}</a></span
                >
              </div>
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
    "zh-CN":"欢迎登录",
    "en-US":"Welcome to log in",
  },
  "header_btn2_label": {
    "zh-CN":"用户名", 
    "en-US":"Username", 
  },
  "header_btn2_placeholder": {
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
  "form_code_label": {
    "zh-CN":"验证码", 
    "en-US":"Code", 
  },
  "form_code_placeholder": {
    "zh-CN":"请输入验证码" ,
    "en-US":"Please enter code" ,
  },
  "form_email_label": {
    "zh-CN":"电子邮箱", 
    "en-US":"E-mail", 
  },
  "form_email_placeholder": {
    "zh-CN":"请输入电子邮箱号码" ,
    "en-US":"Please enter E-mail" ,
  },
  "form_save_password": {
    "zh-CN":"记住密码",
    "en-US":"Remember password",
  },
  "form_submit": {
    "zh-CN":"登 录",
    "en-US":"Login",
  },
  "form_submitting": {
    "zh-CN":"登 录 中...",
    "en-US":"Logging in..",
  },
  "form_forgetPasswork": {
    "zh-CN":"忘记密码？",
    "en-US":"Forgot password?",
  },
  "form_register_text1": {
    "zh-CN":"没有账号？", 
    "en-US":"No account?", 
  },
  "form_register_text2": {
    "zh-CN":"立即注册" ,
    "en-US":"Register Now" ,
  },
}
</language>

<script>
import { getUrlParams } from "@/utils/utils";
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/my_jsencrypt";

export default {
  name: "Login",
  data() {
    return {
      title: process.env.VUE_APP_TITLE,
      codeUrl: "",
      loginForm: {
        username: "admin",
        password: "admin123",
        rememberMe: false,
        code: "",
        uuid: "",
      },
      loginRules: {
        username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
        password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }],
      },
      loading: false,
      // 验证码开关
      captchaEnabled: true,
      // 注册开关
      register: false,
      redirect: undefined,
    };
  },
  created() {
    this.getCode();
    this.getCookie();
    this.redirect = decodeURIComponent(getUrlParams(window.location.href).redirect || "/pt.html#/");
    console.log(this.redirect);
  },
  methods: {
    handleChangeLanguage(lan) {
      this.setLanguage(lan);
    },
    getCode() {
      getCodeImg().then((res) => {
        this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled;
        if (this.captchaEnabled) {
          this.codeUrl = "data:image/gif;base64," + res.img;
          this.loginForm.uuid = res.uuid;
        }
      });
    },
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get("rememberMe");
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
      };
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 });
            Cookies.set("password", encrypt(this.loginForm.password), { expires: 30 });
            Cookies.set("rememberMe", this.loginForm.rememberMe, { expires: 30 });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove("rememberMe");
          }
          this.$store
            .dispatch("Login", this.loginForm)
            .then(() => {
              // this.$router.push({ path: this.redirect || "/" }).catch(() => {});
              window.location.href = this.redirect; //+ `?token=${this.$store.state.user.token}`;
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
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  color: var(--color-text-primary);
}
.login_header {
  height: 64px;
  background: var(--color-white);
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
  object-fit: contain;
  background-color: #f1f5fc;

  background-color: var(--background-color-light);

  // filter: var(--image-filter-invert10);
}

.login_body .right {
  position: relative;
  box-sizing: border-box;
  height: 100%;
  width: 45%;
  max-width: 600px;
  min-width: 400px;

  background-color: var(--color-white);

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
  width: 35%;
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
}
.register_box .register a {
  color: var(--color-primary);
}

.copy {
  text-align: center;
  margin-top: 40px;
  font-weight: 400;
  font-size: 12px;
  color: var(--color-info);
  line-height: 20px;
}
.copy a {
  color: var(--color-primary);
}
</style>
