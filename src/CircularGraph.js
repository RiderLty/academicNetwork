import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use } from 'echarts';
import PubSub from 'pubsub-js'
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import Chip from '@material-ui/core/Chip';
import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import LinearScaleIcon from '@material-ui/icons/LinearScale';
import GrainIcon from '@material-ui/icons/Grain';
import PanoramaVerticalIcon from '@material-ui/icons/PanoramaVertical';
import WifiTetheringIcon from '@material-ui/icons/WifiTethering';
import LabelOffIcon from '@material-ui/icons/LabelOff';
import LabelIcon from '@material-ui/icons/Label';
import ColorLensIcon from '@material-ui/icons/ColorLens';
//论文之间引用关系图
const PrettoSlider = withStyles({
    root: {
        color: '#52af77',
        height: 8,
    },
    thumb: {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        marginTop: -8,
        marginLeft: -12,
        '&:focus, &:hover, &$active': {
            boxShadow: 'inherit',
        },
    },
    active: {},
    valueLabel: {
        left: 'calc(-50% + 4px)',
    },
    track: {
        height: 8,
        borderRadius: 4,
    },
    rail: {
        height: 8,
        borderRadius: 4,
    },
})(Slider);
const crerateGraph = (paperList) => {//从论文数据 创建图 返回包括  点列表 边列表 数据映射
    //论文数组固定格式
    //现在的创建图函数 
    //使用论文作为节点 引用关系代表存在边 是有向图
    //会有多版图创建函数 并由用户自行选择或者每个图标按需选择
    var nodes = []
    var edges = []
    paperList.forEach((paper, index) => {
        nodes.push(index)
    })

    const DOI2Paper = {}

    paperList.forEach((currentPaper, currentIndex) => {
        DOI2Paper[currentPaper["DOI"]] = [currentPaper, currentIndex]
    })



    const graphTest = {}




    paperList.forEach((currentPaper, currentIndex) => {

        let InternalReferences = Array.from(new Set(currentPaper.InternalReferences.split(";")))
        graphTest[currentIndex] = []
        InternalReferences.forEach(DOI => {
            const refEdPaper = DOI2Paper[DOI]
            if (refEdPaper !== undefined) {
                // edges.push([currentPaper.Title, refEdPaper[0].Title, currentPaper, refEdPaper[0]])
                graphTest[currentIndex].push(refEdPaper[1])
            }
        })
    })

    // console.log(JSON.stringify(graphTest))

    const getCirs = (graph) => {//计算 去除存在的环
        let ans = new Set()
        const dfs = (graph, trace, start) => {
            trace = JSON.parse(JSON.stringify(trace))
            if (trace.indexOf(start) !== -1) {
                const index = trace.indexOf(start)
                let tmp = []
                for (let i = index; i < trace.length; i++) {
                    tmp.push(trace[i])
                }
                ans.add(JSON.stringify(tmp))
                return
            }
            trace.push(start)
            for (let i of graph[start]) {
                dfs(graph, trace, i)
            }
        }
        for (let startNode in graph) {
            dfs(graph, [], startNode)
        }
        const result = []
        for (let cir of ans) {
            result.push(JSON.parse(cir))
        }
        return result
    }

    const needDisConnect = new Set()

    // console.log(getCirs(graphTest))


    getCirs(graphTest).forEach(cirArray => {
        needDisConnect.add(cirArray[0] + "-" + cirArray[1]) //index1-index2 
    })

    for (let source in graphTest) {
        for (let target of graphTest[source]) {
            if (!needDisConnect.has(source + "-" + target)) {
                edges.push([paperList[source].Title, paperList[target].Title, paperList[source], paperList[target]])
            }
        }
    }



    return {
        nodes: nodes,
        edges: edges,
        datamap: paperList
    }
}



