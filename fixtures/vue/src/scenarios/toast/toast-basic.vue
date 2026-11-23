<script setup lang="ts">
import { Toast } from "../../kit/ui/toast.ts";
import Notifications from "./toast-basic-notifications.vue";
import { notifications } from "./toast-queue.ts";
</script>

<template>
    <Toast.Provider :toast-manager="notifications">
        <Notifications />
    </Toast.Provider>
</template>
