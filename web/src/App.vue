<script>
import { darkTheme } from "naive-ui";
import { Icon } from "@vicons/utils";
import { Key, Menu2, List, Home, User } from "@vicons/tabler";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { NIcon } from "naive-ui";
import { RouterLink } from "vue-router";

const accessOptions = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            path: "/",
          },
          style: {
            paddingRight: "30px",
          },
        },
        { default: () => "Home" }
      ),
    key: "home",
    icon: renderIcon(Home),
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            path: "/transactions",
          },
          style: {
            paddingRight: "30px",
          },
        },
        { default: () => "All Transactions" }
      ),
    key: "transactions",
    icon: renderIcon(List),
  },
];

const adminOptions = [
  ...accessOptions,
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            path: "/users",
          },
          style: {
            paddingRight: "30px",
          },
        },
        { default: () => "Manage Users" }
      ),
    key: "transactions",
    icon: renderIcon(User),
  },
];

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

export default {
  setup() {
    return {
      darkTheme,
    };
  },
  mounted() {
    const auth = getAuth();
    const database = getDatabase();
    let callback = null;
    let metadataRef = null;
    onAuthStateChanged(auth, (user) => {
      // On user login add new listener.
      if (user) {
        this.loggedIn = true;
        // Check if refresh is required.
        metadataRef = ref(database, "metadata/" + user.uid + "/refreshTime");
        callback = (snapshot) => {
          // Force refresh to pick up the latest custom claims changes.
          // Note this is always triggered on first call. Further optimization could be
          // added to avoid the initial trigger when the token is issued and already contains
          // the latest claims.
          user.getIdToken(true);
        };
        // Subscribe new listener to changes on that node.
        onValue(metadataRef, callback);
        auth.currentUser
          .getIdTokenResult()
          .then((idTokenResult) => {
            if (!!idTokenResult.claims.admin) {
              this.admin = true;
              this.options = adminOptions;
            } else {
              this.admin = false;
              this.options = accessOptions;
            }
            if (!!idTokenResult.claims.access) {
              this.access = true;
            } else {
              this.access = false;
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        if (this.$route.path !== "/login") {
          this.$router.push("/login");
        }
        this.loggedIn = false;
      }
    });
  },
  data() {
    return {
      loggedIn: false,
      access: false,
      admin: false,
      options: accessOptions,
    };
  },
  components: {
    Icon,
    Key,
    Menu2,
  },
};
</script>

<template>
  <n-message-provider>
    <n-config-provider :theme="darkTheme">
      <header>
        <nav class="container">
          <n-page-header>
            <template #title>
              <a
                href="https://swgkeys.web.app/"
                style="text-decoration: none; color: inherit"
              >
                <n-space align="center"
                  ><Icon class="titleIcon" size="30"><Key /></Icon>
                  <h2>SWG Keys</h2>
                </n-space>
              </a>
            </template>
            <template #extra>
              <n-space>
                <router-link
                  to="/login"
                  style="text-decoration: none"
                  v-if="!loggedIn"
                >
                  <n-button type="success" ghost round>Login</n-button>
                </router-link>
                <router-link to="/logout" style="text-decoration: none" v-else>
                  <n-button type="error" ghost round>Logout</n-button>
                </router-link>
                <n-popover
                  trigger="hover"
                  raw
                  :show-arrow="false"
                  placement="bottom-end"
                  v-if="access"
                >
                  <template #trigger>
                    <n-button :bordered="false" style="padding: 0 4px">
                      <template #icon>
                        <n-icon>
                          <Menu2 />
                        </n-icon>
                      </template>
                    </n-button>
                  </template>

                  <n-menu
                    :options="options"
                    style="backdrop-filter: blur(5px) brightness(90%)"
                  />
                </n-popover>
              </n-space>
            </template>
          </n-page-header>
        </nav>
      </header>

      <div class="container">
        <RouterView />
      </div>
    </n-config-provider>
  </n-message-provider>
</template>

<style scoped>
.titleIcon {
  margin-top: 11px;
}
</style>

<style>
.container {
  margin: 0 auto;
  max-width: 1280px;
  width: 90%;
}

@media only screen and (min-width: 601px) {
  .container {
    width: 85%;
  }
}

@media only screen and (min-width: 993px) {
  .container {
    width: 70%;
  }
}
</style>
