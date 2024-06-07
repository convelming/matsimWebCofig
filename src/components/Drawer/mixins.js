export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    size: {
      type: [Number, String],
      default: 0,
    },
  },
  watch: {
    show() {
      this.handleShow(this.show)
    },
    size() {
      this.s_size = this.size
    }
  },
  computed: {
    s_style() {
      const barSize = "10px";
      let style = `--bar-size: ${barSize};`;
      if (this.s_show) {
        style += `--drawer-size:${this.s_size + this.m_size}px;`;
      } else {
        style += `--drawer-size:${barSize};`;
      }
      return style;
    },
  },
  data() {
    return {
      s_show: false,
      s_size: 0,
      m_size: 0,
      _startEvent: null,
      _moveEvent: null,
      _endEvent: null,
    };
  },
  created() {
    this.s_show = this.show;
    this.s_size = this.size;
  },
  methods: {
    handleShow(show) {
      if (show && this.s_size < 20 && !this._startEvent)
        this.s_size = this.size;
      this.s_show = show;
      this.$emit("update:show", show);
    },
    startMove(event) {
      if (!this.s_show) {
        this.s_size = 0;
      }
      this._startEvent = event;
      document.body.addEventListener("mousemove", this.moveing);
      document.body.addEventListener("mouseup", this.endMove);
      document.body.addEventListener("mouseleave", this.endMove);
    },
    moveing(event) {
      this._moveEvent = event;
      this.m_size = this.getMsize();
      this.handleShow(this.s_size + this.m_size > 20);
    },
    endMove(event) {
      this._startEvent = null;
      this._moveEvent = null;
      this._endEvent = null;
      this.s_size = this.s_size + this.m_size;
      this.m_size = 0;
      document.body.removeEventListener("mousemove", this.moveing);
      document.body.removeEventListener("mouseup", this.endMove);
      document.body.removeEventListener("mouseleave", this.endMove);
    },
    getMsize() {
      return this._moveEvent.pageX - this._startEvent.pageX;
    },
  },
};
