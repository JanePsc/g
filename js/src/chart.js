import { log, createManyOneRelation, copy } from "../util.js";
import { Bounds, Margin, Padding, Direction } from "./base.js";
import { Item, Text, Center, Layer, RectBorder, Edge } from "./item.js";

import { IconFactory, getIconParam } from "./icon.js";

const DefaultOptions = {
    border: new RectBorder(),
    padding: Padding.all(10, 5),
    edge: {
        isolate: true,
        styleName: "edge",
    },
};

DefaultOptions.node = {
    expandable: true,
    isolate: true,
    // style: {},
    // ratio: 1,
    styleName: "node",
    // border: border,
    padding: DefaultOptions.padding
};

DefaultOptions.iconNode = {
    create(model) {
        return new Center({
            border: DefaultOptions.border,
            bounds: {
                minWidth: 40,
                minHeight: 30
            },
            child: new Text({
                content: model.name
            })
        });
    }
};
DefaultOptions.iconEdge = {
    create(model, options) {
        return new Edge({
            markerEnd: "endArrow"
            // waypoints: this.waypoints,
            // markerEnd: "startArrow",
        });
    }
};

export class ChartItem {
    constructor(item) {
        this.item = item;
        this.context = null;
        this.model = {};
    }

    get id() {
        return this.model.id || this.item.id;
    }

    get mdata() {
        return this.context.mdata;
    }

    get ldata() {
        return this.context.ldata;
    }

    set owner(owner) {
        if (!(owner instanceof ChartLane || owner instanceof Chart))
            throw new Error(`owner ${owner.id} is not pool,lane,or chart`);
        // log("owner");
        // log(owner)
        createManyOneRelation(this, owner, "__owner", this.isEdge ? "edges" : "nodes");
    }

    get owner() {
        return this.__owner;
    }

    set chart(chart) {
        createManyOneRelation(this, chart, "__chart", this.isEdge ? "allEdges" : "allNodes");
    }

    get chart() {
        return this.__chart;
    }

    get rendered() {
        return this.context ? this.context.rendered : false;
    }

    async createItem() {
        let { icon, iconURI } = this.model,
            isEdge = this.type === "edge",
            uri = iconURI || this.chart.iconURI,
            iconMeta = IconFactory.lookup(getIconParam(icon, uri))
                || (isEdge ? DefaultOptions.iconEdge : DefaultOptions.iconNode),
            item = this.item = await iconMeta.create.call(iconMeta, this.model);
        copy(true, item, isEdge ? DefaultOptions.edge : DefaultOptions.node, iconMeta.options);
        item.chartNode = this;
        return item;
    }

    async setIcon(icon) {
        this.model.icon = icon;
        await this.createItem();
    }
}

export class ChartNode extends ChartItem {
    constructor(item) {
        super(item);
        this.edges = [];
    }

    get isNode() {
        return true;
    }

}

export class ChartEdge extends ChartItem {

    constructor(item) {
        super(item);
        this.__target = null;
        this.__source = null;
    }

    get sourceRef() {
        return this.model.sourceRef;
    }

    get targetRef() {
        return this.model.targetRef;
    }

    get source() {
        return this.__source && this.__source.id === this.sourceRef
            ? this.__source
            : (this.__source = this.chart.findNode(this.sourceRef));
    }

    get target() {
        return this.__target && this.__target.id === this.targetRef
            ? this.__target
            : (this.__target = this.chart.findNode(this.targetRef));
    }

    get isEdge() {
        return true;
    }

}

export class ChartLane extends ChartNode {

    constructor(item) {
        super(item);
        this.nodes = [];
        this.isLaneSet = false;
    }

    get isLane() {
        return true;
    }

    __changeHorizontal(bool) {
        this.item.axis = bool === true ? Direction.horizontal : Direction.vertical;
        let children = this.item.children;
        if (children) {
            children.forEach(child => {
                if (child.isArea) {
                    child.axis = bool === true ? Direction.vertical : Direction.horizontal;
                } else {
                    child.textDirection = bool === true ? Direction.vertical : Direction.horizontal;
                }
            });
        }
        if (this.isLaneSet) {
            this.nodes.forEach(node => node.__changeHorizontal(bool));
        }
    }
}

export class ChartPool extends ChartLane {

    constructor(item) {
        super(item);
    }

    get isPool() {
        return true;
    }

    setHorizontal(bool) {
        this.__changeHorizontal(bool);
    }
}

export class Chart extends ChartItem {

    constructor(item) {
        super(item);
        this.nodes = [];
        this.allNodes = [];
        this.allEdges = [];
    }

    get iconURI() {
        return this.model.iconURI;
    }

    get isChart() {
        return true
    }

    findNode(id) {
        return this.allNodes.find(o => o.id === id);
    }

    findEdge(id) {
        return this.allEdges.find(o => o.id === id);
    }
}

export class ChartBuilder {

    async createChart(model) {
        let chart = new Chart(new Layer());
        chart.model = model;
        chart.item.chartNode = chart;
        return chart;
    }

    async createChartNode(chart, type, model) {
        let isEdge = type === "edge",
            node = isEdge ? new ChartEdge() : type === "lane" ? new ChartLane() : type === "pool" ? new ChartPool() : new ChartNode();
        node.model = model;
        node.chart = chart;
        node.type = type;

        if (node.isLane) {
            node.isLaneSet = !!model.lanes;
        }
        await node.createItem();
        return node;
    }

    async build(model = {}) {
        let chart = await this.createChart(model);
        await this.buildElments(chart, model);
        return chart;
    }

    async buildElments(chart, model) { }

}

export class SimpleChartBuilder extends ChartBuilder {

    async buildElments(chart, model) {
        let elements = model.elements.slice(0);
        while (elements.length > 0) {
            let m = elements.shift();
            m && await this.__buildElement(chart, elements, m[0], m[1]);
        }
    }

    async __buildElement(chart, elements, type, model, owner) {
        let node = await this.createChartNode(chart, type, model);
        node.owner = owner || chart;
        if (node.isEdge) return node;
        if (node.isLane) {
            let { nodes, lanes } = model,
                i, childId, index, childModel, child,
                isLaneSet = node.isLaneSet = !!lanes && lanes.length > 0,
                children = isLaneSet ? lanes : nodes;

            if (children == null || children.length <= 0) return node;
            for (i in children) {
                childId = children[i];
                index = elements.findIndex(o => o[1].id === childId);
                if (index > -1) {
                    childModel = elements[index];
                    elements.splice(index, 1);
                    child = await this.__buildElement(chart, elements, childModel[0], childModel[1], node);
                } else {
                    child = chart.allNodes.find(o => o.id === childId);
                }
                if (child) {
                    child.owner = node;
                    child.isolateOwner = node.isolateOwner || node;
                }
            }
        }
        if (node.isPool) {
            node.setHorizontal(model.isHorizontal === true);
        }
        return node;
    }
}
