<script>
import { Icon } from "@vicons/utils";
import { X, Trash } from "@vicons/tabler";
import { useMessage } from "naive-ui";
import { getFirestore, deleteDoc, doc } from "firebase/firestore";

export default {
  setup() {
    return {
      message: useMessage(),
    };
  },
  data() {
    return {
      loadButton: false,
    };
  },
  components: {
    Icon,
    X,
    Trash,
  },
  props: {
    closeModal: {},
    dkey: {},
  },
  methods: {
    async deleteKey() {
      this.loadButton = true;
      const db = getFirestore();
      await deleteDoc(
        doc(db, "keyGroups", this.dkey.keyGroupId, "keys", this.dkey.id)
      );
      this.message.success("Key Deleted");
      this.closeModal();
    },
  },
};
</script>
                        
    <template>
  <n-card
    size="huge"
    style="max-width: 100%; width: 500px; border-radius: 1rem"
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
    <h1 style="margin: 0; padding-left: 5px">Delete Key</h1>

    <n-p style="margin-bottom: 8px; margin-left: 0.5rem; margin-top: 12px">
      The key
      <span style="color: #e88080">{{ dkey.name }}</span> is about to be
      deleted.</n-p
    >
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
        type="error"
        ghost
        round
        @click="deleteKey"
        :loading="loadButton"
        ><template #icon>
          <Icon>
            <Trash />
          </Icon>
        </template>
        Delete
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