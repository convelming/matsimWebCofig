export function isPropertiesMapArgument(arg) {
  return !!arg?.funcStr;
}

export const defaultNumberColorOptions = {
  name: "",
  model: "count", // count interval
  modelClass: 5,
  labelRule: undefined, // null || undefined 使用`${min} ~ ${max}` en 使用字母顺序
  toFixed: 2,
  colorList: ["#FEE0D2", "#B50404"],
};
export function createColorFuncByNumber(options = defaultNumberColorOptions) {
  function func(params, list, imports) {
    const values = list.map((item) => item[params.name]);
    const sortValues = new Array(values).sort((a, b) => a - b);
    const colorList = [];
    if (params.model === "interval") {
      const step = Math.ceil(sortValues.length / params.modelClass);
      for (let i = 0; i < params.modelClass; i++) {
        const min = imports.toFixed(sortValues[i * step], params.toFixed);
        const max = imports.toFixed(sortValues[(i + 1) * step], params.toFixed);
        colorList[i] = {
          min: min,
          max: max,
          label: `${min} ~ ${max}`,
          color: imports.getColor(i / (params.modelClass - 1), params.colorList),
          use: true,
        };
      }
    } else if (params.model === "count") {
      const cmin = sortValues[0];
      const cmax = sortValues[sortValues.length - 1];
      const step = (cmax - cmin) / params.modelClass;
      for (let i = 0; i < params.modelClass; i++) {
        const min = imports.toFixed(step * i, params.toFixed);
        const max = imports.toFixed(step * i, params.toFixed);
        colorList[i] = {
          min: min,
          max: max,
          label: `${min} ~ ${max}`,
          color: imports.getColor(i / (params.modelClass - 1), params.colorList),
          use: true,
        };
      }
    }
    // const sortColorList = new Array(colorList).sort((a, b) => b.max - a.max);
    const sortColorList = new Array(colorList).reverse();
    return {
      colors: values.map((v, i) => sortColorList.find((item) => item.min <= v && v <= item.max).color),
      colorList: colorList,
    };
  }
  return {
    funcStr: func.toString(),
    params: options,
  };
}

export const defaultStringColorOptions = {
  name: "",
  colorList: ["#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
};
export function createColorFuncByString(options = defaultStringColorOptions) {
  function func(params, list, imports) {
    const values = list.map((item) => item[params.name]);
    const setValue = Array.from(new Set(values));
    const colorList = [];
    const colorMap = {};
    for (let i = 0; i < setValue.length; i++) {
      const value = setValue[i];
      const color = params.colorList[i % params.colorList.length];
      colorMap[value] = color;
      colorList[i] = {
        value: value,
        label: value,
        color: color,
        use: true,
      };
    }
    return {
      colors: values.map((v, i) => colorMap[v]),
      colorList: colorList,
    };
  }
  return {
    funcStr: func.toString(),
    params: options,
  };
}

export const defaultSortOptions = {
  name: "",
  order: "dasc", // asc 小上大下 desc 大上小下
};
export function createSortFunc(options = defaultSortOptions) {
  function func(params, list, imports) {
    if (params?.name) {
      const sortValues = new Array(Object.entries(list)).sort(([_1, a], [_2, b]) => a[params.name] - b[params.name]);
      if (params.order === "dasc") {
        sortValues.reverse();
      }
      sortValues.forEach((item, i) => (item[1] = 1 - i / (sortValues.length - 1)));
      sortValues.sort(([a, _1], [b, _2]) => a - b);
      return sortValues.map((item) => item[1]);
    } else {
      const sortValues = list.map((v, i, l) => i / (l.length - 1));
      if (params.order === "dasc") {
        sortValues.reverse();
      }
      return sortValues;
    }
  }
  return {
    funcStr: func.toString(),
    params: options,
  };
}
