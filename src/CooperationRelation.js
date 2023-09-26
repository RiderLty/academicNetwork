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

//论文作者之间合作关系
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

const crerateGraph = (paperList) => {//作者之间有过论文合作 即同一篇论文作者s 则存在边
    let autherPapers = {}//作者的paper  autherPapers["jack"] = [156,258,372,...]
    paperList.forEach((paper, index) => {
        paper["AuthorNames-Deduped"].forEach(name => {
            if (autherPapers[name] === undefined) {
                autherPapers[name] = [index]
            } else {
                autherPapers[name].push(index)
            }
        })
    })

    let nodes = Object.keys(autherPapers)
    let edgeSet = new Set()
    let edges = []
    nodes.forEach((currentName, currentIndex) => {
        const a = autherPapers[currentName]
        nodes.forEach((name, index) => {
            if (currentIndex < index) {
                const b = autherPapers[name]
                for (let _a of a) {
                    for (let _b of b) {
                        if (_a === _b) {
                            edgeSet.add(`${currentIndex}-${index}`)
                            break
                        }
                    }
                }
            }
        })
    })
    edgeSet.forEach(edge => {
        edges.push(edge.split("-"))
    })
    return {
        nodes: nodes,// [name_1,name_2,......]
        edges: edges,//  [  [学者姓名index_1  -> 学者姓名index_2]  , ...]
        autherPapers: autherPapers,//  作者 -> [paper_1_index,paper_2_index,...] 
        paperMap: paperList//   paperindex -> {title:...,doi:...,...}
    }
}





