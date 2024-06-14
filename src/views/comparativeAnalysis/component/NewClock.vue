<template>
    <div class="box">
        <div class="top">
            <div class="Luopan">
                <slot name="Luopan"></slot>
            </div>

            <div v-show="showFun" class="bug">
                <a href="https://doc.weixin.qq.com/sheet/e3_AdQA8Aa_ADMt1qh97LkSHer6ALqI2?scode=APwA6gfEAA0aeGdABPAdQA8Aa_ADM&tab=f2oofj"
                    target="_blank">
                    <img class="img" src="@/assets/image/bug_icon.png"></img>
                </a>
            </div>
            <div v-show="showFun" class="map">

                <div id="map-switch">
                    <img class="icon" style="margin-right: 4px;" src="@/assets/image/map_icon.png">
                    <span class="text">地图</span>
                </div>
                <div id="map-switch-list"></div>
            </div>
            <div v-show="showFun" class="question" @click="open = true">
                <img class="icon" src="@/assets/image/question_icon.png">
                <span class="text">帮助</span>
            </div>
            <el-dropdown v-show="showFun" class="language" @command="changeLanguage" placement="top-start"
                trigger="click">
                <div class="locale">
                    <img class="icon" src="@/assets/image/locale_icon.png"> <span class="text">{{ page_language
                        }}</span>
                </div>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="zh-CN" :disabled="page_language == 'zh-CN'">中文（简体）</el-dropdown-item>
                    <!-- <el-dropdown-item command="zh_MO" :disabled="page_language == 'zh-MO'">中文（繁體）</el-dropdown-item> -->
                    <el-dropdown-item command="en-US" :disabled="page_language == 'en-US'">English</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <div class="time" :style="{
                background:showFun?'#E5E5E5':''
            }" @click="showFun = !showFun">{{ getTime }}</div>
        </div>
        <div v-show="showFun" class="bottom">
            <slot name="bottom"></slot>
        </div>
        <el-dialog :visible.sync="open" width="500px" append-to-body center @close="handleClose"
            :close-on-click-modal="false">
            <div class="body">
                <!-- <component v-show="carouselIndex == item" v-for="item in pageNum" :key="item" :is="`page${item}`"></component> -->
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button size="mini" @click="handleClose">关闭</el-button>
                <el-button v-if="carouselIndex != 1" size="mini" type="info" @click="carouselIndex--">上一步</el-button>
                <el-button v-if="carouselIndex < pageNum" size="mini" type="primary"
                    @click="carouselIndex++">下一步</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import page1 from "./HelpDialog/page1.vue";
import page2 from "./HelpDialog/page2.vue";
import page3 from "./HelpDialog/page3.vue";
import page4 from "./HelpDialog/page4.vue";
import page5 from "./HelpDialog/page5.vue";
import page6 from "./HelpDialog/page6.vue";
export default {
    props: {
        time: Number
    },
    components: {
        page1,
        page2,
        page3,
        page4,
        page5,
        page6,
    },
    data() {
        return {
            // open: !localStorage.getItem("HelpDialogClose"),
            open: false,
            carouselIndex: 1,
            pageNum: 5,
            showFun: false
        };
    },
    computed: {
        getTime() {
            console.log(this.time);
            return this.formatTime(Math.ceil(this.time))
        },
    },
    watch: {
        open(val) {
            if (val) {
                this.carouselIndex = 1;
            }
        },
    },
    methods: {
        handleClose() {
            this.open = false;
            // localStorage.setItem("HelpDialogClose", true);
        },
        handleNext() {
            this.$refs.carousel.next();
        },
        handlePrev() {
            this.$refs.carousel.prev();
        },
        changeLanguage(lan) {
            this.$setLanguage(lan);
        },
        formatTime(seconds) {
            // 计算小时数
            const hours = Math.floor(seconds / 3600);
            // 计算剩余的分钟数
            const minutes = Math.floor((seconds % 3600) / 60);
            // 计算剩余的秒数
            const remainingSeconds = seconds % 60;

            // 将小时、分钟和秒数转换为两位数的字符串
            const formattedHours = hours.toString().padStart(2, '0');
            const formattedMinutes = minutes.toString().padStart(2, '0');
            const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

            // 返回格式化后的字符串
            return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        },
    }
}
</script>
<style lang="scss" scoped>
.box {
    padding: 12px;
    background: #FFFFFF;
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);
    border-radius: 6px;

    .top {
        display: flex;
        align-items: center;
        gap: 12px;
        height: 32px;

        .Luopan {
            cursor: pointer;
            width: 32px;
            height: 32px;
            border: 1px solid #E5E5E5;
            border-radius: 4px;
            position: relative;
        }

        .bug {
            cursor: pointer;
            width: 32px;
            height: 32px;
            border: 1px solid #E5E5E5;
            border-radius: 4px;

            a {
                width: 24px;
                height: 24px;
                display: block;
                padding: 4px;
            }

            .img {
                width: 24px;
                height: 24px;
            }
        }

        .map {
            cursor: pointer;
            position: relative;
            height: 32px;
            border: 1px solid #E5E5E5;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;

            #map-switch {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .icon {
                width: 24px;
                height: 24px;
            }

            .text {
                font-weight: 400;
                font-size: 14px;
                color: #434343;
                line-height: 20px;
            }
        }

        .locale,
        .question {
            cursor: pointer;
            height: 32px;
            border: 1px solid #E5E5E5;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;

            .icon {
                width: 24px;
                height: 24px;
            }

            .text {
                font-weight: 400;
                font-size: 14px;
                color: #434343;
                line-height: 20px;
            }
        }
        @font-face {
            font-family: wending;
            src: url("@/assets/css/DigitalNumbers-Regular.ttf");;
       }
        .time {
            cursor: pointer;
            border: 1px solid #E5E5E5;
            border-radius: 4px;
            height: 100%;
            display: flex;
            align-items: center;
            font-family:wending;
            padding: 0 4px;
        }
    }
}
</style>