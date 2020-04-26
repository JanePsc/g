import { svg, log } from "../util.js";
import { Layer, } from "./item.js";
import { ContextBuilder } from "./context.js"; 
import { SVGRender } from "./svgRender.js";

export class Canvas {
    constructor(domElement) {
        this.element = domElement;
        this.init();
        this.builder = new ContextBuilder(this.render);
        this.rootContext = this.builder.buildItemContext(new Layer());
        this.rootContext.renderObject.element = this.canvasElement;
        this.contentLayer = this.createLayer(this.rootContext);
    }

    init() { }

    drawChart(chart) {
        if (chart == null) return;
        this.clear();
        this.chart = chart;
        this.builder.buildChart(this.chart, this.contentLayer);
        chart.context.view.doRender(chart.context);
        let nodes = chart.nodes.slice(0);
        while (nodes.length > 0) {
            let node = nodes.shift();
            node && this.drawNode(node);
        }
    }

    createLayer(parent) {
        let context = this.builder.buildItemContext(new Layer(), parent);
        context.view.doRender(context);
        return context;
    }

    drawNode(node) {
        this.builder.buildNode(node, this.chart.context);
        if (node.isLane) {
            if (node.nodes.length > 0) {
                let i, child, children = node.nodes;
                for (i in children) {
                    child = children[i];
                    if (child.rendered) continue;
                    this.drawNode(child);
                }
            }
        }
        let context = node.context;
        context.view.doRender(context);
        if (node.isPool) {
            context.view.toFront(context);
        }
    }

    clear() {
        this.chart = null;
        // this.contentLayer.element;
    }
}

const SVG_Markup = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs></defs></svg>`;

export class SVGCanvas extends Canvas {

    init() {
        this.canvasElement = svg(SVG_Markup)[0];
        this.element.appendChild(this.canvasElement);
        this.render = new SVGRender(this);
    }

    setChartStyle(style) {

    }

    setNodeStyle(style) { }

    setEdgeStyle(style) { }


    move() { }

    resize() { }


    onRender() { }

    onShow() { }

    onHide() { }

    onRemove() { }

    onToggleOff() { }

    onToggleOn() { }

    onResize() { }

    onTranslate() { }

    onMoveStart() { }

    onMoveing() { }

    onMoveEnd() { }

    onStyle() { }

    on() { }

    off() { }
}