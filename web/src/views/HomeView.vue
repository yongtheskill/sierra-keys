<script>
import { getAuth, onAuthStateChanged } from "@firebase/auth";

export default {
  data() {
    return {
      loggedIn: false,
      access: false,
    };
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.loggedIn = true;
        user
          .getIdTokenResult()
          .then((idTokenResult) => {
            if (!!idTokenResult.claims.access) {
              this.access = true;
            } else {
              this.access = false;
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  },
};
</script>

<template>
  <main v-if="loggedIn">
    <Home v-if="access" />
    <div
      style="
        width: 100%;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        z-index: -99;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      "
      v-else
    >
      <h1 style="margin-bottom: 0">
        Your account has not been granted access.
      </h1>
      <h3 style="margin-top: 0; font-weight: 400; color: #ccc">
        Please contact an administrator for access.
      </h3>
    </div>
  </main>
</template>
