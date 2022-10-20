<script>
import { Icon } from "@vicons/utils";
import {
  User,
  CalendarEvent,
  ExternalLink,
  History,
  Trash,
} from "@vicons/tabler";
import { fromUnixTime, format } from "date-fns";

export default {
  props: {
    keys: Array,
    editing: Boolean,
  },
  components: {
    Icon,
    ExternalLink,
    User,
    CalendarEvent,
    History,
    Trash,
  },
  methods: {
    formatDate(unix) {
      return format(fromUnixTime(unix), "dd.LL.yy HH:mm");
    },
    viewKey(key) {
      this.showViewKey = true;
      this.keyToView = key;
    },
    closeKeyView() {
      this.showViewKey = false;
      this.keyToView = {};
    },
    closeModal() {
      this.deleteKey = {};
      this.showDeleteKey = false;
    },
  },
  data() {
    return {
      showViewKey: false,
      keyToView: {},
      deleteKey: {},
      showDeleteKey: false,
    };
  },
};
</script>

<template>
  <n-grid
    cols="200:1 400:2 550:3 750:4 900:5 1100:6 "
    style="width: 100%"
    :x-gap="12"
    :y-gap="12"
    v-if="keys.length != 0"
  >
    <n-grid-item v-for="key in keys" :key="key.id">
      <n-card
        size="small"
        header-style="padding-bottom: 0px"
        :style="{
          borderRadius: '1rem',
          backgroundColor: key.isDrawn
            ? 'rgba(232, 128, 128, 0.16)'
            : 'rgba(99, 226, 183, 0.16)',
          color: key.isDrawn ? 'rgba(232, 128, 128)' : 'rgba(99, 226, 183)',
          paddingBottom: '10px',
        }"
      >
        <template #header>
          <h3
            :style="{
              margin: 0,
              color: key.isDrawn ? 'rgba(232, 128, 128)' : 'rgba(99, 226, 183)',
            }"
          >
            {{ key.name }}
          </h3>
        </template>
        <template #header-extra>
          <n-space :size="0">
            <n-button
              quaternary
              circle
              type="error"
              @click="
                () => {
                  deleteKey = key;
                  showDeleteKey = true;
                }
              "
              v-if="editing"
            >
              <template #icon>
                <Icon>
                  <Trash />
                </Icon>
              </template>
            </n-button>
            <n-button
              quaternary
              circle
              type="primary"
              @click="
                () => {
                  viewKey(key);
                }
              "
            >
              <template #icon> <ExternalLink /> </template>
            </n-button>
          </n-space>
        </template>

        <n-popover trigger="hover" placement="top-start">
          <template #trigger>
            <div style="display: flex; align-items: center">
              <Icon style="padding-right: 2px"><User /></Icon>
              {{ key.drawnBy.name }}
            </div>
          </template>
          <span>{{ key.isDrawn ? "Drawn By" : "Returned By" }}</span>
        </n-popover>

        <n-popover trigger="hover" placement="top-start">
          <template #trigger>
            <div style="display: flex; align-items: center">
              <Icon style="padding-right: 2px"
                ><CalendarEvent v-if="key.isDrawn" /><History v-else
              /></Icon>
              {{ formatDate(key.lastDrawn.seconds) }}
            </div>
          </template>
          <span>{{ key.isDrawn ? "Drawn At" : "Returned At" }}</span>
        </n-popover>

        <h6
          style="
            margin: 0;
            color: #fff3;
            position: absolute;
            bottom: 6px;
            right: 15px;
          "
        >
          {{ key.code }}
        </h6>
      </n-card>
    </n-grid-item>
  </n-grid>
  <div v-else style="width: 100%; display: flex; justify-content: center">
    <div style="width: 50%">
      <n-divider style="margin-top: 15px; margin-bottom: 10px; color: #777"
        >No Keys</n-divider
      >
    </div>
  </div>

  <n-modal v-model:show="showViewKey" :block-scroll="true">
    <ViewKey :closeModal="closeKeyView" :vkey="keyToView" />
  </n-modal>

  <n-modal v-model:show="showDeleteKey">
    <DeleteKey :closeModal="closeModal" :dkey="deleteKey" />
  </n-modal>
</template>
