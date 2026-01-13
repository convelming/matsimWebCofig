<!-- typewriter -->
<template>
  <div class="typewriter">
    <span>{{ displayedText }}</span>
    <span class="cursor">|</span>
  </div>
</template>

<script>
export default {
  name: "typewriter",
  props: {
    lines: {
      type: [Array, String],
      default: "",
    },
    speed: {
      type: Number,
      default: 100,
    },
  },
  components: {},
  computed: {},
  watch: {
    lines: {
      handler(newValue) {
        if (newValue instanceof Array) {
          this.fullText = newValue.join("\n");
        } else if (typeof newValue == "string") {
          this.fullText = newValue;
        }
        this.isTyping = false;
        this.startTyping();
      },
      immediate: true,
    },
  },
  data() {
    return {
      displayedText: "",
      fullText: "",
      isTyping: false,
      index: 0,
      typingSpeed: 100, // 每个字符间隔时间（毫秒）
    };
  },
  created() {},
  mounted() {},
  methods: {
    startTyping() {
      if (this.isTyping) return;
      this.isTyping = true;
      this.displayedText = "";
      this.index = 0;
      this.type();
    },
    type() {
      if (this.index < this.fullText.length && this.isTyping) {
        this.displayedText += this.fullText.charAt(this.index);
        this.index++;
        setTimeout(this.type, this.typingSpeed);
      } else {
        this.isTyping = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.typewriter {
  white-space: pre-wrap;
  text-align: justify;
}

.cursor {
  animation: blink 1s infinite;
  margin-left: 2px;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  45% {
    opacity: 1;
  }
  55% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}
</style>