export default function CircularGraph(props) {
    const UID = useRef(uuid.v1())

    const visualConfig = useRef({
        maxSymbolSize: 100,
        seriesNum: 6
    })

    var myChart = useRef(null)

    const initGraph = () => {
        myChart.current = echarts.init(document.getElementById(UID.current), "default")
    }

    const initOption = (data) => {

        let nodes = []
        let links = []
        let sizeMap = {}//被引用次数
        let maxRef = 1//最多引用次数的论文

        const linkedNodes = new Set()//筛选无引用关系的论文

        data.edges.forEach(edge => {
            // links.push(
            //     {
            //         "source": edge[0],
            //         "target": edge[1],
            //     }
            // )

            links.push(
                {
                    source: edge[1],
                    target: edge[0],
                    value: 1
                }
            )

            linkedNodes.add(edge[0])
            linkedNodes.add(edge[1])
            if (sizeMap[edge[1]] == undefined) {
                sizeMap[edge[1]] = 1
            } else {
                sizeMap[edge[1]] += 1
                if (sizeMap[edge[1]] > maxRef) {
                    maxRef = sizeMap[edge[1]]
                }
            }
        })


        data.datamap.forEach((paper, index) => {
            if (linkedNodes.has(paper.Title)) {
                nodes.push(
                    {

                        "name": paper.Title,
                        "paper": paper,
                        "index": index,
                        "symbolSize": visualConfig.current.maxSymbolSize * (sizeMap[paper.Title] || 0) / (maxRef * 0.7) + maxRef * 0.3,
                        "category": Math.round(((sizeMap[paper.Title] || 0) * visualConfig.current.seriesNum) / maxRef),
                        // "depth":Number(paper.Year)-1990
                    }
                )
            }

        })



        var graph = {
            "nodes": nodes,
            "links": links
        }


        var categories = [];
        const steep = maxRef / visualConfig.current.seriesNum
        for (var i = 0; i < visualConfig.current.seriesNum; i++) {
            categories[i] = {
                name: Math.round(i * steep) + "~" + Math.round((i + 1) * steep)
            };
        }

        const option = {
            title: {
                text: '引用关系',
            },
            legend: [{
                data: categories.map(function (a) {
                    return a.name;
                })
            }],
            tooltip: {
                position: function (pos, params, dom, rect, size) {
                    // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                    // var obj = { top: 60 };
                    let obj = { letf: 5 }
                    // obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                    obj[['top', 'bottom'][+(pos[1] < size.viewSize[1] / 2)]] = 5;
                    return obj;
                },

                formatter: function (params) {
                    if (params.dataType === 'node') {

                        let paper = params.data.paper
                        let tooltipLength = Math.max(paper.AuthorNames.length, paper.Title.length)
                        let abstract = ""
                        for (let i = 0; i < paper.Abstract.length / tooltipLength; i++) {
                            abstract += (paper.Abstract.substr(i * tooltipLength, tooltipLength) + "<br/>")
                            if (i > 8) {
                                abstract += "..."
                                break
                            }
                        }
                        return "标题 : " + paper.Title + "<br/>" +
                            "年份 : " + paper.Year + "<br/>" +
                            "作者 : " + paper.AuthorNames + "<br/>" +
                            "被引频次 " + (sizeMap[params.data.paper.Title] || 0) + "<br/>" +
                            "摘要 : " + abstract
                        // return "paper.Title"
                    } else if (params.dataType === 'edge') {
                        return params.data.source + " > " + params.data.target
                    }
                }
            },
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'quinticInOut',
            series: [
                {
                    focusNodeAdjacency: true,
                    name: '论文标题',
                    type: !check_ref.current ? "graph" : "sankey",
                    // type: "sankey",
                    layout: 'circular',

                    circular: {
                        rotateLabel: true
                    },
                    data: graph.nodes,
                    links: graph.links,
                    categories: categories,
                    roam: true,
                    label: {

                        color: "#000000",
                        show: false
                    },
                    itemStyle: {
                        normal: { // 默认样式
                            borderType: 'solid', // 图形描边类型，默认为实线，支持 'solid'（实线）, 'dashed'(虚线), 'dotted'（点线）。
                            borderColor: '#000000', // 设置图形边框为淡金色,透明度为0.4
                            borderWidth: 0, // 图形的描边线宽。为 0 时无描边。
                            opacity: 1 // 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。默认0.5

                        },
                    },
                    lineStyle: { // ========关系边的公用线条样式。
                        normal: {
                            color: 'source',
                            width: 2, //线的粗细
                            type: 'solid', // 线的类型 'solid'（实线）'dashed'（虚线）'dotted'（点线）
                            curveness: 0.3, // 线条的曲线程度，从0到1
                        },
                        emphasis: { // 高亮状态

                        }
                    },
                    edgeSymbol: ['none', 'arrow'],
                    edgeSymbolSize: 5,

                }
            ]
        }
        myChart.current.setOption(option);

        myChart.current.on("click", { dataType: "node" }, (args) => {
            PubSub.publishSync("paper_selected", args.data.index)
        }
        )

        myChart.current.on("mouseover", { dataType: "node" }, (args) => {

            if (args_data_index_ref.current === args.data.index) {
                return
            } else {
                args_data_index_ref.current = args.data.index
            }

            const currentPaper = args.data.paper
            const fromOther = []//论文 引用别的
            const toOther = []//论文 被别的引用
            const nodes = [
                {
                    name: "_head",
                    value: 100,
                    symbolSize: 0,
                    itemStyle: {

                        color: "#ffffff"
                    },
                    label: {
                        show: false
                    }
                },
                {
                    name: "_tai",
                    value: 100,
                    symbolSize: 0,
                    itemStyle: {

                        color: "#ffffff"
                    },
                    label: {
                        show: false
                    }
                },
                {
                    name: currentPaper.Title,
                    itemStyle: {
                        color: "#512DA8",

                    },
                    symbolSize: 20,
                },
            ]
            const links = []

            const pushTai = (nodename) => {
                nodes.push({
                    name: nodename,
                    itemStyle: {
                        color: "#0097A7",
                    },
                    symbolSize: 20,
                })
                links.push({
                    source: nodename,
                    target: "_tai",
                    lineStyle: {
                        color: "#ffffff",
                        width: 0
                    }
                })
                links.push({
                    source: currentPaper.Title,
                    target: nodename
                })
            }

            const pushHead = (nodename) => {
                nodes.push({
                    name: nodename,
                    itemStyle: {
                        color: "#FFC107",
                    },
                    symbolSize: 20,
                })
                links.push({
                    source: "_head",
                    target: nodename,
                    lineStyle: {
                        color: "#ffffff",
                        width: 0
                    }
                })
                links.push({
                    source: nodename,
                    target: currentPaper.Title
                })

            }

            let InternalReferences = currentPaper.InternalReferences.split(";")
            for (let doi of InternalReferences) {
                fromOther.push(doi)
            }
            data.edges.forEach(edge => {
                if (edge[0] === currentPaper.Title) {
                    if (fromOther.indexOf(edge[3]["DOI"]) === -1) {
                        fromOther.push(edge[3].Title)//当前文章引用别的的
                    }

                } else if (edge[1] === currentPaper.Title) {
                    toOther.push(edge[2].Title)

                }
            })

            //引用的论文 有重复 数据集问题或者作者的问题
            Array.from(new Set(fromOther)).forEach(nodename => {
                pushHead(nodename)
            })
            Array.from(new Set(toOther)).forEach(nodename => {
                pushTai(nodename)
            })

            drawSmallView(nodes, links)



            //有的会生成重复节点 看下
        }
        )


    }

    const args_data_index_ref = useRef("")

    const sub = useRef(null)

    const handelDataChange = () => {
        if (props.paperData === null) {
            console.log("empty")
        } else {
            initOption(crerateGraph(props.paperData))
        }
    }


    useEffect(initGraph, [])
    useEffect(handelDataChange, [props.paperData])


    const smallChart = useRef(null)
    const drawSmallView = (nodes, links) => {
        if (smallChart.current === null) {
            smallChart.current = echarts.init(document.getElementById("circularSmallView"), "default")
            smallChart.current.setOption(
                {

                    tooltip: {},
                    series: [
                        {
                            repulsion: [10, 200],
                            type: 'graph',
                            layout: 'force',
                            data: [],
                            links: [],
                            roam: true,
                            label: {
                                position: 'right',
                                show: true,
                                color: "#000000",
                                opacity: 0.9
                            },
                            force: {
                                layoutAnimation: false,
                                initLayout: "circular"
                            },

                            lineStyle: {
                                normal: {
                                    width: 3,
                                    color: "target"
                                }
                            },
                            edgeSymbolSize: 10,
                            edgeSymbol: ['none', 'arrow'],
                        }
                    ]
                }
            )
        }

        smallChart.current.clear()
        smallChart.current.setOption(
            {

                tooltip: {},
                series: [
                    {
                        zoom:3,
                        repulsion: [10, 200],
                        type: 'graph',
                        layout: 'force',
                        data: [],
                        links: [],
                        roam: true,
                        label: {
                            position: 'right',
                            show: true,
                            color: "#000000",
                            opacity: 0.9
                        },
                        force: {
                            layoutAnimation: false,
                            initLayout: "circular"
                        },

                        lineStyle: {
                            normal: {
                                width: 3,
                                color: "target"
                            }
                        },
                        edgeSymbolSize: 10,
                        edgeSymbol: ['none', 'arrow'],
                    }
                ]
            }
        )

        smallChart.current.setOption(
            {
                series: [
                    {
                        data: nodes,
                        links: links,
                    }
                ]
            }
        )
    }


    const check_ref = useRef(false)
    const [check, setcheck] = useState(false)
    const handelCheck = () => {
        // myChart.current.setOption(
        //     {
        //         series: [
        //             {
        //                 type :  ! check?  "graph" : "sankey"
        //             }]
        //     }
        // )

        check_ref.current = !check_ref.current
        setcheck(check => !check)
        initOption(crerateGraph(props.paperData))
    }

    const handleSideerChange_1 = (event, newValue) => {
        setsiderValue_1(newValue);
        myChart.current.setOption(
            {
                series: [
                    {

                        lineStyle: { // ========关系边的公用线条样式。
                            normal: {
                                curveness: newValue / 50, //曲度
                            }
                        },

                    }]
            }
        )
    };
    const [siderValue_1, setsiderValue_1] = useState(10)

    const handleSideerChange_2 = (event, newValue) => {
        setsiderValue_2(newValue);
        visualConfig.current.maxSymbolSize = newValue * 2
        initOption(crerateGraph(props.paperData))
    };
    const [siderValue_2, setsiderValue_2] = useState(50)

    const [check_lab, setcheck_lab] = useState(false)
    const handelCheck_lab = () => {
        myChart.current.setOption(
            {
                series: [
                    {

                        label: {
                            color: "#000000",
                            show: !check_lab
                        },
                    }
                ]
            }
        )
        setcheck_lab(check_lab => !check_lab)
    }


    return (
        <div style={{ display: "inline" }} >
            <div style={{ display: "inline" }} >
                <div id={UID.current} style={{
                    width: 1000,
                    height: 840,
                    float: "left"
                }} ></div>
            </div>

            <Paper style={
                {
                    width: 550,
                    height: 840,
                    float: "right"
                }
            } elevation={3} >
                <div style={{ width: 550, height: 550 }} id="circularSmallView" >
                </div>
                <Grid
                    container
                    spacing={3}
                // direction="column"
                // justify="center"
                // alignItems="flex-start"
                >


                    <Grid item xs={12}>
                        <div style={{ width: 450, marginLeft: 50, display: "inline-flex" }}>
                            <Chip
                                icon={<ColorLensIcon />}
                                style={{ width: 100 }}
                                label={check ? "sankey" : "circular"}
                                color={check ? "secondary" : "primary"}
                                variant="outlined"
                            />
                            <div style={{ marginLeft: 3 }} >
                                <Switch
                                    checked={check}
                                    onChange={handelCheck}
                                    name="checkedA"
                                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                                />

                            </div>
                        </div>
                    </Grid>


                    <Grid item xs={12}>
                        <div style={{ width: 450, marginLeft: 50, display: "inline-flex" }}>
                            <Chip
                                icon={check_lab ? <LabelIcon /> : <LabelOffIcon />}
                                style={{ width: 100 }}
                                label={check_lab ? "show" : "hide"}
                                color={check_lab ? "primary" : "secondary"}
                                variant="outlined"
                            />
                            <div style={{ marginLeft: 3 }} >
                                <Switch
                                    checked={check_lab}
                                    onChange={handelCheck_lab}
                                    name="checkedA"
                                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                                />

                            </div>
                        </div>
                    </Grid>


                    <Grid item xs={12} spacing={3}>
                        <Chip
                            icon={<PanoramaVerticalIcon />}
                            style={{ width: 100, marginTop: -21, marginLeft: 50 }}
                            label={"曲度:" + siderValue_1 / 50}
                            color={"primary"}
                            variant="outlined"
                        />
                        <PrettoSlider style={{ width: 350, marginLeft: 15, color: "#00796B" }} min={0} max={50} value={siderValue_1} onChange={handleSideerChange_1} />
                    </Grid>
                    <Grid item xs={12} spacing={3}>
                        <Chip
                            icon={<WifiTetheringIcon />}
                            style={{ width: 100, marginTop: -21, marginLeft: 50 }}
                            label={"尺寸:" + siderValue_2 * 2}
                            color={"primary"}
                            variant="outlined"
                        />
                        <PrettoSlider style={{ width: 350, marginLeft: 15, color: "#FF5722" }} min={0} max={100} value={siderValue_2} onChange={handleSideerChange_2} />
                    </Grid>



                </Grid>
            </Paper>
        </div >
    )

}