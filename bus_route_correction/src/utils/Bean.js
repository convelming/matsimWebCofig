import proj4 from "@/utils/proj4.util";
import { guid } from "@/utils/utils";
const moment = require("moment");

function ObjectAssign(data, defaultData) {
  const obj = { ...data };
  for (let key in defaultData) {
    if (obj[key] === undefined || obj[key] === null) {
      obj[key] = defaultData[key];
    }
  }
  return obj;
}

export class CoordParams {
  x = 0;
  y = 0;
}
export class Coord {
  get lng() {
    const [lng, lat] = proj4("EPSG:3857", "EPSG:4326", [this.x, this.y]);
    const JD = 100000;
    return Math.floor(lng * JD) / JD;
  }

  get lat() {
    const [lng, lat] = proj4("EPSG:3857", "EPSG:4326", [this.x, this.y]);
    const JD = 100000;
    return Math.floor(lat * JD) / JD;
  }

  constructor(opt) {
    if (opt instanceof this.constructor) opt = opt.toJSON();
    opt = ObjectAssign(opt, new CoordParams());
    this.x = opt.x;
    this.y = opt.y;
  }

  static center(s, e) {
    return new Coord({
      x: (s.x + e.x) / 2,
      y: (s.y + e.y) / 2,
    });
  }

  static length(s, e) {
    let _x = s.x - e.x;
    let _y = s.y - e.y;
    return Math.sqrt(_x * _x + _y * _y);
  }

  offset(coord) {
    return new Coord({
      x: this.x - coord.x,
      y: this.y - coord.y,
    });
  }

  clone() {
    return new Coord(this.toJSON());
  }

  ceil(num) {
    const JD = Math.pow(10, num);
    return new Coord({
      x: Math.floor(this.x * JD) / JD,
      y: Math.floor(this.y * JD) / JD,
    });
  }

