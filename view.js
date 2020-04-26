import { SVGCanvas, SimpleChartBuilder } from "/js/dist/g.min.js";

import "/js/dist/bpmn_icon.js";

const assign = Object.assign;


async function draw() {
    let viewer = document.querySelector("#viewer");
    let canvas = new SVGCanvas(viewer);
        let chartModel = {
        type: "diagram/bpmn",
        iconURI: "diagram.bpmn",
        elements: [
            ["lane", { id: "a2", name: "lane two", icon: "lane" }],
            ["lane", { id: "a1", name: "lane one", icon: "lane", style: { fill: "green", "stroke-width": 0 } }],

            ["node", { id: "2", name: "start event", icon: "startEvent", bounds: { x: 200, y: 100 } }],
            ["node", { id: "3", name: "task1", icon: "userTask", bounds: { x: 300, y: 100 } }],
            ["node", { id: "4", name: "gateway", icon: "gateway", bounds: { x: 460, y: 100 } }],
            ["node", { id: "5", name: "task 2", icon: "userTask", bounds: { x: 440, y: 200 } }],
            ["node", { id: "6", name: "task 3", icon: "userTask", bounds: { x: 600, y: 100 } }],
            ["node", { id: "7", name: "dataObject", icon: "dataObject", bounds: { x: 290, y: 30 } }],
            ["node", { id: "9", name: "end event", icon: "endEvent", bounds: { x: 625, y: 200 }, style: { fill: "red" } }],
            ["pool", {
                id: "30", name: "pool", icon: "pool", bounds: { x: 100, y: 280, width: 600, height: 360 },
                isHorizontal: true,
                lanes: ["a1", "a2"]
            }],
            ["edge", { id: "e1", name: "", sourceRef: "2", targetRef: "3" }],
            ["edge", { id: "e2", name: "", sourceRef: "3", targetRef: "4" }],
            ["edge", { id: "e3", name: "", sourceRef: "4", targetRef: "5" }],
            ["edge", { id: "e4", name: "", sourceRef: "6", targetRef: "9" }],
            ["edge", { id: "e5", name: "", sourceRef: "4", targetRef: "6" }],
            ["edge", { id: "e6", name: "", sourceRef: "3", targetRef: "7" }],
            ["edge", { id: "e7", name: "", sourceRef: "5", targetRef: "9" }],
        ]
    };

    let chartBuilder = new SimpleChartBuilder();

    let chart = await chartBuilder.build(chartModel);

    let events = ["owner", "create", "remove", "style", "textStyle", "bounds", "model", "waypoint"];

    let eventHandle = (event) => {
        // log(event);
        switch (event.type) {
            case "owner":
                break;
            case "creater":
                break;
            case "remove":
                break;
            case "style":
                break;
            case "bounds":
                break;
            case "model":
                break;
        }
    };
    events.forEach(name => chart.on(name, event => eventHandle(event)));
    canvas.drawChart(chart)
}

draw();


