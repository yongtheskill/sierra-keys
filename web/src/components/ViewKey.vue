<template>
  <n-card size="huge" style="border-radius: 1rem" class="container">
    <div
      style="
        display: flex;
        justify-content: space-between;
        flex-direction: row-reverse;
        align-items: center;
        margin-bottom: 15px;
      "
    >
      <n-button secondary circle type="error" @click="closeModal">
        <template #icon>
          <Icon><X /></Icon>
        </template>
      </n-button>
      <h1
        style="margin: 0; padding-left: 5px; display: flex; align-items: center"
      >
        <Icon size="36" style="padding-top: 3px; padding-right: 6px"
          ><Key /></Icon
        >{{ vkey.name }}
      </h1>
    </div>
    <n-scrollbar style="max-height: 70vh; overflow-y: auto" trigger="none">
      <n-data-table
        :columns="columns"
        :data="transactions"
        :bordered="true"
        :single-line="false"
      />
    </n-scrollbar>
  </n-card>
</template>

<script>
import {
  collection,
  onSnapshot,
  getFirestore,
  where,
  query,
  orderBy,
} from "firebase/firestore";
import { Icon } from "@vicons/utils";
import { Key, X } from "@vicons/tabler";
import { useMessage } from "naive-ui";
import { fromUnixTime, format } from "date-fns";

export default {
  setup() {
    return {
      message: useMessage(),
    };
  },
  async mounted() {
    const db = getFirestore();
    this.unsub = onSnapshot(
      query(
        collection(db, "transactions"),
        where("keyId", "==", this.vkey.id),
        orderBy("time", "desc")
      ),
      (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const transaction = doc.data();
          if (transaction.time == null) {
            transaction.time = {
              seconds: Math.floor(new Date().getTime() / 1000),
            };
          }
          this.transactions.push(doc.data());
        });
      }
    );
  },
  unmounted() {
    this.unsub();
  },
  methods: {
    formatDate(unix) {
      return format(fromUnixTime(unix), "dd.LL.yy HH:mm");
    },
  },
  data() {
    return {
      newCollectionName: "",
      loadButton: false,
      transactions: [],
      unsub: {},
      columns: [
        {
          title: "Timestamp",
          key: "time",
          render(row) {
            return format(fromUnixTime(row.time.seconds), "dd-LL-yy HH:mm");
          },
        },
        {
          title: "Action",
          key: "isDrawing",
          render(row) {
            if (row.isDrawing) {
              return "Draw";
            }
            return "Return";
          },
        },
        { title: "Name", key: "name" },
        {
          title: "NRIC",
          key: "nric",
          render(row) {
            return row.nric;
          },
        },
      ],
    };
  },
  components: {
    Icon,
    Key,
    X,
  },
  props: {
    closeModal: {},
    vkey: {},
  },
};
</script>
            
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