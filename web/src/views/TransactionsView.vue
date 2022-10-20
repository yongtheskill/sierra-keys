<template>
  <h1
    style="
      margin: 0;
      padding-left: 5px;
      padding-bottom: 15px;
      display: flex;
      align-items: center;
    "
  >
    All Transactions
  </h1>

  <n-data-table
    :columns="columns"
    :data="transactions"
    :bordered="true"
    :single-line="false"
    style="margin-bottom: 50px"
  />
</template>
  
  <script>
import {
  collection,
  onSnapshot,
  getFirestore,
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
      query(collection(db, "transactions"), orderBy("time", "desc")),
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