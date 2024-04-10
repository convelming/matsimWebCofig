export function guid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function xmlToJson(xml) {
  const domParser = new DOMParser();
  const xmlDom = domParser.parseFromString(xml, "application/xml");
  function _parse(xmlNode) {
    const name = xmlNode.nodeName;
    const attrs = {};
    const nodes = [];
    for (const attr of xmlNode.attributes || []) {
      attrs[attr.nodeName] = attr.nodeValue;
    }
    if (xmlNode.hasChildNodes()) {
      for (const node of xmlNode.childNodes) {
        if (node.nodeType === 1) {
          nodes.push(_parse(node));
        }
      }
    }
    return { name, attrs, nodes };
  }
  return _parse(xmlDom);
}

export function jsonToXml({ nodes = [], attrs = {}, name = "" }) {
  const attrStr = Object.entries(attrs)
    .map(([name, value]) => `${name}="${value}"`)
    .join(" ");
  let nodesStr = nodes.map(jsonToXml).join("\n");
  if (name == "#document") {
    return `${nodesStr}`;
  } else {
    if (nodes.length > 0) nodesStr = `\n${nodesStr}\n`;
    return `<${name} ${attrStr}>${nodesStr}</${name}>`;
  }
}

export function strToList(str, separator) {
  console.log(str instanceof String);
  if (!str || !str.split) return [];
  return str.split(separator).filter((v) => v);
}
export function listToStr(list, separator) {
  if (!list || !list.filter || !list.join) return "";
  return list.filter((v) => v !== "").join(separator);
}