export default function CooperationRelation(props) {
    const UID = useRef(uuid.v1())
    const chart = useRef(null)
    const [loading, setLoading] = useState(false)
    const myChart = useRef(null)

    const visualConfig = {
        maxSymbolSize: 10,
        maxEdgeWidth: 10,
        seriesNum: 8
    }

    const createChartDom = () => {
        var chartDom = document.getElementById(UID.current);
        myChart.current = echarts.init(chartDom, "default");
        const option = {
            title: {
                text: '合作关系网络',
            },
            tooltip: {},
            legend: [],
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'quinticInOut',

            series: [
                {

                    focusNodeAdjacency: true,
                    name: '论文标题',
                    type: 'graph',
                    layout: 'force',
                    force: {
                        repulsion: 100,
                        gravity: 0.3,
                        layoutAnimation: true,

                    },
                    data: [],
                    links: [],
                    categories: [],

                    roam: true,
                    label: {
                        color: "#000000",
                        show: false
                    },
                    itemStyle: {
                        normal: { // 默认样式

                            opacity: 1// 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。默认0.5

                        },
                        emphasis: { // 高亮状态

                        }
                    },
                    lineStyle: { // ========关系边的公用线条样式。
                        normal: {
                            color: 'source',
                            width: 2,
                            type: 'solid', // 线的类型 'solid'（实线）'dashed'（虚线）'dotted'（点线）
                            curveness: 0.2, //曲度
                        },
                        emphasis: { // 高亮状态
                        }
                    },
                }
            ]
        }
        myChart.current.setOption(option)
    }

    const beforeUnmount = () => {
        myChart.current.setOption(
            {
                legend: [],
                series: [
                    {
                        data: [],
                        links: [],
                        categories: [],
                    }
                ]
            }
        )
    }
    const updateChartOption = (data) => {
        let links = []
        let nodes = []
        let nodeSize = {}
        let maxNode = 1
        data.edges.forEach(edge => {
            links.push(
                {
                    "source": edge[0],
                    "target": edge[1],
                }
            )
            if (nodeSize[edge[0]] === undefined) {
                nodeSize[edge[0]] = 1
            } else {
                nodeSize[edge[0]] += 1
                if (maxNode < nodeSize[edge[0]]) {
                    maxNode = nodeSize[edge[0]]
                }
            }
            if (nodeSize[edge[1]] === undefined) {
                nodeSize[edge[1]] = 1
            } else {
                nodeSize[edge[1]] += 1
                if (maxNode < nodeSize[edge[1]]) {
                    maxNode = nodeSize[edge[1]]
                }
            }

        })
        data.nodes.forEach((name, index) => {
            nodes.push(
                {
                    "id": index,
                    "name": name,
                    "connectedNum": nodeSize[index],
                    "symbolSize": 8,
                    "attributes": {
                        "modularity_class": 0
                    },
                    // "label": {
                    //     "normal": {
                    //         "show": true
                    //     }
                    // },
                    // "category": Math.ceil(Math.random()*visualConfig.seriesNum)
                    category: Math.round(((nodeSize[index] || 0) * visualConfig.seriesNum) / maxNode)
                }
            )
        })
        var graph = {
            "nodes": nodes,
            "links": links
        }
        var categories = [];
        const steep = maxNode / visualConfig.seriesNum
        for (var i = 0; i < visualConfig.seriesNum - 1; i++) {
            categories[i] = {
                name: Math.ceil(i * steep) + "~" + Math.ceil((i + 1) * steep)
            };
        }
        const option = {
            legend: [{
                data: categories.map(function (a) {
                    return a.name;
                })
            }],
            series: [
                {
                    data: graph.nodes,
                    links: graph.links,
                    categories: categories,
                    tooltip: {
                        formatter: function (params) {
                            if (params.dataType === 'node') {
                                return params.data.name + "</br>" +
                                    "合作者数量" + (params.data.connectedNum === undefined ? 0 : params.data.connectedNum)
                            } else if (params.dataType === 'edge') {
                                const name_s = data.nodes[params.data.source]
                                const name_t = data.nodes[params.data.target]
                                const papers_s = data.autherPapers[name_s]
                                const papers_t = data.autherPapers[name_t]
                                const unicon = papers_s.filter(function (v) {
                                    return papers_t.indexOf(v) !== -1
                                })
                                let cooperation = ""
                                for (let paperIndex of unicon) {
                                    cooperation += data.paperMap[paperIndex].Title + "</br>"
                                }
                                return cooperation
                            }
                        }
                    }
                }
            ]
        }
        myChart.current.setOption(option)
        myChart.current.on("click", (args) => {
            if (args.dataType === "node") {//论文被选中 
                PubSub.publishSync("author_selected", args.name)
                console.log(args.name)
            } else {//边选中 source->target
                const name_s = data.nodes[args.data.source]
                const name_t = data.nodes[args.data.target]
                const papers_s = data.autherPapers[name_s]
                const papers_t = data.autherPapers[name_t]
                const unicon = papers_s.filter(function (v) {
                    return papers_t.indexOf(v) !== -1
                })
                for (let paperIndex of unicon) {
                    PubSub.publishSync("paper_selected", paperIndex)
                    console.log(paperIndex)
                }
            }
        }
        )


        //  return {
        //         nodes: nodes,// [name_1,name_2,......]
        //         edges: edges,//  [  [学者姓名index_1  -> 学者姓名index_2]  , ...]
        //         autherPapers: autherPapers,//  作者 -> [paper_1_index,paper_2_index,...] 
        //         paperMap: paperList//   paperindex -> {title:...,doi:...,...}
        //     }
        myChart.current.on("mouseover", { dataType: "node", }, (args) => {
            if (args_data_name_ref.current === args) {
                return
            } else {
                args_data_name_ref.current = args
            }


            let IDcount = 0

            const nameDulp = [args.data.name]

            const nodes = [
                {
                    name: args.data.name,
                    itemStyle: {

                        color: "#FF5722"
                    },
                    symbolSize: 20,
                }
            ]
            const links = []
            const name = args.data.name
            const papers = data.autherPapers[name]
            papers.forEach(paperIndex => {
                nodes.push(
                    {
                        name: data.paperMap[paperIndex].Title,
                        itemStyle: {
                            color: "#0288D1"
                        },
                        symbolSize: 10
                    }
                )
                links.push(
                    {
                        source: args.data.name,
                        target: data.paperMap[paperIndex].Title,
                        lineStyle: {
                            color: "#0288D1"
                        }
                    }
                )
                data.paperMap[paperIndex]["AuthorNames-Deduped"].forEach(auname => {
                    if (nameDulp.indexOf(auname) == -1) {
                        nameDulp.push(auname)
                        nodes.push(
                            {
                                name: auname,
                                itemStyle: {
                                    color: "#D90051"
                                },
                                symbolSize: 5
                            }
                        )
                    }
                    links.push(
                        {
                            source: data.paperMap[paperIndex].Title,
                            target: auname,
                            lineStyle: {
                                color: "#D90051"
                            }
                        }
                    )
                })
            }
            )
            drawSmall({
                nodes: nodes,
                links: links
            })
        })
    }
    const args_data_name_ref = useRef("")

    const handelDataChange = () => {
        if (props.paperData === null) {
            console.log("empty")
        } else {
            updateChartOption(crerateGraph(props.paperData))
        }
    }

    const smallChart = useRef(null)
    const drawSmall = (data) => {
        if (smallChart.current === null) {
            smallChart.current = echarts.init(document.getElementById("cooperSmallCardView"), "default");
            smallChart.current.setOption({
                title: {
                    text: ''
                },
                tooltip: {},
                animationDurationUpdate: 1500,
                animationEasingUpdate: 'quinticInOut',
                series: [
                    {
                        zoom:3,
                        focusNodeAdjacency: true,
                        name: '',
                        type: 'graph',
                        layout: 'force',
                        data: [],
                        links: [],
                        roam: true,
                        label: {
                            position: 'right',
                            formatter: '{b}'
                        },
                        force: {
                            layoutAnimation: false
                        },
                        itemStyle: {
                            normal: { // 默认样式
                                label: {
                                    show: true,
                                    color: "#000000",
                                    opacity: 0.6
                                },
                                opacity: 1// 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。默认0.5

                            },
                            emphasis: { // 高亮状态
                                label: {
                                    show: true,
                                    color: "#000000",
                                    opacity: 1
                                },
                            }
                        },
                    }
                ]
            })
        }
        smallChart.current.setOption({
            series: [
                {
                    data: data.nodes,
                    links: data.links,
                }
            ]
        })
    }





    useEffect(() => {
        // drawSmall()
        createChartDom()
        return () => {
            beforeUnmount()
        }
    }, [])

    useEffect(handelDataChange, [props.paperData])



    const [check, setcheck] = useState(true)
    const handelCheck = () => {
        myChart.current.setOption(
            {
                series: [
                    {

                        layout: !check ? 'force' : 'circular',
                    }]
            }
        )

        setcheck(check => !check)

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
        myChart.current.setOption(
            {
                series: [
                    {
                        force: {
                            gravity: newValue / 50
                        },
                    }]
            }
        )
    };
    const [siderValue_2, setsiderValue_2] = useState(15)

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
            <div style={{ display: loading ? "none" : "inline" }} >
                <div id={UID.current} style={{
                    width: 1000,
                    height: 840,
                    float: "left"
                }} ></div>
            </div>
            <div>
                <div style={{ display: loading ? "inline" : "none" }}>
                    正在加载....
                </div>
            </div>
            <Paper style={
                {
                    width: 550,
                    height: 840,
                    float: "right"
                }
            } elevation={3} >
                <div style={{ width: 550, height: 550 }} id="cooperSmallCardView" >
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
                                icon={<GrainIcon />}
                                style={{ width: 100 }}
                                label={check ? "force" : "circular"}
                                color={check ? "primary" : "secondary"}
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
                            label={"引力:" + siderValue_2 / 50}
                            color={"primary"}
                            variant="outlined"
                        />
                        <PrettoSlider style={{ width: 350, marginLeft: 15, color: "#FF5722" }} min={0} max={50} value={siderValue_2} onChange={handleSideerChange_2} />
                    </Grid>



                </Grid>
            </Paper>
        </div >



    )

}

