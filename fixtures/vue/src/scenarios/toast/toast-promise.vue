<script setup lang="ts">
import { Toast } from "../../kit/ui/toast.ts";
import Notifications from "./toast-promise-notifications.vue";
</script>

<template>
    <Toast.Provider :timeout="2000">
        <Notifications />
    </Toast.Provider>
</template>
