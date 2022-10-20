<template>
  <h1
    style="
      margin: 0;
      padding-left: 5px;
      padding-bottom: 15px;
      display: flex;
      align-items: center;
    "
    @click="getUsers"
  >
    Manage Users
  </h1>

  <n-spin :show="dataLoading">
    <n-data-table
      :columns="columns"
      :data="users"
      :bordered="true"
      :single-line="false"
      style="margin-bottom: 20px"
    />
  </n-spin>
  <div style="width: 100%; display: flex; justify-content: flex-end">
    <n-button
      @click="
        () => {
          showAddUser = true;
        }
      "
      round
      type="success"
      ghost
      style="margin-bottom: 50px"
    >
      <template #icon>
        <Icon>
          <Plus />
        </Icon>
      </template>
      Add User
    </n-button>
  </div>
  <n-modal v-model:show="showAddUser">
    <AddUser
      :closeModal="
        () => {
          showAddUser = false;
        }
      "
      :refetch="getUsers"
    />
  </n-modal>
</template>
    
<script>
import { Icon } from "@vicons/utils";
import { Key, X, Plus } from "@vicons/tabler";
import { useMessage } from "naive-ui";
import { fromUnixTime, format } from "date-fns";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { NSelect, NButton } from "naive-ui";

export default {
  setup() {
    return {
      message: useMessage(),
    };
  },
  mounted() {
    this.getUsers();

    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.loggedIn = true;
        this.user = user;
      }
    });
  },
  methods: {
    formatDate(unix) {
      return format(fromUnixTime(unix), "dd.LL.yy HH:mm");
    },
    async getUsers() {
      this.dataLoading = true;
      const functions = getFunctions();
      const listUsers = httpsCallable(functions, "listAllUsers");
      listUsers()
        .then((res) => {
          this.users = res.data.users;
          this.users.forEach((user) => {
            if (!user.customClaims) {
              user.customClaims = { admin: false, access: false };
            }
          });
          this.users.sort((a, b) => {
            if (a.email < b.email) {
              return -1;
            }
            if (a.email > b.email) {
              return 1;
            }
            return 0;
          });
          this.dataLoading = false;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async editRole(uid, role, row) {
      const functions = getFunctions();
      const alterRole = httpsCallable(functions, "alterRole");
      alterRole({ uid, role })
        .then((res) => {
          row.isLoadingRole = false;
        })
        .catch((e) => {
          console.log(e);
          row.isLoadingRole = false;
        });
    },
    async doDeleteUser(row) {
      row.deleteLoading = true;
      const functions = getFunctions();
      const deleteUser = httpsCallable(functions, "deleteUser");
      deleteUser({ uid: row.uid })
        .then((res) => {
          const i = this.users.findIndex((e) => e.uid == row.uid);
          this.users.splice(i, 1);
        })
        .catch((e) => {
          console.log(e);
          row.deleteLoading = false;
        });
    },
  },
  data() {
    var self = this;
    return {
      showAddUser: false,
      dataLoading: true,
      users: [],
      user: { uid: "" },
      columns: [
        {
          title: "Identifier",
          key: "email",
        },
        {
          title: "Created",
          key: "metadata.creationTime",
          render(row) {
            return format(
              new Date(row.metadata.creationTime),
              "dd-LL-yy HH:mm"
            );
          },
        },
        {
          title: "Signed In",
          key: "metadata.lastSignInTime",
          render(row) {
            return format(
              new Date(row.metadata.lastSignInTime),
              "dd-LL-yy HH:mm"
            );
          },
        },
        {
          title: "Role",
          key: "customClaims",
          render(row) {
            let dVal = "non";
            if (row.customClaims.admin) {
              dVal = "admin";
            } else if (row.customClaims.access) {
              dVal = "user";
            }
            const selectH = h(NSelect, {
              options: [
                { label: "Admin", value: "admin" },
                { label: "User", value: "user" },
                { label: "None", value: "non" },
              ],
              "default-value": dVal,
              loading: row.isLoadingRole,
              disabled: row.isLoadingRole || row.uid === self.user.uid,
              onUpdateValue(v) {
                row.isLoadingRole = true;
                self.editRole(row.uid, v, row);
              },
            });
            return selectH;
          },
        },
        {
          title: "Action",
          key: "actions",
          render(row) {
            return h(
              NButton,
              {
                strong: true,
                tertiary: true,
                size: "small",
                type: "error",
                loading: row.deleteLoading,
                disabled: row.deleteLoading || row.uid === self.user.uid,
                onClick: () => {
                  self.doDeleteUser(row);
                },
              },
              { default: () => "Delete" }
            );
          },
        },
      ],
    };
  },
  components: {
    Icon,
    Key,
    X,
    Plus,
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