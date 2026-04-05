<template>
    <div>
        <div class="flex items-center justify-center w-full mb-8 ">
            <input type="text" class="text-lg text-center font-martianMono" :placeholder="defaultname" v-model="info.name">
        </div>
        <div class="flex flex-col items-center justify-center w-full mb-8">
            <span class="text-4xl font-bold mb-2">Score</span>
            <div class="flex flex-row-reverse items-center justify-around w-full">
                <button @click="() => updateScore(1)"
                    class="bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold py-2 px-4 mb-2 rounded">
                    +
                </button>
                <span class="text-4xl font-martianMono">{{ info.score }}</span>
                <button @click="() => updateScore(-1)"
                    class="bg-red-500 hover:bg-red-600 active:bg-red-900 text-white font-bold py-2 px-4 mb-2 rounded">
                    -
                </button>
            </div>
        </div>
        <div class="flex flex-col items-center justify-center w-full mb-8">
            <span class="text-4xl font-bold mb-2">Foul</span>
            <div class="flex flex-row-reverse items-center justify-around w-full">
                <button @click="() => updateFoul(1)"
                    class="bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold py-2 px-4 mb-2 rounded">
                    +
                </button>
                <span class="text-4xl font-martianMono">{{ info.foul }}</span>
                <button @click="() => updateFoul(-1)"
                    class="bg-red-500 hover:bg-red-600 active:bg-red-900 text-white font-bold py-2 px-4 mb-2 rounded">
                    -
                </button>
            </div>
        </div>
        <div class="flex flex-col items-center justify-center w-full mb-8">
            <span class="text-4xl font-bold mb-2">Timeout</span>
            <div class="flex flex-row-reverse items-center justify-around w-full">
                <button @click="() => updateTimeout(1)"
                    class="bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold py-2 px-4 mb-2 rounded">
                    +
                </button>
                <span class="text-4xl font-martianMono">{{ info.timeout }}</span>
                <button @click="() => updateTimeout(-1)"
                    class="bg-red-500 hover:bg-red-600 active:bg-red-900 text-white font-bold py-2 px-4 mb-2 rounded">
                    -
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import type { TeamInfo } from "~/types/TeamInfo";

export default {
    data() {
        return {
            timeout: null as any
        }
    },
    props: {
        info: {
            type: Object as () => TeamInfo,
            required: true
        },
        defaultname: {
            type: String,
            required: true
        },
        teamname: {
            type: String,
            required: true
        }
    },
    watch: {
        info: {
            handler(newValue) {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    // Emit team name event
                    this.$emit('team-name-update', { team: this.teamname, name: this.info.name })
                }, 500);
            },
            deep: true
        }
    },
    methods: {
        updateScore(delta: number) {
            this.info.score = Math.max(0, this.info.score + delta);
            this.$emit('score-update', { team: this.teamname, score: this.info.score });
        },
        updateFoul(delta: number) {
            this.info.foul = Math.max(0, this.info.foul + delta);
            this.$emit('foul-update', { team: this.teamname, foul: this.info.foul });
        },
        updateTimeout(delta: number) {
            this.info.timeout = Math.max(0, this.info.timeout + delta);
            this.$emit('timeout-update', { team: this.teamname, timeout: this.info.timeout });
        }
    },
}
</script>

<style></style>