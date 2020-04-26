import { SVGCanvas, SimpleChartBuilder } from "../g.min.es.js";

import "/js/chart/bpmn/bpmn_icon.js";

const assign = Object.assign;

async function draw() {
    let viewer = document.querySelector(".myclass");(document.body, "#viewer");
    let canvas = new SVGCanvas(viewer);
    let chartModel = {
        type: "diagram/bpmn",
        iconURI: "diagram.bpmn",
        elements: [
            ["lane", { id: "a2", name: "lane two", icon: "lane" }],
            ["lane", { id: "a1", name: "lane one", icon: "lane" }],
            ["node", { id: "1", name: "start", icon: "rect", bounds: { x: 100, y: 100 } }],
            ["node", { id: "2", name: "start event", icon: "startEvent", bounds: { x: 200, y: 100 } }],
            ["node", { id: "3", name: "task1", icon: "userTask", bounds: { x: 300, y: 100 } }],
            ["node", { id: "4", name: "gateway", icon: "gateway", bounds: { x: 460, y: 100 } }],
            ["node", { id: "4", name: "dataObject", icon: "dataObject", bounds: { x: 400, y: 200 } }],
            ["node", { id: "9", name: "end event", icon: "endEvent", bounds: { x: 300, y: 200 } }],
            ["pool", {
                id: "30", name: "subflow", icon: "pool", bounds: { x: 100, y: 280, width: 600, height: 360 },
                isHorizontal: true,
                lanes: ["a1", "a2"]
            }],
            ["edge", { id: "e1", name: "", sourceRef: "1", targetRef: "2" }]
        ]
    };   
    let chartBuilder = new SimpleChartBuilder();
    let chart = await chartBuilder.build(chartModel);  
    canvas.drawChart(chart)
}

draw();



