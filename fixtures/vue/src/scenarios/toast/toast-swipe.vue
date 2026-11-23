<script setup lang="ts">
import { Toast } from "../../kit/ui/toast.ts";
import Notifications from "./toast-swipe-notifications.vue";
</script>

<template>
    <Toast.Provider :timeout="0">
        <Notifications />
    </Toast.Provider>
</template>
