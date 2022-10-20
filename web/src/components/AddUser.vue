<script>
import { Icon } from "@vicons/utils";
import { Plus, X } from "@vicons/tabler";
import { useMessage } from "naive-ui";
import { getFunctions, httpsCallable } from "firebase/functions";

export default {
  setup() {
    return {
      message: useMessage(),
    };
  },
  data() {
    return {
      email: "",
      password: "",
      loadButton: false,
    };
  },
  components: {
    Icon,
    X,
    Plus,
  },
  props: {
    closeModal: {},
    refetch: {},
  },
  methods: {
    async createUser() {
      this.loadButton = true;
      const functions = getFunctions();
      const newUser = httpsCallable(functions, "newUser");
      newUser({ email: this.email, password: this.password })
        .then((res) => {
          this.message.success("User Created");
          this.refetch();
          this.closeModal();
        })
        .catch((e) => {
          console.log(e);
          this.message.error("User Creating Failed");
          this.loadButton = false;
        });
    },
  },
};
</script>
                
        <template>
  <n-card
    size="huge"
    style="max-width: 100%; width: 450px; border-radius: 1rem"
  >
    <n-button
      secondary
      circle
      type="error"
      style="position: absolute; top: 1.35rem; right: 1.8rem"
      @click="closeModal"
    >
      <template #icon>
        <Icon><X /></Icon>
      </template>
    </n-button>
    <h1 style="margin: 0; padding-left: 5px">New User</h1>

    <n-p style="margin-bottom: 8px; margin-left: 0.5rem; margin-top: 12px"
      >Email</n-p
    >
    <n-input round placeholder="Email" v-model:value="email" />
    <n-p style="margin-bottom: 8px; margin-left: 0.5rem; margin-top: 12px"
      >Psasword</n-p
    >
    <n-input
      type="password"
      show-password-on="click"
      round
      v-model:value="password"
      placeholder="Password"
    >
    </n-input>
    <div
      style="
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-top: 1.5rem;
        margin-bottom: 10px;
      "
    >
      <n-button
        type="success"
        ghost
        round
        @click="createUser"
        :loading="loadButton"
        :disabled="email == '' || password == ''"
        ><template #icon>
          <Icon>
            <Plus />
          </Icon>
        </template>
        Create
      </n-button>
    </div>
  </n-card>
</template>
                
        <style scoped>
.keyGroupHeader {
  width: 100%;
  border-bottom: 1px solid #555;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.changeEditButton {
  margin-top: 8px;
  margin-left: 0.5rem;
}
</style>