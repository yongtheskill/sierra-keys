<template>
  <n-steps :current="currentStep" :status="status">
    <n-step title="NRIC">
      <div class="stepsInput">
        <n-input
          round
          placeholder="NRIC Number"
          :disabled="currentStep !== 1"
          v-model:value="nric"
          ref="nricStep"
        />
      </div>
    </n-step>
    <n-step title="Rank & Name">
      <div class="stepsInput">
        <n-input-group>
          <n-input
            round
            placeholder="Rank and Name"
            :disabled="currentStep < 2 || status == 'wait' || currentStep > 3"
            v-model:value="name"
            ref="nameStep"
          />
          <n-button
            round
            secondary
            type="success"
            :disabled="status == 'wait'"
            v-if="currentStep == 2"
            @click="nameDone"
            ><template #icon>
              <Icon><CircleCheck /></Icon></template
          ></n-button>
        </n-input-group>
      </div>
    </n-step>
    <n-step title="Scan Key">
      <div class="stepsInput">
        <n-input
          round
          placeholder="Key Code"
          :disabled="currentStep != 3"
          v-model:value="keyCode"
          ref="codeStep"
        />
      </div>
    </n-step>
    <n-step :title="finalSignMessage">
      <n-button
        round
        secondary
        strong
        type="success"
        :disabled="currentStep != 4"
        @click="signKey"
        >{{ finalSignButton }}</n-button
      >
    </n-step>
  </n-steps>
  <n-divider dashed>
    <n-button
      secondary
      type="error"
      round
      @click="restart"
      :disabled="preventRestart"
      ><template #icon>
        <Icon>
          <Rotate />
        </Icon> </template
      >Restart</n-button
    >
  </n-divider>
  <keyboard-events v-on:keydown="keyboardEvent"></keyboard-events>
</template>

<script>
import {
  getFirestore,
  collection,
  where,
  getDocs,
  limit,
  query,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { Icon } from "@vicons/utils";
import { Rotate, CircleCheck } from "@vicons/tabler";
import { useMessage } from "naive-ui";

export default {
  setup() {
    return {
      message: useMessage(),
    };
  },
  props: {
    keysObj: {},
  },
  components: {
    Icon,
    Rotate,
    CircleCheck,
  },
  data() {
    return {
      currentStep: 1,
      status: "process",
      nric: "",
      name: "",
      keyCode: "",
      signingKey: {},
      preventRestart: false,
      doFocusNric: false,
    };
  },
  updated() {
    if (this.doFocusNric) {
      this.doFocusNric = false;
      this.$refs.nricStep.focus();
    }
  },
  computed: {
    finalSignMessage() {
      if (
        this.signingKey &&
        Object.keys(this.signingKey).length === 0 &&
        this.signingKey.constructor === Object
      ) {
        return "Sign In/Out";
      }
      if (this.signingKey.isDrawn) {
        return "Sign In " + this.signingKey.name;
      }
      return "Sign Out " + this.signingKey.name;
    },
    finalSignButton() {
      if (
        this.signingKey &&
        Object.keys(this.signingKey).length === 0 &&
        this.signingKey.constructor === Object
      ) {
        return "Sign";
      }
      if (this.signingKey.isDrawn) {
        return "Sign In";
      }
      return "Sign Out";
    },
  },
  methods: {
    keyboardEvent(e) {
      if (e.code === "Enter" && this.currentStep == 4) {
        this.signKey();
      }
    },
    async signKey() {
      this.preventRestart = true;
      const db = getFirestore();
      const isDrawn = this.signingKey.isDrawn;
      console.log(this.signingKey.id);
      setDoc(
        doc(db, "cadets", this.nric),
        {
          name: this.name,
          nric: this.nric,
        },
        { merge: true }
      );
      if (isDrawn) {
        setDoc(
          doc(
            db,
            "keyGroups",
            this.signingKey.keyGroupId,
            "keys",
            this.signingKey.id
          ),
          {
            lastReturned: serverTimestamp(),
            drawnBy: { name: this.name, nric: this.nric },
            isDrawn: false,
          },
          { merge: true }
        );
      } else {
        setDoc(
          doc(
            db,
            "keyGroups",
            this.signingKey.keyGroupId,
            "keys",
            this.signingKey.id
          ),
          {
            lastDrawn: serverTimestamp(),
            drawnBy: { name: this.name, nric: this.nric },
            isDrawn: true,
          },
          { merge: true }
        );
      }
      addDoc(collection(db, "transactions"), {
        isDrawing: !isDrawn,
        keyId: this.signingKey.id,
        keyName: this.signingKey.name,
        name: this.name,
        nric: this.nric,
        time: serverTimestamp(),
      })
        .then(() => {
          let msg = "Signed out " + this.signingKey.name;
          if (isDrawn) {
            msg = "Signed in " + this.signingKey.name;
          }
          this.message.success(msg);
          this.restart();
          this.preventRestart = false;
        })
        .catch((e) => {
          this.message.error("Error signing for key, please try again");
          this.restart();
          this.preventRestart = false;
        });
    },
    nameDone() {
      this.currentStep = 3;
    },
    restart() {
      this.currentStep = 1;
      this.status = "process";
      this.nric = "";
      this.name = "";
      this.keyCode = "";
      this.signingKey = {};
      this.doFocusNric = true;
      this.$refs.nricStep.focus();
    },
  },
  watch: {
    async nric(n) {
      this.nric = this.nric.toUpperCase();
      if (n.length >= 9) {
        this.nric = this.nric.slice(0, 9);
        this.currentStep = 2;
        this.status = "wait";

        const db = getFirestore();
        const cadet = await getDocs(
          query(
            collection(db, "cadets"),
            where("nric", "==", this.nric),
            limit(1)
          )
        );
        this.status = "process";
        if (cadet.empty) {
          this.$refs.nameStep.focus();
          return;
        }
        this.$refs.codeStep.focus();
        this.name = cadet.docs[0].data().name;
        this.currentStep = 3;
      }
    },
    keyCode(n) {
      if (this.keysObj.hasOwnProperty(n)) {
        this.currentStep = 4;
        this.signingKey = this.keysObj[n];
      }
    },
  },
};
</script>

<style scoped>
.stepsInput {
  padding-right: 20px;
}
</style>