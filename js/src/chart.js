import { log, createManyOneRelation, copy } from "../util.js";
import { Bounds, Margin, Padding, Direction } from "./base.js";
import { Item, Text, Center, Layer, RectBorder, Edge, Marker, Symb, Path } from "./item.js";

import { IconFactory, getIconParam } from "./icon.js";

const DefaultOptions = {
    border: new RectBorder(),
    padding: Padding.all(10, 5),
    edge: {
        isolate: true,
        styleName: "edge",
    },
};
DefaultOptions.chart = {
    defs: [
        new Marker({
            id: "endArrow",
            // viewBox: "0 0 24 24",
            markerWidth: "13",
            markerHeight: "13",
            refX: "10",
            refY: "6",
            orient: "auto",
            children: [new Path({
                boundsIsInvalid: true,
                d: "M2,2 L2,11 L10,6 L2,2z",
                // style: { fill: "red" }
            })]
        }),

        // new Symb({
        //     id: "star",
        //     viewBox: "",
        //     children: [
        //         new Text({ content: "hello" })
        //     ]
        // }),
    ]
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

    get rendered() {
        return this.context ? this.context.rendered : false;
    }

    set owner(owner) {
        if (!(owner == null || owner instanceof ChartLane || owner instanceof Chart))
            throw new Error(`owner ${owner.id} is not pool,lane,or chart`);
        let oldOwner = this.__owner;
        if (oldOwner !== owner) {
            createManyOneRelation(this, owner, "__owner", this.isEdge ? "edges" : "nodes");
            let event = new CustomEvent('owner', { 'detail': { chartNode: this, owner: owner, oldOwner: oldOwner } });
            this.__chart.trigger(event);
        }
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

    set sourceRef(ref) {
        this.model.sourceRef = ref;
    }

    set targetRef(ref) {
        this.model.targetRef = ref;
    }

    get source() {
        return this.__source;
    }

    set source(obj) {
        if (this.__source == obj) return;
        createManyOneRelation(this, obj, "__source", "edges");
        this.model.sourceRef = obj ? obj.id : undefined;
        this.chart.trigger(new CustomEvent('model', { 'detail': { chartNode: this } }));
    }

    get target() {
        return this.__target;
    }

    set target(obj) {
        if (this.__target == obj) return;
        createManyOneRelation(this, obj, "__target", "edges");
        this.model.targetRef = obj ? obj.id : undefined;
        this.chart.trigger(new CustomEvent('model', { 'detail': { chartNode: this } }));
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
        this.listeners = [];
        this.unJointedEdges = [];
    }

    on(type, handle) {
        if (type && handle && typeof handle === "function") {
            this.listeners.push([type, handle]);
        }
        return this;
    }

    off(type, handle) {
        if (type) {
            let index;
            while (this.listeners.length > 0) {
                index = this.listeners.findIndex(o => o[0] === type && (handle ? o[1] === handle : true));
                if (index < 0) break;
                this.listeners.splice(index, 1);
            }
        }
        return this;
    }

    offAll() {
        this.listeners = [];
        return this;
    }

    trigger(event) {
        if (event == null) return;
        for (let listen of this.listeners) {
            if (listen[0] !== event.type) continue;
            listen[1](event);
        }
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

        let chartOptions = copy(true, {}, DefaultOptions.chart);
        let chart = new Chart(new Layer(chartOptions));
        chart.model = model;
        chart.chartBuilder = this;
        chart.item.chartNode = chart;
        chart.on("create", event => this.__handleCreateEvent(event));
        chart.on("remove", event => this.__handleRemoveEvent(event));
        chart.on("owner", event => this.__handleOwnerEvent(event));
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

        let event = new CustomEvent('create', { 'detail': { chartNode: node } });
        chart.trigger(event);
        // log(node)
        return node;
    }


    __handleCreateEvent(event) {
        // log(event);
    }

    __handleOwnerEvent(event) {
        if (event == null) return;
        let { chartNode, owner, oldOwner } = event.detail;
        // log(chartNode.chart.unJointedEdges)
        if (chartNode.chart) {
            if (chartNode.isNode) {
                this.jointRemains(chartNode);
            } else if (chartNode.isEdge) {
                this.joint(chartNode);
            }
        }
    }

    __handleRemoveEvent(event) {
        log(event);
    }

    async build(model = {}) {
        let chart = await this.createChart(model);
        await this.buildElments(chart, model);
        return chart;
    }

    async buildElments(chart, model) { }


    jointRemains(node) {
        // log(node.chart.unJointedEdges)
        let id = node.id;
        node.chart.unJointedEdges = node.chart.unJointedEdges.filter(o => (o.sourceRef == id || o.targetRef == id) && !this.joint(o));
    }

    joint(edge) {
        let { target, source, sourceRef, targetRef, id, chart } = edge,
            nodeList = chart.allNodes;
        // log(`edge id:${edge.id}   sourceRef:${sourceRef}   targetRef:${targetRef}`);
        if (!source && sourceRef) source = nodeList.find(o => o.id === sourceRef);
        if (!target && targetRef) target = nodeList.find(o => o.id === targetRef);
        if (!source || !target) {
            if (chart.unJointedEdges.findIndex(e => e.id === id) < 0) {
                chart.unJointedEdges.push(edge);
            }
            return false;
        }

        edge.source = source;
        edge.target = target;
        return true;
    }

    disJoint(edge) {
        let { target, source, chart } = edge;
        if (!source || !target) return;
        edge.source = null;
        edge.target = null;
        chart.unJointedEdges.push(edge);
    }

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
