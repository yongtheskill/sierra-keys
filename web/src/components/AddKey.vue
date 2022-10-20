<script>
import {
  getFirestore,
  collection,
  collectionGroup,
  serverTimestamp,
  addDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { Icon } from "@vicons/utils";
import { Plus, X, Check, ArrowBigRight } from "@vicons/tabler";
import { useMessage } from "naive-ui";

const debounce = (func) => {
  const timeout = 1000;
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

export default {
  setup() {
    return {
      message: useMessage(),
    };
  },
  data() {
    return {
      newKeyName: "",
      newKeyCode: "",
      loadCodeValidation: false,
      keyCodeValidated: false,
      loadButton: false,
    };
  },
  watch: {
    newKeyCode() {
      this.loadCodeValidation = true;
      this.keyCodeValidated = false;
      this.debounceCode(this);
    },
  },
  components: {
    Icon,
    Plus,
    Check,
    X,
    ArrowBigRight,
  },
  props: {
    closeModal: {},
    keyGroup: "",
  },
  methods: {
    async validateCode() {
      if (this.newKeyCode == "") {
        this.loadCodeValidation = false;
        this.keyCodeValidated = false;
        return;
      }
      const db = getFirestore();
      const existingKey = await getDocs(
        query(
          collectionGroup(db, "keys"),
          where("code", "==", this.newKeyCode),
          limit(1)
        )
      );
      this.loadCodeValidation = false;
      if (existingKey.empty) {
        this.keyCodeValidated = true;
        return;
      }
      this.keyCodeValidated = false;
    },
    debounceCode: debounce((th) => {
      th.validateCode();
    }),
    async addKey() {
      if (this.newKeyName == "") {
        this.message.error("Please enter a name.");
        return;
      }
      if (this.newKeyCode == "") {
        this.message.error("Please enter a key code.");
        return;
      }
      this.loadButton = true;
      const db = getFirestore();
      await addDoc(collection(db, "keyGroups", this.keyGroup.id, "keys"), {
        name: this.newKeyName,
        code: this.newKeyCode,
        isDrawn: false,
        lastDrawn: serverTimestamp(),
        lastReturned: serverTimestamp(),
        drawnBy: {
          nric: "-",
          name: "-",
        },
      })
        .then(() => {
          this.message.success("Key Created");
          this.closeModal();
        })
        .catch(() => {
          this.message.error("Error Creating Key");
          this.closeModal();
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
    <h1 style="margin: 0; padding-left: 5px">Add Key</h1>
    <h4
      style="
        margin-top: 0;
        padding-left: 6px;
        display: flex;
        align-items: center;
      "
    >
      <Icon style="padding-top: 0.5px; padding-right: 3px"
        ><ArrowBigRight
      /></Icon>
      {{ keyGroup.name }}
    </h4>

    <n-p style="margin-bottom: 8px; margin-left: 0.5rem; margin-top: 12px"
      >Key Name</n-p
    >
    <n-input round placeholder="Key Name" v-model:value="newKeyName" />
    <n-p style="margin-bottom: 8px; margin-left: 0.5rem; margin-top: 12px"
      >Key Code</n-p
    >
    <n-popover
      trigger="manual"
      :show="!loadCodeValidation && !keyCodeValidated && newKeyCode != ''"
      placement="bottom-start"
    >
      <template #trigger>
        <n-input round placeholder="Key Code" v-model:value="newKeyCode">
          <template #suffix>
            <n-spin :size="15" v-if="loadCodeValidation" />
            <n-icon color="rgb(99, 226, 183)" v-else-if="keyCodeValidated">
              <Check />
            </n-icon>
            <n-icon color="rgb(232, 128, 128)" v-else-if="newKeyCode != ''">
              <X />
            </n-icon>
          </template>
        </n-input>
      </template>
      <span>Code already in use!</span>
    </n-popover>
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
        @click="addKey"
        :loading="loadButton"
        :disabled="newKeyName == '' || !keyCodeValidated"
        ><template #icon>
          <Icon>
            <Plus />
          </Icon>
        </template>
        Add
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