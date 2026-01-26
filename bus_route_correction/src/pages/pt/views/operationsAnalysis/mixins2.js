export function getIndexOptions(components) {
  const components = {};
  const data = {};
  const watch = {};
  const provide = {};
  const created = function () {};
  const mounted = function () {};
  const beforeDestroy = function () {};
  const methods = {};
  const render = (h, context) => {
    return h("div", [h("router-view")]);
  };
  return {
    components,
    data: () => Object.assign({}, data),
    
    created,
    mounted,
    beforeDestroy,
    render,
  };
}
