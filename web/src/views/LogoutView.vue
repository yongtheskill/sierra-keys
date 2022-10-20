<script>
import { getAuth, signOut } from "firebase/auth";
import { useMessage } from "naive-ui";
import { Icon } from "@vicons/utils";
import { BrandGoogle } from "@vicons/tabler";
const auth = getAuth();

export default {
  setup() {
    return {
      message: useMessage(),
    };
  },
  mounted() {
    signOut(auth)
      .then(() => {
        const message = useMessage();
        this.message.success("Logged out!");
        this.$router.push("/login");
      })
      .catch((error) => {
        const message = useMessage();
        console.log(error);
        this.message.error("Not signed in!");
        this.$router.push("/login");
      });
  },

  components: {
    Icon,
    BrandGoogle,
  },
};
</script>

<template>
  <div class="logoutContainer">
    <n-space>
      <h1 style="padding-right: 1rem; margin: 0; margin-top: 0">Logging out</h1>
      <n-spin size="large" style="padding-top: 6px" />
    </n-space>
  </div>
</template>
  
<style scoped>
.logoutContainer {
  width: 100%;
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
  