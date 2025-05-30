const express = require("express");
const router = express.Router();

const PassengerFlow = require("../utils/my-charts/PassengerFlow");

const ActivityAttributes = require("../utils/my-charts/ActivityAttributes");
const TravelAttribute = require("../utils/my-charts/TravelAttribute");
const TravelerAttributes = require("../utils/my-charts/TravelerAttributes");

/* GET /test */
router.get("/test", function (req, res, next) {
  const option = {
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: "line",
        smooth: true,
      },
    ],
  };

  const buffer = node_echarts({
    width: 600, // Image width, type is number.
    height: 600, // Image height, type is number.
    option: option,
    enableAutoDispose: true, //Enable auto-dispose echarts after the image is created.
  });
  res.send(buffer);
});

/************************************* PassengerFlow *************************************/

//
// POST /passengersEnteringLeaving
router.post("/passengersEnteringLeaving", function (req, res, next) {
  const data = req.body;
  const buffer = PassengerFlow.PassengersEnteringLeaving(data);
  res.type("image/png");
  res.send(buffer);
});

//
// POST /routeFlows
router.post("/routeFlows", async function (req, res, next) {
  try {
    const data = req.body;
    const buffer = await PassengerFlow.RouteFlows(data);
    res.type("image/png");
    res.send(buffer);
  } catch (error) {
    next(error)
  }
});

//
// POST /routeTimeDiagram
router.post("/routeTimeDiagram", function (req, res, next) {
  const data = req.body;
  const buffer = PassengerFlow.RouteTimeDiagram(data);
  res.type("image/png");
  res.send(buffer);
});

/************************************* ActivityAttributes *************************************/

// 出行目的
// POST /travelPurpose
router.post("/travelPurpose", function (req, res, next) {
  const data = req.body;
  const buffer = ActivityAttributes.TravelPurpose(data);
  res.type("image/png");
  res.send(buffer);
});

// 出行时段
// POST /travelTime
router.post("/travelTime", function (req, res, next) {
  const data = req.body;
  const buffer = ActivityAttributes.TravelTime(data);
  res.type("image/png");
  res.send(buffer);
});

// 停留时间
// POST /residenceTime
router.post("/residenceTime", function (req, res, next) {
  const data = req.body;
  const buffer = ActivityAttributes.ResidenceTime(data);
  res.type("image/png");
  res.send(buffer);
});

// 出行方式
// POST /travelMode
router.post("/travelMode", function (req, res, next) {
  const data = req.body;
  const buffer = ActivityAttributes.TravelMode(data);
  res.type("image/png");
  res.send(buffer);
});

/************************************* TravelAttribute *************************************/

// 出行方式
// POST /travelAttribute
router.post("/travelAttribute", function (req, res, next) {
  const data = req.body;
  const buffer = TravelAttribute.TravelAttribute(data);
  res.type("image/png");
  res.send(buffer);
});

/************************************* TravelerAttributes *************************************/

// 出行者年龄
// POST /travelersAge
router.post("/travelersAge", function (req, res, next) {
  const data = req.body;
  const buffer = TravelerAttributes.TravelersAge(data);
  res.type("image/png");
  res.send(buffer);
});

// 出行者车辆可使用情况
// POST /travelersCarAvailability
router.post("/travelersCarAvailability", function (req, res, next) {
  const data = req.body;
  const buffer = TravelerAttributes.TravelersCarAvailability(data);
  res.type("image/png");
  res.send(buffer);
});

// 出行者机动车保有量
// POST /travelersCarLicense
router.post("/travelersCarLicense", function (req, res, next) {
  const data = req.body;
  const buffer = TravelerAttributes.TravelersCarLicense(data);
  res.type("image/png");
  res.send(buffer);
});

// 出行者就业情况
// POST /travelersEmployed
router.post("/travelersEmployed", function (req, res, next) {
  const data = req.body;
  const buffer = TravelerAttributes.TravelersEmployed(data);
  res.type("image/png");
  res.send(buffer);
});

// 出行者性别
// POST /travelersSex
router.post("/travelersSex", function (req, res, next) {
  const data = req.body;
  const buffer = TravelerAttributes.TravelersSex(data);
  res.type("image/png");
  res.send(buffer);
});

module.exports = router;
