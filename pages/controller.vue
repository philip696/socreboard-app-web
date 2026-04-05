<template>
    <div class="fixed w-screen h-screen bg-slate-400">
        <div class="flex items-center justify-end h-[5%] w-full bg-slate-300">
            <span class="w-full text-center text-2xl font-bold">Controller</span>
            <button class="bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold py-2 px-4 rounded"
                @click="toggleFullscreen">⛶</button>
            <button class="bg-red-500 hover:bg-red-600 active:bg-red-900 text-white font-bold py-2 px-4 rounded"
                @click="closeApp">✕</button>
        </div>
        <div class="flex flex-col items-center overflow-y-scroll overscroll-x-hidden p-8 h-full w-full">
            <div class="flex items-center justify-between w-full">
                <TeamController defaultname="Terang" teamname="teamA" :info="teamA"
                    @score-update="handleScoreUpdate"
                    @foul-update="handleFoulUpdate"
                    @timeout-update="handleTimeoutUpdate"
                    class="flex flex-col items-center justify-center h-full w-1/3" />
                <div class="flex flex-col items-center justify-center h-full w-1/3">
                    <span class="text-3xl font-bold mb-3">CONTROLLER</span>
                    <div class="flex items-center justify-center py-2 mb-2">
                        <button @click="emitEvent('quarter_step_event', { step: 'down' })"
                            class="bg-red-500 hover:bg-red-600 active:bg-red-900 text-white font-bold py-2 px-4 rounded">
                            -
                        </button>
                        <span class="text-3xl font-bold mx-2 font-martianMono">Q{{ quarter }}</span>
                        <button @click="emitEvent('quarter_step_event', { step: 'up' })"
                            class="bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold py-2 px-4 rounded">
                            +
                        </button>
                    </div>
                    <button v-if="!isRunning"
                        class="bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold py-2 px-4 mb-2 rounded"
                        @click="startTimer">
                        Start Timer
                    </button>
                    <button v-else
                        class="bg-red-500 hover:bg-red-600 active:bg-red-900 text-white font-bold py-2 px-4 mb-2 rounded"
                        @click="stopTimer">
                        Stop Timer
                    </button>
                    <button v-if="!isTimeout"
                        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 mb-2 rounded"
                        @click="startTimerTimeout">
                        Start Timeout
                    </button>
                    <button v-else class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 mb-2 rounded"
                        @click="stopTimerTimeout">
                        Stop Timeout
                    </button>

                    <div class="flex flex-col items-center justify-center mt-12">
                        <span v-if="isTimeout" class="text-3xl font-bold font-martianMono mb-8">
                            {{ formatedTimeout }}
                        </span>
                        <div class="flex items-center justify-around w-full mb-2">
                            <button @click="() => { emitSumEvent('change_time_event', { value: 60 }); }"
                                class="bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold p-2 rounded w-12 h-12">
                                +
                            </button>
                            <!-- <button @click="() => { emitSumEvent('change_time_event', { value: 10 }); }"
                                class="bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold p-2 rounded w-12 h-12">
                                +10
                            </button> -->
                            <button @click="() => { emitSumEvent('change_time_event', { value: 1 }); }"
                                class="bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold p-2 rounded w-12 h-12">
                                +
                            </button>
                        </div>
                        <span class="text-3xl font-bold font-martianMono">
                            {{ formatedTime }}
                        </span>
                        <div class="flex items-center justify-around w-full mt-2">
                            <button @click="() => { emitSumEvent('change_time_event', { value: -60 }); }"
                                class="bg-red-500 hover:bg-red-600 active:bg-red-900 text-white font-bold p-2 rounded w-12 h-12">
                                -
                            </button>
                            <!-- <button @click="() => { emitSumEvent('change_time_event', { value: -10 }); }"
                                class="bg-red-500 hover:bg-red-600 active:bg-red-900 text-white font-bold p-2 rounded w-12 h-12">
                                -10
                            </button> -->
                            <button @click="() => { emitSumEvent('change_time_event', { value: -1 }); }"
                                class="bg-red-500 hover:bg-red-600 active:bg-red-900 text-white font-bold p-2 rounded w-12 h-12">
                                -
                            </button>
                        </div>
                    </div>
                </div>
                <TeamController defaultname="Gelap" teamname="teamB" :info="teamB"
                    @score-update="handleScoreUpdate"
                    @foul-update="handleFoulUpdate"
                    @timeout-update="handleTimeoutUpdate"
                    class="flex flex-col items-center justify-center h-full w-1/3" />
            </div>
            <div class="flex items-center justify-around">
                <button @click="triggerEvent('3point')"
                    class="bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold py-2 px-4 m-2 rounded">3
                    Point</button>
                <button @click="triggerEvent('and_one')"
                    class="bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold py-2 px-4 m-2 rounded">And
                    One</button>
            </div>
            <div class="flex items-center justify-around">
                <button @click="toggleBanner('scorer_url')"
                    class="bg-amber-500 hover:bg-amber-600 active:bg-amber-900 text-white font-bold py-2 px-4 m-2 rounded">Toggle
                    Scorer</button>
                <button @click="toggleBanner('dark_statistic_url')"
                    class="bg-amber-500 hover:bg-amber-600 active:bg-amber-900 text-white font-bold py-2 px-4 m-2 rounded">Toggle
                    Statistic
                    (Dark)</button>
                <button @click="toggleBanner('light_statistic_url')"
                    class="bg-amber-500 hover:bg-amber-600 active:bg-amber-900 text-white font-bold py-2 px-4 m-2 rounded">Toggle
                    Statistic
                    (Light)</button>
                <button @click="toggleBanner('man_of_the_match_url')"
                    class="bg-amber-500 hover:bg-amber-600 active:bg-amber-900 text-white font-bold py-2 px-4 m-2 rounded">Toggle
                    MOTM</button>
                <button @click="toggleBanner('top_player_url')"
                    class="bg-amber-500 hover:bg-amber-600 active:bg-amber-900 text-white font-bold py-2 px-4 m-2 rounded">Toggle
                    Top
                    Player</button>
            </div>
            <div class="flex justify-center items-center w-full">
              <button @click="openAdDirectory"
                class="bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold py-2 px-4 m-2 rounded"
              >Open Ad Directory</button>
            </div>
            <div class="flex justify-center items-center w-full">
              <button v-for="dir in adDirectories"
                @click="playAdDirectory(dir)"
                class="bg-amber-500 hover:bg-amber-600 active:bg-amber-900 text-white font-bold py-2 px-4 m-2 rounded"
                >{{ dir.name }}</button>
            </div>
            <div class="flex justify-between items-center mx-10 w-full px-8">
                <Icon @click="openConfig" name="mynaui:config"
                    class="text-5xl hover:cursor-pointer bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold p-2 m-2 rounded" />
                <div class="flex items-center">
                    <input type="text" v-model="alarmDuration"
                        class="border border-gray-400 hover:border-gray-500 py-2 px-4 m-2 w-12 rounded text-center">
                    <label for="alarmDuration" class="text-lg font-bold">Second</label>
                    <button @click="triggerAlarm" :disabled="!isSerialConnected">
                        <Icon
                            class="text-5xl hover:cursor-pointer bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold p-2 m-2 rounded"
                            name="material-symbols:sound-detection-loud-sound" />
                    </button>
                    <select
                        class="appearance-none bg-white border border-gray-400 hover:border-gray-500 py-2 px-4 m-2 rounded focus:outline-none focus:shadow-outline"
                        v-model="selectedPort" :disabled="isSerialConnected">
                        <option value="">PORT?</option>
                        <option v-for="port in serialPorts" :value="port">{{ port }}</option>
                    </select>
                    <button @click="fetchSerialPorts"
                        class="bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold py-2 px-4 m-2 rounded">Refresh</button>
                    <button v-if="!isSerialConnected" @click="serialConnect"
                        class="bg-blue-500 hover:bg-blue-600 active:bg-blue-900 text-white font-bold py-2 px-4 m-2 rounded">Connect</button>
                    <button v-else @click="serialDisconnect"
                        class="bg-red-500 hover:bg-red-600 active:bg-red-900 text-white font-bold py-2 px-4 m-2 rounded">Disconnect</button>
                </div>
            </div>
            <div v-show="isNotifShown"
                class="absolute top-8 py-8 shadow-lg text-2xl font-bold text-center w-full transition ease-in-out delay-150 "
                :class="{ 'opacity-100': isNotifShown, 'opacity-0': !isNotifShown, 'bg-green-300': notificationStatus == 'success', 'bg-red-300': notificationStatus != 'success' }">
                <span class="text-2xl font-bold text-center w-full">{{ notificationMessage }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import type { TeamInfo } from '~/types/TeamInfo';
import { ref } from 'vue'

type PreviewUrl = {
    'scorer_url': string,
    'dark_statistic_url': string,
    'light_statistic_url': string,
    'man_of_the_match_url': string,
    'top_player_url': string
}

export default {
    setup() {
      const adDirectories = ref<string[]>([]);
      const { on, emit, invoke } = useEventBus();
      const serialPort = useSerialPort();

      // For now, ad directories are stored in localStorage
      // In a real app, you'd have an API endpoint to list available ads
      const loadAdDirectories = () => {
        const stored = localStorage.getItem('adDirectories');
        if (stored) {
          adDirectories.value = JSON.parse(stored);
        }
      };

      const saveAdDirectories = () => {
        localStorage.setItem('adDirectories', JSON.stringify(adDirectories.value));
      };

      loadAdDirectories();

      return {
        adDirectories,
        saveAdDirectories,
        on,
        emit,
        invoke,
        serialPort
      }
    },
    data() {
        return {
            time: 0 as number,
            lastTimeUpdate: null as number | null,
            isRunning: false as boolean,
            timeout: 0 as number,
            lastTimeoutUpdate: null as number | null,
            isTimeout: false as boolean,
            minimumUpdatePeriod: 200 as number,
            teamA: {
                name: 'Terang',
                picture: '',
                score: 0,
                foul: 0,
                timeout: 0
            } as TeamInfo,
            teamB: {
                name: 'Gelap',
                picture: '',
                score: 0,
                foul: 0,
                timeout: 0
            } as TeamInfo,
            quarter: 1 as number,
            previewUrl: '' as string,
            isBannerShown: false as boolean,
            showingBanner: '' as string,
            listUrl: {
            } as PreviewUrl,
            alarmDuration: '5' as string,
            serialPorts: [] as string[],
            selectedPort: '' as string,
            isSerialConnecting: false as boolean,
            isSerialConnected: false as boolean,
            isNotifShown: false as boolean,
            notificationStatus: '' as 'success' | 'failed',
            notificationMessage: '' as string
        }
    },
    mounted() {
        this.fetchSerialPorts();

        this.on('timer_event', (payload: any) => {
            this.time = payload.value;
            this.isRunning = true;
            this.lastTimeUpdate = Date.now();
        });

        this.on('timeout_event', (payload: any) => {
            this.timeout = payload.value;
            this.isTimeout = true;
            this.lastTimeoutUpdate = Date.now();
        });

        this.on('team_a_event', (payload: any) => {
            this.teamA = payload.teamA
            if (this.teamA.name == '') {
                this.teamA.name = 'Gelap';
            }
        });

        this.on('team_b_event', (payload: any) => {
            this.teamB = payload.teamB
            if (this.teamB.name == '') {
                this.teamB.name = 'Terang';
            }
        });

        this.on('quarter_event', (payload: any) => {
            this.quarter = payload.quarter;
        });

        this.on('timer_stop_event', (payload: any) => {
            this.isRunning = false;
            this.triggerAlarm();
        });

        // Score button handlers
        this.on('score_step_event', async (payload: any) => {
            const teamId = payload.team === 'teamA' ? 'teamA' : 'teamB';
            const currentScore = this[teamId].score;
            const newScore = payload.step === 'up' ? currentScore + 1 : currentScore - 1;
            this[teamId].score = Math.max(0, newScore);
            
            // Call API to persist (non-blocking)
            try {
                await fetch('/api/score/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        teamId,
                        scorePoints: Math.max(0, newScore),
                        action: 'set'
                    })
                });
            } catch (error) {
                console.warn('Score update API failed:', error);
            }
        });

        // Foul button handlers
        this.on('foul_step_event', async (payload: any) => {
            const teamId = payload.team === 'teamA' ? 'teamA' : 'teamB';
            const currentFoul = this[teamId].foul;
            const newFoul = payload.step === 'up' ? currentFoul + 1 : currentFoul - 1;
            this[teamId].foul = Math.max(0, newFoul);
        });

        // Timeout button handlers
        this.on('timeout_step_event', async (payload: any) => {
            const teamId = payload.team === 'teamA' ? 'teamA' : 'teamB';
            const currentTimeout = this[teamId].timeout;
            const newTimeout = payload.step === 'up' ? currentTimeout + 1 : currentTimeout - 1;
            this[teamId].timeout = Math.max(0, newTimeout);
        });

        // Quarter button handlers
        this.on('quarter_step_event', async (payload: any) => {
            const newQuarter = payload.step === 'up' ? this.quarter + 1 : this.quarter - 1;
            const quarter = Math.max(1, Math.min(4, newQuarter));
            this.quarter = quarter;
            
            // Call API to persist (non-blocking)
            try {
                await fetch('/api/score/quarter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quarter })
                });
            } catch (error) {
                console.warn('Quarter update API failed:', error);
            }
        });

        // Timer change handlers
        this.on('change_time_event', (payload: any) => {
            this.time = Math.max(0, this.time + (payload.value * 1000));
        });

        this.on('update_config_event', (payload: any) => {
            this.getConfig();
        });

        this.getConfig();

        // Periodically check if data is still coming
        setInterval(() => {
            if (this.lastTimeUpdate && (Date.now() - this.lastTimeUpdate > this.minimumUpdatePeriod)) {
                this.isRunning = false;
                this.lastTimeUpdate = null;
            }
            if (this.lastTimeoutUpdate && (Date.now() - this.lastTimeoutUpdate > this.minimumUpdatePeriod)) {
                this.isTimeout = false;
                this.lastTimeoutUpdate = null;
            }
        }, this.minimumUpdatePeriod);
    },
    computed: {
        formatedTime() {
            const milliseconds = (this.time % 1000) / 10;
            const seconds = Math.floor(this.time / 1000) % 60;
            const minutes = Math.floor(this.time / (1000 * 60)) % 60;

            const strMinutes = String((minutes < 10) ? "0" + minutes.toFixed(0) : minutes.toFixed(0));
            const strSeconds = String((seconds < 10) ? "0" + seconds.toFixed(0) : seconds.toFixed(0));
            const strMilliseconds = String((milliseconds < 10) ? "0" + milliseconds.toFixed(0) : milliseconds.toFixed(0));

            return strMinutes + ":" + strSeconds + "." + strMilliseconds;
        },
        formatedTimeout() {
            const milliseconds = (this.timeout % 1000) / 10;
            const seconds = Math.floor(this.timeout / 1000) % 60;
            const minutes = Math.floor(this.timeout / (1000 * 60)) % 60;

            const strMinutes = String((minutes < 10) ? "0" + minutes.toFixed(0) : minutes.toFixed(0));
            const strSeconds = String((seconds < 10) ? "0" + seconds.toFixed(0) : seconds.toFixed(0));

            return strSeconds;
        }
    },
    methods: {
        async getConfig() {
            // Config is stored in localStorage on the web version
            const stored = localStorage.getItem('scoreboard_config');
            if (stored) {
                this.listUrl = JSON.parse(stored);
            }
        },
        async handleScoreUpdate(payload: any) {
            // API call to persist score
            try {
                await fetch('/api/score/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        teamId: payload.team,
                        scorePoints: payload.score,
                        action: 'set'
                    })
                });
            } catch (error) {
                console.warn('Score API failed:', error);
            }
        },
        async handleFoulUpdate(payload: any) {
            // Foul update - just local for now
        },
        async handleTimeoutUpdate(payload: any) {
            // Timeout update - just local for now
        },
        async startTimer() {
            if (this.time > 0) {
                this.emit('start_timer_event', { initialTime: this.time })
            } else {
                this.emit('start_timer_event', { initialTime: 600000 })
            }
        },
        async openConfig() {
            // Navigate to configuration page instead of invoking command
            this.$router.push('/configuration');
        },
        async triggerAlarm() {
            try {
                await this.serialPort.triggerAlarm(parseInt(this.alarmDuration));
                this.showNotif('success', 'Alarm triggered');
            } catch (error) {
                console.error('Failed to trigger alarm:', error);
                this.showNotif('failed', 'Failed to trigger alarm');
            }
        },
        async stopTimer() {
            this.emit('stop_timer_event');
        },
        async startTimerTimeout() {
            this.emit('start_timeout_event', { initialTime: 60000 });
        },
        async stopTimerTimeout() {
            this.emit('stop_timeout_event');
        },
        async toggleBanner(key: "scorer_url" | "dark_statistic_url" | "light_statistic_url" | "man_of_the_match_url" | "top_player_url") {
            if (this.showingBanner == key) {
                this.emit('hide_banner', {});
                this.showingBanner = '';
            } else {
                this.emit('show_banner', { url: this.listUrl[key] });
                this.showingBanner = key;
            }
        },
        async triggerEvent(event_name: string) {
            this.emit(`${event_name}_event`, {});
        },
        async toggleFullscreen() {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.error(err));
            } else {
                document.documentElement.requestFullscreen().catch(err => console.error(err));
            }
        },
        async fetchSerialPorts() {
            try {
                await this.serialPort.getPairedPorts();
                // availablePorts is a ref, so we need .value
                const ports = this.serialPort.availablePorts?.value || [];
                this.serialPorts = ports.map((p: any) => p.getInfo?.().usbProductId?.toString() || 'Unknown');
            } catch (error) {
                console.warn('Serial ports not available (web version doesn\'t need them):', error);
                // Serial ports are optional for web version - don't show error
            }
        },
        async serialConnect() {
            this.isSerialConnecting = true;
            try {
                await this.serialPort.connect(this.selectedPort);
                this.isSerialConnected = true;
                this.showNotif('success', 'Serial port connected');
            } catch (error) {
                console.error('Failed to connect serial port:', error);
                this.showNotif('failed', 'Failed to connect serial port');
            } finally {
                this.isSerialConnecting = false;
            }
        },
        async serialDisconnect() {
            try {
                await this.serialPort.disconnect();
                this.isSerialConnected = false;
                this.showNotif('success', 'Serial port disconnected');
            } catch (error) {
                console.error('Failed to disconnect serial port:', error);
                this.showNotif('failed', 'Failed to disconnect serial port');
            }
        },
        async emitSumEvent(event: string, data: any) {
            this.time += (data.value * 1000);
            this.emit(event, data);
        },
        async emitEvent(event: string, data: any) {
            this.emit(event, data);
        },
        async showNotif(status: 'success' | 'failed', message: string) {
            this.notificationStatus = status;
            this.notificationMessage = message;
            this.isNotifShown = true;
            setTimeout(() => {
                this.isNotifShown = false;
            }, 2000);
        },
        async closeApp() {
            // On web, close just closes the window or navigates home
            // For PWA, could close the app
            if (window.confirm('Close application?')) {
                window.close();
            }
        }        
    }
}
</script>

<style></style>