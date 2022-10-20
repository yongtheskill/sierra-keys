<script>
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useMessage } from "naive-ui";
import { Icon } from "@vicons/utils";
import { BrandGoogle } from "@vicons/tabler";

export default {
  setup() {
    const formRef = ref(null);
    const message = useMessage();
    const router = useRouter();
    const loadingRef = ref(false);
    return {
      formRef,
      loading: loadingRef,
      size: "large",
      formValue: ref({
        email: "",
        password: "",
      }),
      rules: {
        email: {
          required: true,
          message: "Please input your email",
          trigger: "blur",
        },
        password: {
          required: true,
          message: "Please enter your password",
          trigger: ["input", "blur"],
        },
      },
      handleValidateClick(e) {
        e.preventDefault();
        loadingRef.value = true;
        formRef.value?.validate((errors) => {
          if (!errors) {
            const auth = getAuth();
            signInWithEmailAndPassword(
              auth,
              formRef.value?.model.email,
              formRef.value?.model.password
            )
              .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log(user);
                message.success("Logged In as " + user.email);
                router.push("/");
              })
              .catch((error) => {
                message.error("Invalid Credentials");
                loadingRef.value = false;
              });
          } else {
            message.error("Invalid credentials");
            loadingRef.value = false;
          }
        });
      },
      googleSignIn() {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
          .then((result) => {
            const user = result.user;
            message.success("Logged In as " + user.email);
            router.push("/");
          })
          .catch((error) => {
            message.error("Error signing in");
          });
      },
    };
  },
  components: {
    Icon,
    BrandGoogle,
  },
};
</script>

<template>
  <n-card size="huge" class="loginContainer">
    <template #header>
      <h2 style="margin: 0">Login</h2>
    </template>
    <n-form
      ref="formRef"
      :label-width="80"
      :model="formValue"
      :rules="rules"
      :size="size"
    >
      <n-form-item label="Email" path="email" class="formInput">
        <n-input round v-model:value="formValue.email" placeholder="Email" />
      </n-form-item>
      <n-form-item label="Password" path="password" class="formInput">
        <n-input
          type="password"
          show-password-on="click"
          round
          v-model:value="formValue.password"
          placeholder="Password"
        />
      </n-form-item>
      <n-form-item style="width: 100%">
        <n-button
          @click="handleValidateClick"
          type="success"
          round
          :loading="loading"
          attr-type="submit"
        >
          Login
        </n-button>
      </n-form-item>
      <h4 style="text-align: center; margin: 0">OR</h4>
      <n-form-item style="width: 100%">
        <n-button
          @click="googleSignIn"
          type="info"
          round
          :disabled="loading"
          attr-type="submit"
        >
          Continue with Google
          <template #icon>
            <Icon style="padding-right: 15px; padding-bottom: 1px" size="23"
              ><BrandGoogle
            /></Icon>
          </template>
        </n-button>
      </n-form-item>
    </n-form>
  </n-card>
</template>
  
<style scoped>
.loginContainer {
  margin: 2rem auto;
  max-width: 100%;
  width: 450px;
  border-radius: 1rem;
}
.n-button {
  width: 100%;
}
</style>
  