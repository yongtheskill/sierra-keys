<script>
import {
  collection,
  onSnapshot,
  getFirestore,
  collectionGroup,
  query,
  orderBy,
} from "firebase/firestore";
import { Icon } from "@vicons/utils";
import { Edit, Check, FolderPlus, Plus, Trash } from "@vicons/tabler";
import AddCollection from "./AddCollection.vue";
import KeyDisplay from "./KeyDisplay.vue";
import SignKeys from "./SignKeys.vue";

export default {
  mounted() {
    const db = getFirestore();
    const unsubGroups = onSnapshot(
      query(collection(db, "keyGroups"), orderBy("name")),
      (querySnapshot) => {
        const keyGroups = {};
        querySnapshot.forEach((doc) => {
          keyGroups[doc.id] = { name: doc.data().name, id: doc.id, keys: [] };
        });
        this.keyGroups = keyGroups;
        this.parseKeys();
      }
    );

    const unsubKeys = onSnapshot(
      collectionGroup(db, "keys"),
      (querySnapshot) => {
        this.keyQuerySnapshot = querySnapshot;
        this.parseKeys();
      }
    );
  },
  data() {
    return {
      keyGroups: [],
      keyQuerySnapshot: {},
      editing: false,
      showAddCollection: false,
      addKeyGroup: {},
      showAddKey: false,
      keysObj: {},
      deleteKeyGroup: {},
      showDeleteCollection: false,
    };
  },
  components: {
    Icon,
    Edit,
    Check,
    FolderPlus,
    Plus,
    AddCollection,
    KeyDisplay,
    SignKeys,
    Trash,
  },
  methods: {
    parseKeys() {
      if (this.keyQuerySnapshot.forEach) {
        for (const [, group] of Object.entries(this.keyGroups)) {
          group.keys = [];
        }
        this.keysObj = {};
        this.keyQuerySnapshot.forEach((doc) => {
          const keyData = doc.data();
          if (keyData.lastDrawn == null) {
            keyData.lastDrawn = {
              seconds: Math.floor(new Date().getTime() / 1000),
            };
          }
          if (keyData.lastReturned == null) {
            keyData.lastReturned = {
              seconds: Math.floor(new Date().getTime() / 1000),
            };
          }
          const keyDat = {
            ...keyData,
            keyGroupId: doc.ref.parent.parent.id,
            id: doc.id,
          };
          this.keysObj[keyData.code] = keyDat;
          this.keyGroups[doc.ref.parent.parent.id].keys.push(keyDat);
        });

        for (const [, group] of Object.entries(this.keyGroups)) {
          group.keys.sort((a, b) => {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          });
        }
      }
    },
    closeModals() {
      this.showAddCollection = false;
      this.addKeyGroup = {};
      this.showAddKey = false;
      this.deleteKeyGroup = {};
      this.showDeleteCollection = false;
    },
  },
};
</script>
    
<template>
  <h1>Sign in/out</h1>
  <div>
    <SignKeys :keysObj="keysObj" />
  </div>
  <n-space align="center">
    <h1 @click="parseKeys">Keys</h1>
    <n-button
      size="small"
      round
      v-if="!editing"
      @click="
        () => {
          editing = true;
        }
      "
      class="changeEditButton"
    >
      <template #icon>
        <Icon>
          <Edit />
        </Icon>
      </template>
      Edit
    </n-button>
    <n-button
      size="small"
      round
      v-else
      @click="
        () => {
          editing = false;
        }
      "
      class="changeEditButton"
      type="success"
    >
      <template #icon>
        <Icon>
          <Check />
        </Icon>
      </template>
      Done Editing
    </n-button>
  </n-space>
  <n-space vertical>
    <div v-for="(keyGroup, id) in keyGroups" :key="id">
      <div class="keyGroupHeader">
        <h4 style="margin-bottom: 0.7rem; padding-left: 0.8rem">
          {{ keyGroup.name }}
        </h4>
        <n-space v-if="editing">
          <n-button
            round
            ghost
            type="error"
            size="small"
            style="margin-top: 3px"
            @click="
              () => {
                deleteKeyGroup = keyGroup;
                showDeleteCollection = true;
              }
            "
          >
            <template #icon>
              <Icon>
                <Trash />
              </Icon>
            </template>
            Delete Key Collection
          </n-button>
          <n-button
            round
            ghost
            type="success"
            size="small"
            style="margin-top: 3px"
            @click="
              () => {
                addKeyGroup = keyGroup;
                showAddKey = true;
              }
            "
          >
            <template #icon>
              <Icon>
                <Plus />
              </Icon>
            </template>
            Add Key
          </n-button>
        </n-space>
      </div>
      <div style="padding: 12px 6px">
        <KeyDisplay :keys="keyGroup.keys" :editing="editing" />
      </div>
    </div>
    <div
      style="
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-top: 1rem;
      "
    >
      <n-button
        round
        ghost
        type="success"
        v-if="editing"
        style="margin-bottom: 50px"
        @click="
          () => {
            showAddCollection = true;
          }
        "
      >
        <template #icon>
          <Icon>
            <FolderPlus />
          </Icon>
        </template>
        Add Key Collection
      </n-button>
    </div>
  </n-space>
  <n-modal v-model:show="showAddCollection">
    <AddCollection :closeModal="closeModals" />
  </n-modal>
  <n-modal v-model:show="showAddKey">
    <AddKey :closeModal="closeModals" :keyGroup="addKeyGroup" />
  </n-modal>
  <n-modal v-model:show="showDeleteCollection">
    <DeleteCollection
      :closeModal="closeModals"
      :keyCollection="deleteKeyGroup"
    />
  </n-modal>
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