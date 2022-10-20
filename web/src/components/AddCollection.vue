<script>
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { Icon } from "@vicons/utils";
import { FolderPlus, X } from "@vicons/tabler";
import { useMessage } from "naive-ui";

export default {
  setup() {
    return {
      message: useMessage(),
    };
  },
  data() {
    return {
      newCollectionName: "",
      loadButton: false,
    };
  },
  components: {
    Icon,
    FolderPlus,
    X,
  },
  props: {
    closeModal: {},
  },
  methods: {
    async addCollection() {
      if (this.newCollectionName == "") {
        this.message.error("Please enter a name.");
        return;
      }
      this.loadButton = true;
      const db = getFirestore();
      await addDoc(collection(db, "keyGroups"), {
        name: this.newCollectionName,
      })
        .then(() => {
          this.message.success("Key Collection Created");
          this.closeModal();
        })
        .catch(() => {
          this.message.error("Error Creating Collection");
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
    <h1 style="margin: 0; padding-left: 5px">Add Key Collection</h1>

    <n-p style="margin-bottom: 8px; margin-left: 0.5rem; margin-top: 12px"
      >Key Collection Name</n-p
    >
    <n-input
      round
      placeholder="Collection Name"
      v-model:value="newCollectionName"
    />
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
        @click="addCollection"
        :loading="loadButton"
        ><template #icon>
          <Icon>
            <FolderPlus />
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