  toList(num = -1) {
    if ((num = -1)) {
      return [this.x, this.y];
    } else {
      const JD = Math.pow(10, num);
      return [Math.floor(this.x * JD) / JD, Math.floor(this.y * JD) / JD];
    }
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

export class TransitLineParams {
  lineId = null;
  name = "";
  transitRoutes = [];
}
export class TransitLine {

  constructor(opt) {
    if (opt instanceof this.constructor) opt = opt.toJSON();
    opt = ObjectAssign(opt, new TransitLineParams());
    this.lineId = opt.lineId;
    this.name = opt.name;
    this.transitRoutes = opt.transitRoutes.map(v => new TransitRoute(v))
  }

  toJSON() {
    return {
      lineId: this.lineId,
      name: this.name,
      transitRoutes: this.transitRoutes.map(v => v.toJSON()),
    };
  }
}

export class TransitRouteParams {
  line = "";
  routeId = "";
  description = "";
  transportMode = "";
  passenger = 0;
  takeRate = 0;

  route = {
    startLinkId: null,
    endLinkId: null,
    route: [],
    routeLink: {},
  };
  stops = [];
  departures = [];
  departureRules = [];
}
export class TransitRoute {
  _routeMap = {};
  _routeLink = null;

  center = null;

  showLayer = true;

  get startStop() {
    return this.stops[0] || new Stops();
  }
  get endStop() {
    return this.stops[this.stops.length - 1] || new Stops();
  }

  get route() {
    let list = [];
    for (let i = 0, prevStop = null; i < this.stops.length; i++) {
      let stop = this.stops[i];
      if (i == 0) {
        list.push(stop.linkId);
      }
      if (i != 0) {
        const key = `${prevStop.uuid}-${stop.uuid}`;
        const item = this._routeMap[key];
        if (item) {
          if (item.route.length == 0) {
            list.push(item.endStop.linkId);
          } else {
            list.push(...item.route.slice(1).map((v) => v.id));
          }
        } else {
          list.push(stop.linkId);
        }
      }
      prevStop = stop;
    }
    return list;
  }

  constructor(opt) {
    if (opt instanceof this.constructor) opt = opt.toJSON();
    opt = ObjectAssign(opt, new TransitRouteParams());
    this.line = opt.line;
    this.routeId = opt.routeId;
    this.description = opt.description;
    this.transportMode = opt.transportMode;
    this.takeRate = opt.takeRate;
    this.departures = opt.departures.map((v) => new Departures(v));
    this.departureRules = opt.departureRules.map((v) => new DepartureRule(v));

    this.stops = opt.stops.map((v) => new Stops(v));

    let sStop = this.stops[0] || new Stops();
    let eStop = this.stops[this.stops.length - 1] || new Stops();
    this.center = Coord.center(sStop.coord, eStop.coord);

    this._routeLink = JSON.parse(JSON.stringify(opt.route.routeLink || {}));
    const _routeMap = {};
    const _route = opt.route.route;
    let length = 0;
    for (let i = 0, prevStop = null; i < this.stops.length; i++) {
      let stop = this.stops[i];
      if (i != 0) {
        const si = _route.findIndex((v) => v == prevStop.linkId);
        const ei = _route.findIndex((v) => v == stop.linkId);
        const route = _route.splice(si, ei - si);
        route.push(stop.linkId);
        const key = `${prevStop.uuid}-${stop.uuid}`;
        const label = `${prevStop.name}-${stop.name}`;
        const stopsRouteItem = new StopsRouteItem({
          startStop: prevStop.toJSON(),
          endStop: stop.toJSON(),
          routeIds: route,
          route: route.map((v) => this.getLinkMap(v)),
          label: label,
          key: key,
        });
        length += stopsRouteItem.length;
        _routeMap[key] = stopsRouteItem;
      }
      prevStop = stop;
    }
    this._routeMap = _routeMap;
    this.length = parseInt(length);
    this.averageStopSpacing = parseInt(length / opt.stops.length);
    this.linearCoefficient = Number(length / Coord.length(sStop.coord, eStop.coord)).toFixed(4);
    this.passenger = opt.passenger;
  }

  getStartDeparture(time) {
    const list = this.departures.filter((v) => v.time == time);
    if (list.length > 0) {
      return list[0];
    }
    return new Departures();
  }

  getEndDeparture(time) {
    const list = this.departures.filter((v) => v.time == time);
    if (list.length > 0) {
      return list[list.length - 1];
    }
    return new Departures();
  }

  getStopsRouteOptions() {
    return Object.values(this._routeMap).map((v) => ({
      value: v.key,
      label: v.label,
    }));
  }

  getStopsRouteKeyByStops(stops) {
    const index = this.stops.findIndex((v) => v.uuid == stops.uuid);
    if (index != -1 && index < this.stops.length + 1) {
      const stops2 = this.stops[index + 1];
      return `${stops.uuid}-${stops2.uuid}`;
    }
    return null;
  }
  getStopsRouteKeyByLink(route) {
    const list = Object.values(this._routeMap)
    const item = list.find((v) => v.routeIds.indexOf(route) > -1);
    if (item) {
      return `${item.startStop.uuid}-${item.endStop.uuid}`;
    }
    return null;
  }

  getStopsRoute(key) {
    return this._routeMap[key];
  }

  getRouteLink(route) {
    return route.map((v) => new RouteLinkItem(this.getLinkMap(v)));
  }
  addLinkMap(link) {
    if (link && !this._routeLink[link.id]) {
      this._routeLink[link.id] = link.toJSON();
    }
  }
  getLinkMap(linkId) {
    if (!this._routeLink[linkId]) {
      this._routeLink[linkId] = new RouteLinkItem({ id: linkId }).toJSON();
    }
    return this._routeLink[linkId];
  }

  addStop(stop, index = 0) {
    this.stops.splice(index, 0, stop);
  }
  removeStop(index) {
    return this.stops.splice(index, 1);
  }
  changeStop(stop, index) {
    this.stops.splice(index, 1, stop);
  }

  removeDepartureRule(uuid) {
    let index = this.departureRules.findIndex((v) => v.uuid == uuid);
    return this.departureRules.splice(index, 1);
  }
  addOrChangeDepartureRule(departureRule) {
    let index = this.departureRules.findIndex(
      (v) => v.uuid == departureRule.uuid
    );
    if (index == -1) {
      this.departureRules.splice(0, 0, departureRule);
    } else {
      this.departureRules.splice(index, 1, departureRule);
    }
  }

  changeStopsRoute(stopsRouteItem) {
    this._routeMap[stopsRouteItem.key] = stopsRouteItem;
    for (const link of stopsRouteItem.route) {
      if (!this._routeLink[link.id]) {
        this._routeLink[link.id] = link.toJSON();
      }
    }
  }

  toJSON() {
    let route = {
      startLinkId: null,
      endLinkId: null,
      route: [],
      routeLink: {},
    };
    try {
      route = {
        startLinkId: this.stops[0].linkId,
        endLinkId: this.stops[this.stops.length - 1].linkId,
        route: this.route,
        routeLink: this._routeLink,
      };
    } catch (error) { }
    return {
      line: this.line,
      routeId: this.routeId,
      description: this.description,
      transportMode: this.transportMode,
      passenger: this.passenger,

      route: route,
      stops: this.stops.map((v) => v.toJSON()),
      departures: this.departures.map((v) => v.toJSON()),
      departureRules: this.departureRules.map((v) => v.toJSON()),

      discard: this.discard,
    };
  }
}

export class DepartureRuleParams {
  id = null;
  type = "all-day";
  beginTime = "06:00:00";
  endTime = "22:00:00";
  spaces = 0;
  model = "";
  modelJson = JSON.stringify({ model: "", length: 0, width: 0, total: 0, seat: 0, coach: 0 });
  remark = "";
  startDays = "";
  startType = "morning_valley";

  pickerOption = {
    // start: "",
    // end: "",
  };
  uuid = guid();
}
const YEAR_TIME = moment("2000-01-01 00:00:00").unix();
export class DepartureRule {
  get spacesStr() {
    return moment.unix(YEAR_TIME + this.spacesNum * 60).format("HH:mm:ss");
  }

  constructor(opt) {
    if (opt instanceof this.constructor) opt = opt.toJSON();
    opt = ObjectAssign(opt, new DepartureRuleParams());
    this.id = opt.id;
    this.type = opt.type;
    this.beginTime = opt.beginTime;
    this.endTime = opt.endTime;
    // this.spaces = opt.spaces;
    // this.spacesStr = moment.unix(YEAR_TIME + opt.spaces).format("HH:mm:ss");
    this.spacesNum = opt.spaces / 60;
    try {
      const modelJson = JSON.parse(opt.model);
      this.model = modelJson.model;
      this.modelJson = modelJson;
    } catch (error) {
      this.model = "";
      this.modelJson = { model: "", length: 0, width: 0, total: 0, seat: 0, coach: 0 };
    }
    this.remark = opt.remark;

    this.startDays = opt.startDays.split(",");
    this.startType = opt.startType;
    this.uuid = opt.uuid;
  }
  toJSON() {
    this.modelJson.model = this.model;
    const modelJson = JSON.stringify(this.modelJson);
    return {
      id: this.id,
      type: this.type,
      beginTime: this.beginTime,
      endTime: this.endTime,
      // spaces: moment("2000-01-01 " + this.spacesStr).unix() - YEAR_TIME,
      spaces: parseInt(this.spacesNum * 60),
      model: modelJson,
      remark: this.remark,

      startDays: this.startDays.join(","),
      startType: this.startType,
      uuid: this.uuid,
    };
  }
}

export class RouteLinkItemParams {
  capacity = null;
  freespeed = null;
  fromCoord = null;
  fromNode = null;
  id = null;
  length = null;
  modes = null;
  oneway = null;
  origid = null;
  permlanes = null;
  srid = null;
  toCoord = null;
  toNode = null;
  type = null;

  uuid = guid();
}
export class RouteLinkItem {
  constructor(opt) {
    if (opt instanceof this.constructor) opt = opt.toJSON();
    opt = ObjectAssign(opt, new RouteLinkItemParams());
    this.capacity = opt.capacity;
    this.freespeed = opt.freespeed;
    this.fromCoord = new Coord(opt.fromCoord);
    this.fromNode = opt.fromNode;
    this.id = opt.id;
    this.modes = opt.modes;
    this.oneway = opt.oneway;
    this.origid = opt.origid;
    this.permlanes = opt.permlanes;
    this.srid = opt.srid;
    this.toCoord = new Coord(opt.toCoord);
    this.toNode = opt.toNode;
    this.type = opt.type;

    this.length = Coord.length(this.fromCoord, this.toCoord);
    this.uuid = this.uuid;
  }
  toJSON() {
    return {
      capacity: this.capacity,
      freespeed: this.freespeed,
      fromCoord: this.fromCoord.toJSON(),
      fromNode: this.fromNode,
      id: this.id,
      length: this.length,
      modes: this.modes,
      oneway: this.oneway,
      origid: this.origid,
      permlanes: this.permlanes,
      srid: this.srid,
      toCoord: this.toCoord.toJSON(),
      toNode: this.toNode,
      type: this.type,

      uuid: this.uuid,
    };
  }
}

export class StopsParams {
  departureOffset = null;
  awaitDepartureTime = null;
  arrivalOffset = null;

  stop = {
    customizableDelegate: null,
    isBlockingLane: null,
    coord: { x: 12614426, y: 2646623 },
    linkId: null,
    name: null,
    id: null,
  };

  uuid = guid();
}
export class Stops {
  constructor(opt) {
    if (opt instanceof this.constructor) opt = opt.toJSON();
    opt = ObjectAssign(opt, new StopsParams());
    this.departureOffset = opt.departureOffset;
    this.awaitDepartureTime = opt.awaitDepartureTime;
    this.arrivalOffset = opt.arrivalOffset;

    this.customizableDelegate = opt.stop.customizableDelegate;
    this.isBlockingLane = opt.stop.isBlockingLane;
    this.coord = new Coord(opt.stop.coord);
    this.linkId = opt.stop.linkId;
    this.name = opt.stop.name;
    this.id = opt.stop.id;

    this.uuid = opt.uuid;
  }

  toJSON() {
    return {
      departureOffset: this.departureOffset,
      awaitDepartureTime: this.awaitDepartureTime,
      arrivalOffset: this.arrivalOffset,

      stop: {
        customizableDelegate: this.customizableDelegate,
        isBlockingLane: this.isBlockingLane,
        coord: this.coord.toJSON(),
        linkId: this.linkId,
        name: this.name,
        id: this.id,
      },

      uuid: this.uuid,
    };
  }
}

export class DeparturesParams {
  id = null;
  dateType = null;
  departureTime = null;

  uuid = guid();
}
export class Departures {
  constructor(opt) {
    if (opt instanceof this.constructor) opt = opt.toJSON();
    opt = ObjectAssign(opt, new DeparturesParams());
    this.id = opt.id;
    this.dateType = opt.dateType;
    this.departureTime = opt.departureTime;

    this.uuid = opt.uuid;
  }

  getTimeStr() {
    return moment(this.departureTime || 0).format("HH:mm:ss");
  }

  toJSON() {
    return {
      id: this.id,
      dateType: this.dateType,
      departureTime: this.departureTime,

      uuid: this.uuid,
    };
  }
}

export class StopsRouteItemParams {
  startStop = new StopsParams();
  endStop = new StopsParams();
  route = [];
  label = "";
  key = "";
  middleLink = [];
}
export class StopsRouteItem {
  get center() {
    return Coord.center(this.startStop.coord, this.endStop.coord);
  }

  get stops() {
    return [this.startStop, this.endStop];
  }

  constructor(opt) {
    if (opt instanceof this.constructor) opt = opt.toJSON();
    opt = ObjectAssign(opt, new StopsRouteItemParams());
    this.startStop = new Stops(opt.startStop);
    this.endStop = new Stops(opt.endStop);
    this.routeIds = opt.routeIds;
    this.route = opt.route.map((v) => new RouteLinkItem(v));
    this.length = this.route.reduce((a, b) => a + b.length, 0);
    this.label = opt.label;
    this.key = opt.key;
    this.middleLink = opt.middleLink;
  }

  setRoute(list) {
    this.route = list.map((v) => new RouteLinkItem(v));
  }

  removeMiddleLink(link) {
    let _link = new RouteLinkItem(link);
    let index = this.middleLink.findIndex((v) => v.id == _link.id);
    return index > -1 ? this.middleLink.splice(index, 1) : null;
  }
  addMiddleLink(link) {
    let _link = new RouteLinkItem(link);
    let index = this.middleLink.findIndex((v) => v.id == _link.id);
    if (index == -1) {
      this.middleLink.push(new RouteLinkItem(link));
    }
  }

  toJSON() {
    return {
      startStop: this.startStop.toJSON(),
      endStop: this.endStop.toJSON(),
      route: this.route.map((v) => v.toJSON()),
      label: this.label,
      key: this.key,
      middleLink: this.middleLink,
    };
  }
}
