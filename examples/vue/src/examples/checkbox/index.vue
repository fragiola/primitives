<script setup lang="ts">
import { Checkbox } from "@fragiola/primitives-vue/checkbox";
import { CheckboxGroup } from "@fragiola/primitives-vue/checkbox-group";
import { styles } from "./styles.ts";

// Pizza toppings: a CheckboxGroup whose parent checkbox checks or clears every topping and shows
// the mixed state in between; Space toggles the focused checkbox (spec/checkbox.md).
</script>

<template>
    <CheckboxGroup aria-labelledby="toppings" :default-value="['cheese']" :all-values="['cheese', 'ham', 'pineapple']" :class="styles.group">
        <h2 id="toppings" :class="styles.heading">Toppings</h2>
        <div :class="styles.row">
            <Checkbox.Root id="all" parent :class="styles.root"><Checkbox.Indicator :class="styles.indicator" /></Checkbox.Root>
            <label for="all">All toppings</label>
        </div>
        <div :class="styles.row">
            <Checkbox.Root id="cheese" value="cheese" :class="styles.root"><Checkbox.Indicator :class="styles.indicator" /></Checkbox.Root>
            <label for="cheese">Cheese</label>
        </div>
        <div :class="styles.row">
            <Checkbox.Root id="ham" value="ham" :class="styles.root"><Checkbox.Indicator :class="styles.indicator" /></Checkbox.Root>
            <label for="ham">Ham</label>
        </div>
        <div :class="styles.row">
            <Checkbox.Root id="pineapple" value="pineapple" :class="styles.root"><Checkbox.Indicator :class="styles.indicator" /></Checkbox.Root>
            <label for="pineapple">Pineapple</label>
        </div>
    </CheckboxGroup>
</template>
