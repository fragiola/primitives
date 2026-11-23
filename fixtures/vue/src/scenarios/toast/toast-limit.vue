<script setup lang="ts">
import { Toast } from "../../kit/ui/toast.ts";
import Notifications from "./toast-limit-notifications.vue";
</script>

<template>
    <Toast.Provider :limit="2" :timeout="0">
        <Notifications />
    </Toast.Provider>
</template>
