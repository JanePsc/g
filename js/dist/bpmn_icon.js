import {
    IconFactory,
    Bounds, Align, Direction, Margin, Padding,
    Text, Line, Path, Image, Polygon, Rect,
    Marker, Edge,
    Layer, Flex, Row, Column, Center, Container, Stack, Positioned, Area,
    RectBorder, PolygonBorder, PolylineBorder, PathBorder, CircleBorder, EllipseBorder
} from "./g.min.js";

const rectBorder = new RectBorder(),
    roundRectBorder = new RectBorder({ rx: 8 }),
    circleBorder = new CircleBorder({ r: 15 }),
    textPadding = Padding.all(10, 5),
    circleStyle = { fill: "#111" },
    bg = new Rect();

const bpmn_icons = new Map([
    ["event", {
        "options": {
            bounds: {
                width: 30,
                height: 30,
                flex: 0
            },
            border: circleBorder,
        },
        create(model) {
            return new Center({
                bg: bg,
                extras: [new Positioned({
                    // position: {
                    //     // align: Align.center,
                    //     // direction: Direction.right
                    // },
                    child: new Container({
                        bg: bg,
                        child: new Text({
                            isTitle: true,
                            content: model.name
                        })
                    })
                })]
            });
        }
    }],
    ["startEvent", {
        "extends": "event",
        "options": {
            border: new PathBorder({
                style: circleStyle,
                fromBounds(b) {
                    let { x = 0, y = 0, width } = b,
                        r = width / 2, w = 2, r2 = r - w;
                    return { d: `M${x},${y + r} a ${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 m${w},0 a ${r2} ${r2} 0 1 1 ${r2 * 2} 0 a ${r2} ${r2} 0 1 1 ${-r2 * 2} 0` };
                }
            }),
        }
    }],
    ["endEvent", {
        "extends": "event",
        "itemStyle": [],
        "options": {
            border: new Path({
                style: circleStyle,
                fromBounds(b) {
                    let { x = 0, y = 0, width } = b,
                        r = width / 2, w = 5, r2 = r - w;
                    return { d: `M${x},${y + r} a ${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 m${w},0 a ${r2} ${r2} 0 1 1 ${r2 * 2} 0 a ${r2} ${r2} 0 1 1 ${-r2 * 2} 0` };
                }
            })
        }
    }],
    ["intermediateEvent", {
        "extends": "event",
        "options": {
            border: new PathBorder({
                fromBounds(b) {
                    let { x = 0, y = 0, width } = b,
                        r = width / 2, w = 3, r2 = r - w;
                    return { d: `M${x},${y + r} a ${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 m${w},0 a ${r2} ${r2} 0 1 0 ${r2 * 2} 0 a ${r2} ${r2} 0 1 0 ${-r2 * 2} 0` };
                }
            }),
        }
    }],
    ["intermediateCatchEvent", {
        "extends": "event",
        "options": {
            border: new PathBorder({
                fromBounds(b) {
                    let { x = 0, y = 0, width } = b,
                        r = width / 2, w = 3, r2 = r - w;
                    return { d: `M${x},${y + r} a ${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 m${w},0 a ${r2} ${r2} 0 1 0 ${r2 * 2} 0 a ${r2} ${r2} 0 1 0 ${-r2 * 2} 0` };
                }
            }),
        }
    }],
    ["boundaryEvent", {
        "extends": "event",
        "options": {
            border: new PathBorder({
                fromBounds(b) {
                    let { x = 0, y = 0, width } = b,
                        r = width / 2, w = 2, r2 = r - w;
                    return { d: `M${x},${y + r} a ${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 m${w},0 a ${r2} ${r2} 0 1 1 ${r2 * 2} 0 a ${r2} ${r2} 0 1 1 ${-r2 * 2} 0` };
                }
            }),
        }
    }],
    ["activity", {
        "options": {
            bounds: {
                minWidth: 80,
                minHeight: 30,
            },
            border: roundRectBorder
        },
        create(model) {
            return new Center({
                // hidden:true,
                child: new Text({
                    // wrap: true,
                    isTitle: true,
                    content: model.name
                })
            });
        }
    }],
    ["task", {
        "extends": "activity",
        "options": {}
    }],
    ["userTask", {
        "extends": "task",
        "options": {}
    }],
    ["serviceTask", {
        "extends": "task",
        "options": {}
    }],
    ["subProcess", {
        "extends": "activity",
        "options": {}
    }],
    ["transaction", {
        "extends": "activity",
        "options": {}
    }],
    ["callActivity", {
        "extends": "activity",
        "options": {}
    }],
    ["gateway", {
        "options": {
            bounds: {
                minWidth: 40,
                minHeight: 30
            },
            border: new PolygonBorder({
                fromBounds(b) {
                    let {
                        x = 0, y = 0, width, height
                    } = b;
                    return {
                        points: `${x},${y + height / 2} ${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height}`
                    };
                }
            })
        },
        create(model) {
            return new Center({
                extras: [new Positioned({
                    bg: new Rect(),
                    child: new Text({
                        isTitle: true,
                        content: model.name
                    })
                })]
            });
        }
    }],
    ["exclusiveGateway", {
        "extends": "gateway",
        "options": {}
    }],
    ["eventBasedGateway", {
        "extends": "gateway",
        "options": {}
    }],
    ["parallelGateway", {
        "extends": "gateway",
        "options": {}
    }],
    ["inclusiveGateway", {
        "extends": "gateway",
        "options": {}
    }],
    ["exclusiveEventBasedGateway", {
        "extends": "gateway",
        "options": {}
    }],
    ["complexGateway", {
        "extends": "gateway",
        "options": {}
    }],
    ["parallelEventBasedGateway", {
        "extends": "gateway",
        "options": {}
    }],

    ["dataObject", {
        "options": {
            bounds: {
                minWidth: 80,
                height: 30
            },
            border: new PolygonBorder({
                fromBounds(b) {
                    let {
                        x = 0, y = 0, width, height
                    } = b;
                    return {
                        points: `${x + 10},${y} ${x + width},${y} ${x + width - 10},${y + height} ${x},${y + height}`
                    };
                }
            }),
        },
        create(model) {
            return new Center({
                child: new Text({
                    isTitle: true,
                    content: model.name
                })
            });
        }
    }],

    ["flow", {
        "options": {
            markerEnd: "endArrow",
        },
        create(model) {
            return new Edge({
                sourceRef: model.sourceRef,
                targetRef: model.targetRef
            });
        }
    }],

    ["sequenceFlow", {
        "options": {
            markerEnd: "endArrow",
        },
        "extends": "flow",
    }],




    //     "sequenceFlow": {
    //         create(model, options) {
    //             return new Edge(smartAssign({
    //                 markerEnd: "endArrow",
    //             }, options));
    //         }
    //     },


    //     "messageFlow": {
    //         create(model, options) {
    //             return new Edge(smartAssign({}, options));
    //         }
    //     },
    //     "association": {
    //         create(model, options) {
    //             return new Edge(smartAssign({}, options));
    //         }
    //     },


    ["messageFlow", {
        "extends": "flow",
        "options": {
        },
    }],

    ["association", {
        "extends": "flow",
        "options": {
        },
    }],

    ["lane", {
        "options": {
            border: rectBorder,
            bounds: {
                minHeight: 80
            },
            isArea: true,
            flex: 1,
            padding: Padding.all(0),
            // styleName: "lane",
        },
        create(model) {
            let children = [];
            if (model.name) {
                children.push(new Container({
                    // border: rectBorder,
                    bg: bg,
                    padding: textPadding,
                    // textDirection: Direction.vertical,
                    child: new Text({
                        crossAxisAlign: Align.center,
                        isTitle: true,
                        content: model.name
                    })
                }));
            }
            children.push(new Area({
            
                flex: 1,
                //  border: rectBorder,
                // axis: Direction.horizontal,
                // textDirection: Direction.vertical,      
                bounds: { minWidth: 100, minHeight: 100 },
                // border: new RectBorder({
                //     styleName: "border",
                //     style: {
                //         "fill": "red"
                //     }
                // })
            }));


            return new Flex({
                // axis:Direction.vertical,
                // isArea: true,
                // border: rectBorder,
                // bg: new Rect(),
                children: children,
                //isHorizontal: ,
            });
        }
    }],
    ["pool", {
        "extends": "lane",
        "options": {
            bounds: {
                minWidth: 480,
                minHeight: 120
            },
            // axis: Direction.vertical,
            // styleName: "pool",
            isHorizontal: true
        }
    }],
    ["subflow", {
        "options": {
            bounds: {
                minHeight: 80
            },
            styleName: "subflow",
            padding: Padding.all(0),
            // axis: Direction.vertical,

        },
        create(model) {
            // console.log(options)
            let children = [];
            if (model.name) {
                children.push(new Container({
                    // border: rectBorder,
                    padding: textPadding,
                    child: new Text({
                        crossAxisAlign: Align.center,
                        content: model.name,
                        // textDirection: Direction.vertical,
                    })

                }));
            }
            children.push(new Area({
                flex: 1,
                bounds: { minWidth: 100, minHeight: 100 },
                // axis: Direction.horizontal,

                // axis: Direction.vertical,
                border: new RectBorder({
                    style: {
                        "stroke": "red"
                    }
                })
            }));

            children.push(new Container({
                // border: rectBorder,
                padding: textPadding,
                child: new Text({
                    crossAxisAlign: Align.center,
                    content: "footer"
                })
            }));
            return new Flex({           
                border: rectBorder,
                // bg: new Rect(),
                children: children,
                isHorizontal: model.isHorizontal === true

            });
        }
    }],
]);



IconFactory.defineIconSet({
    // modelType: "diagram/bpmn",
    // uri: "omg.org.bpmn",
    uri: "diagram.bpmn",
    icons: bpmn_icons
});
