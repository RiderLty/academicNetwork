import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use } from 'echarts';
import Slider from '@material-ui/core/Slider';
import PubSub from 'pubsub-js'
import { echartTheme } from "./echartTheme"

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import Chip from '@material-ui/core/Chip';

import { withStyles } from '@material-ui/core/styles';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import LinearScaleIcon from '@material-ui/icons/LinearScale';
import GrainIcon from '@material-ui/icons/Grain';
import PanoramaVerticalIcon from '@material-ui/icons/PanoramaVertical';
import WifiTetheringIcon from '@material-ui/icons/WifiTethering';
import LabelOffIcon from '@material-ui/icons/LabelOff';
import LabelIcon from '@material-ui/icons/Label';
import ColorLensIcon from '@material-ui/icons/ColorLens';


import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import TextField from '@material-ui/core/TextField';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem'


import FieldDistribution from "./FieldDistribution"

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

const useStyles = makeStyles((theme) => (
    {
        root: {
            width: 300,
        },
        searchIcon: {
            padding: theme.spacing(0, 2),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        inputRoot: {
            color: 'inherit',
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                width: '30ch',
                '&:focus': {
                    width: '40ch',
                },
            }
        },
    }
));

function valuetext(value) {
    return `${value}`;
}

export default function Sank(props) {
    const classes = useStyles();

    const theme_Index_arrary = useRef(null)

    const [theme_color_map, set_theme_color_map] = useState({})

    const [value, setValue] = useState([2015, 2020]);
    const valueRef = useRef([2015, 2020])
    const handleChange = (event, newValue) => {
        if (newValue !== valueRef.current) {
            setValue(newValue);
            valueRef.current = newValue
            handleArgsChange("year")
        }

    };


    const UID = useRef(uuid.v1())

    const visualConfig = {
        maxSize: 80,
        minSize: 30,
    }

    const cartesianProduct = (list) => {//传入一个作者的记录 生成笛卡尔积 传入之前就按照年份筛选了
        const layer = new Map()
        for (let rec of list) {
            if (layer[rec["year"]] === undefined) {
                layer[rec["year"]] = [rec]
            } else {
                layer[rec["year"]].push(rec)
            }
        }
        const years = Object.keys(layer)
        if (years.length > 1) {
            const links = []
            for (let i = 0; i < years.length - 1; i++) {
                const currentYear = years[i]
                const nextYear = years[i + 1]
                for (let rec_i of layer[currentYear]) {
                    for (let rec_j of layer[nextYear]) {
                        links.push(rec_i["theme"] + "_" + currentYear + "==>" + rec_j["theme"] + "_" + nextYear)
                    }
                }
            }
            return links
        } else {
            return []
        }
    }

    function stringToHash(string) {

        let hash = 0;

        if (string.length == 0) return hash;

        for (let i = 0; i < string.length; i++) {
            const char = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return hash;
    }

    const crerateGraph = (data, yearstart, yearend) => {
        const linkTmp = {}
        for (let authorHistory of data) {
            for (let link of cartesianProduct(authorHistory.filter(x => x["year"] >= yearstart && x["year"] <= yearend))) {
                linkTmp[link] = linkTmp[link] + 1 || 1
            }
        }
        const nodeSet = new Set()
        const nodes = []
        const links = []
        for (let rec in linkTmp) {
            const source = rec.split("==>")[0]
            const target = rec.split("==>")[1]
            nodeSet.add(source)
            nodeSet.add(target)
            links.push(
                {
                    source: source,
                    target: target,
                    value: linkTmp[rec]
                }
            )
        }

        const themeCount = {}//放入theme 
        for (let theme_year of nodeSet) {
            const theme = theme_year.substring(0, theme_year.length - 5)
            themeCount[theme] = themeCount[theme] + 1 || 1
        }

        const sortedThemearrary = Object.keys(themeCount).sort(function (a, b) { return themeCount[b] - themeCount[a]; })//当前的


        if (theme_Index_arrary.current === null) {
            theme_Index_arrary.current = sortedThemearrary
        }



        const theme_color_map_temp = {}
        for (let theme_year of nodeSet) {
            const year = Number(theme_year.substring(theme_year.length - 4))
            const theme = theme_year.substring(0, theme_year.length - 5)
            const themeIndex = theme_Index_arrary.current.indexOf(theme)
            theme_color_map_temp[theme] = echartTheme.color[themeIndex % echartTheme.color.length]
            nodes.push(
                {
                    name: theme_year,
                    depth: year - yearstart,
                    itemStyle: {
                        color: echartTheme.color[themeIndex % echartTheme.color.length]
                    },
                    value: 0.005
                }
            )
            // console.log("theme_color_map_temp",theme_color_map_temp)
            set_theme_color_map(theme_color_map_temp)
        }
        return {
            nodes: nodes,
            links: links
        }
    }

    const chart = useRef(null)

    const initChart = () => {
        var chartDom = document.getElementById(UID.current);
        var myChart = echarts.init(chartDom, "default");
        chart.current = myChart
        myChart.setOption({
            title: {
                text: '主题演化图'
            },
            tooltip: {
                trigger: 'item',
                triggerOn: 'mousemove',
                formatter: function (paprms) {
                    if (paprms.dataType === "node") {
                        const theme_year = paprms.data.name
                        const year = Number(theme_year.substring(theme_year.length - 4))
                        const theme = theme_year.substring(0, theme_year.length - 5)
                        return "年份: " + year + "</br>主题: " + theme + "</br>权重: " + paprms.value
                    } else {
                        const source = paprms.data.source
                        const target = paprms.data.target
                        const value = paprms.data.value
                        return "从" + source + "</br>到" + target + "</br>计数" + value
                    }
                },
                position: function (pos, params, dom, rect, size) {
                    // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                    // var obj = { top: 60 };
                    let obj = {
                        left: 20,
                        bottom: 20
                    }
                    // obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                    // obj[['top', 'bottom'][+(pos[1] < size.viewSize[1] / 2)]] = 5;
                    return obj;
                }
            },
            series: [
                {
                    type: 'sankey',
                    layoutIterations: 32,
                    data: [],
                    links: [],
                    // emphasis: {
                    //     focus: 'adjacency'
                    // },
                    lineStyle: {
                        color: 'gradient',
                        curveness: 0.4
                    },
                    label: {
                        show: false
                    }
                }
            ]
        });
        myChart.on("mouseover", (args) => {
            if (args.dataType === "edge") {

            } else if (args.dataType === "node") {
                const theme_year = args.data.name
                const year = Number(theme_year.substring(theme_year.length - 4))
                setsmallViewYear(year)
                const theme = theme_year.substring(0, theme_year.length - 5)
                console.log("hilightCom(theme)",theme)
                hilightCom(theme)
            }
        })
        myChart.on("mouseout", (args) => {
            disHilightCom()
        })
        // PubSub.subscribe("sank_author_selected",(msg,name) => {
        //     console.log("pub recve sank_author_selected",name)
        //     hilightAuthor(name)
        // })
    }

    const initOption = (data, type) => {
        if (type === "hide") {
            chart.current.setOption({
                series: [
                    {
                        data: data.nodes,
                        links: data.links,
                        lineStyle: {
                            opacity: 0.1
                        },
                        itemStyle: {
                            opacity: 0.3
                        }
                    }
                ]
            });
        } else {
            chart.current.setOption({
                series: [
                    {
                        data: data.nodes,
                        links: data.links,
                        lineStyle: {
                            opacity: 0.2
                        },
                        itemStyle: {
                            opacity: 1
                        }
                    }
                ]
            });
        }
        drawPie(data.links)
    }

    const usingGraphData = useRef(null)

    const calAuthorLinks = (list) => {
        const layer = new Map()
        for (let rec of list) {
            if (layer[rec["year"]] === undefined) {
                layer[rec["year"]] = [rec]
            } else {
                layer[rec["year"]].push(rec)
            }
        }
        const years = Object.keys(layer)
        if (years.length > 1) {

            const links = []
            for (let i = 0; i < years.length - 1; i++) {
                const currentYear = years[i]
                const nextYear = years[i + 1]
                for (let rec_i of layer[currentYear]) {

                    for (let rec_j of layer[nextYear]) {
                        if (rec_i["theme"] === rec_j["theme"]) {
                            links.push(rec_i["theme"] + "_" + currentYear + "==>" + rec_j["theme"] + "_" + nextYear)
                        } else {
                            const rec_first = layer[currentYear][0]
                            links.push(rec_first["theme"] + "_" + currentYear + "==>" + rec_j["theme"] + "_" + nextYear)
                        }
                    }
                }
            }
            return links
        } else {
            return []
        }
    }


    const getComHilightGraph = (comName) => {//高亮相关社区  不产生新边 只修改样式
        let currentLinks = []
        const hilightNodes = []
        for (let link of usingGraphData.current.links) {
            const sourceFlag = link.source.substring(0, link.source.length - 5) === comName
            const targetFlag = link.target.substring(0, link.source.length - 5) === comName
            if (sourceFlag && targetFlag) {//起始都是
                hilightNodes.push(link.source)
                hilightNodes.push(link.target)
                currentLinks.push({
                    source: link.source,
                    target: link.target,
                    value: link.value,
                    lineStyle: {
                        color: "#9C27B0",
                        opacity: 0.8
                    }
                })
            } else if (sourceFlag && !targetFlag) {//由此领域分流到其他领域的
                if (ref_checkStause.current["toOther"] === true) {
                    if (ref_checkStause.current["toOtherLable"] === true) {
                        hilightNodes.push(link.target)
                    }
                    currentLinks.push({
                        source: link.source,
                        target: link.target,
                        value: link.value,
                        lineStyle: {
                            color: "#2196F3",
                            opacity: 0.8
                        }
                    })
                } else {
                    currentLinks.push({
                        source: link.source,
                        target: link.target,
                        value: link.value,
                    })
                }

            } else if (!sourceFlag && targetFlag) {//汇向此领域的其他领域
                if (ref_checkStause.current["fromOther"] === true) {
                    if (ref_checkStause.current["fromOtherLable"] === true) {
                        hilightNodes.push(link.source)
                    }
                    currentLinks.push({
                        source: link.source,
                        target: link.target,
                        value: link.value,
                        lineStyle: {
                            color: "#4CAF50",
                            opacity: 0.8
                        }
                    })
                } else {
                    currentLinks.push({
                        source: link.source,
                        target: link.target,
                        value: link.value,
                    })
                }

            } else {//其他
                currentLinks.push(link)
            }
        }
        const currentNodes = []
        for (let node of usingGraphData.current.nodes) {
            if (hilightNodes.indexOf(node.name) !== -1) {
                const theme = node.name.substring(0, node.name.length - 5)
                const themeIndex = theme_Index_arrary.current.indexOf(theme)
                currentNodes.push({
                    name: node.name,
                    depth: node.depth,
                    itemStyle: {
                        opacity: 1,
                        color: echartTheme.color[themeIndex % echartTheme.color.length]
                    },
                    label: {
                        show: true
                    }
                })
            } else {
                currentNodes.push(node)
            }
        }
        return {
            nodes: currentNodes,
            links: currentLinks
        }
    }

    const getAuthorHilightGraph = (authorName) => {//高亮一个作者  产生新边
        let currentLinks = []
        let authorHistory = []
        for (let i = 0; i < props.sankdata.length; i++) {
            if (props.sankdata[i].length > 0 && props.sankdata[i][0].name === authorName) {
                authorHistory = props.sankdata[i]
                break
            }
        }
        const authorLinks = calAuthorLinks(authorHistory)

        const lineWidth = 2
        const hilightNodes = []

        // console.log("visualArgs.current === null",visualArgs.current )

        for (let link of usingGraphData.current.links) {
            const stringfyLink = link.source + '==>' + link.target
            if (authorLinks.indexOf(stringfyLink) != -1) {
                hilightNodes.push(link.source)
                hilightNodes.push(link.target)
                currentLinks.push({
                    source: link.source,
                    target: link.target,
                    value: link.value - lineWidth < 0 ? 0 : (link.value - lineWidth) / 2
                })
                currentLinks.push({
                    source: link.source,
                    target: link.target,
                    value: lineWidth,
                    lineStyle: {
                        color: "#d90051",
                        opacity: 1
                    }
                })
                currentLinks.push({
                    source: link.source,
                    target: link.target,
                    value: link.value - lineWidth < 0 ? 0 : (link.value - lineWidth) / 2
                })
            } else {
                currentLinks.push(link)
            }
        }

        const currentNodes = []
        for (let node of usingGraphData.current.nodes) {
            if (hilightNodes.indexOf(node.name) !== -1) {
                const theme = node.name.substring(0, node.name.length - 5)
                const themeIndex = theme_Index_arrary.current.indexOf(theme)


                currentNodes.push({
                    name: node.name,
                    depth: node.depth,
                    itemStyle: {
                        opacity: 1,
                        color: echartTheme.color[themeIndex % echartTheme.color.length]

                    },
                    label: {
                        show: true
                    }
                })
            } else {
                currentNodes.push(node)
            }
        }
        return {
            nodes: currentNodes,
            links: currentLinks
        }
    }

    //考虑数据的同步 变化年份区间，仍然保持高亮作者？社区
    const visualArgs = useRef({ author: "", com: "" })


    const hilightAuthor = (name) => {//
        console.log("hilightAuthor", name, visualArgs.current.author)
        if (visualArgs.current.author !== name) {
            visualArgs.current.author = name
            handleArgsChange("author")
        }
    }
    const hilightCom = (com) => {
        if (visualArgs.current.com !== com) {
            visualArgs.current.com = com
            handleArgsChange("com")
        }
    }
    const disHilightAuthor = () => {
        hilightAuthor("")
    }
    const disHilightCom = () => {
        hilightCom("")
    }

    const dishilightAll = () => {
        if (visualArgs.current.author !== "" || visualArgs.current.com !== "") {
            visualArgs.current.author = ""
            visualArgs.current.com = ""
            handleArgsChange("none")
        }

    }


    const handleArgsChange = (type) => {

        if (type === "year") {//如果是年 则修改原始数据
            usingGraphData.current = crerateGraph(props.sankdata, valueRef.current[0], valueRef.current[1])
        }
        if (visualArgs.current.author === "" && visualArgs.current.com === "") {//如果两个参数都为空 即没有筛选
            initOption(usingGraphData.current, "normal")
        } else if (visualArgs.current.author !== "" && visualArgs.current.com === "") {//高亮作者
            initOption(getAuthorHilightGraph(visualArgs.current.author), "hide")//
        } else if (visualArgs.current.author === "" && visualArgs.current.com !== "") {//高亮领域
            initOption(getComHilightGraph(visualArgs.current.com), "hide")
        } else {//两个都高亮
            const tmp = JSON.parse(JSON.stringify(usingGraphData.current))
            usingGraphData.current = getAuthorHilightGraph(visualArgs.current.author)
            initOption(getComHilightGraph(visualArgs.current.com), "hide")
            usingGraphData.current = tmp
        }//无论如何   时刻保持year原始筛选数据
    }



    const [smallViewSankData, setsmallViewSankData] = useState([])
    const [smallViewYear, setsmallViewYear] = useState(2020)
    const initPaperData = () => {
        if (props.sankdata.length === 0) {
            console.log("empty")
        } else {
            usingGraphData.current = crerateGraph(props.sankdata, valueRef.current[0], valueRef.current[1])
            setsmallViewSankData(props.sankdata)
            initOption(usingGraphData.current, "init")

        }
    }


    useEffect(initChart, [])
    useEffect(initPaperData, [props.sankdata])





    const smallChart = useRef(null)



    const chartLinksLast = useRef(0)
    const drawPie = (chartLinks) => {
        return "pass"
        console.log(chartLinks.length)
        if (chartLinks.length === chartLinksLast.current) {
            return 0
        }
        chartLinksLast.current = chartLinks.length
        const sourcevalue = {}
        const targetvalue = {}
        for (let link of chartLinks) {
            sourcevalue[link.source] = sourcevalue[link.source] + link.value || link.value
            targetvalue[link.target] = targetvalue[link.target] + link.value || link.value
        }
        const node_value = {}
        for (let link of chartLinks) {
            node_value[link.source] = Math.max(sourcevalue[link.source] || 0, targetvalue[link.source] || 0)
            node_value[link.target] = Math.max(sourcevalue[link.target] || 0, targetvalue[link.target] || 0)
        }
        const themeSet = new Set()

        const pie_year_map = {}//领域统计
        Object.keys(node_value).forEach(theme_year => {
            const year = Number(theme_year.substring(theme_year.length - 4))
            const theme = theme_year.substring(0, theme_year.length - 5)
            const value = node_value[theme_year]
            themeSet.add(theme)
            if (pie_year_map[year] === undefined) {
                pie_year_map[year] = {}
            }
            pie_year_map[year][theme] = value
        })

        const totalSerisNum = Object.keys(pie_year_map).length
        const pieSeries = []

        Object.keys(pie_year_map).forEach((year, index) => {
            const data = []
            Object.keys(pie_year_map[year]).forEach(theme => {
                data.push(
                    {
                        name: theme,
                        value: pie_year_map[year][theme],
                    }
                )
            })

            pieSeries.push({
                name: year + "",
                type: 'pie',
                selectedMode: 'single',
                radius: [Math.floor(80 * index / totalSerisNum) + "%", Math.floor(80 * (index + 1) / totalSerisNum) + "%"],
                label: {
                    position: 'inner',
                    fontSize: 14,
                    show: false
                },
                labelLine: {
                    show: false
                },
                data: data,
                itemStyle: {
                    normal: {
                        opacity: 0.9
                    },
                    emphasis: {
                        opacity: 1,
                        borderColor: "#000000",
                        borderWidth: 1,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                        shadowBlur: 10
                    }
                }
            })
        })

        const chartDom = echarts.init(document.getElementById("snaksmallpieview"), "default")
        chartDom.clear()
        chartDom.setOption(
            {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                label: {
                    show: false
                },
                legend: {
                    type: "scroll",
                    data: Array.from(themeSet)
                },
                series: pieSeries
            }
        )
        chartDom.on("mouseover", (args) => {
            hilightCom(args.data.name)
            // console.log(args.data.name)
        })
        chartDom.on("mouseout", (args) => {
            disHilightCom()
        })
        // chartDom.on('legendselected', function (params) {
        //     chartDom.setOption({
        //         legend: { selected: { [params.name]: false } }
        //     })
        //     console.log('点击了', params.name);
        //     // do something
        // })
        // chartDom.on('legendunselected', function (params) {
        //     chartDom.setOption({
        //         legend: { selected: { [params.name]: true } }
        //     })
        //     console.log('点击了', params.name);
        //     // do something
        // })

        chartDom.on('highlight', function (params) {
            // console.log('highlight', params.name);
            hilightCom(params.name)
        })
        chartDom.on('downplay', function (params) {
            disHilightCom()
        })


    }




    const handleSideerChange_1 = (event, newValue) => {
        setsiderValue_1(newValue);
    };
    const [siderValue_1, setsiderValue_1] = useState(10)


    const ref_checkStause = useRef({
        fromOther: false,
        toOther: false,
        fromOtherLable: false,
        toOtherLable: false
    })
    const [checkStause, changCheckStause] = useState({
        fromOther: false,
        toOther: false,
        fromOtherLable: false,
        toOtherLable: false
    })
    const handelCheckChnage = (args) => {
        if (args === undefined) {
            return
        }

        const tmp = { ...checkStause }
        tmp[args] = !tmp[args]

        if (args === "toOther") {
            if (tmp["toOther"] === true) {//同步开启关闭 
                tmp["toOtherLable"] = true
            } else {
                tmp["toOtherLable"] = false
            }
        }
        if (args === "fromOther") {
            if (tmp["fromOther"] === true) {//同步开启关闭 
                tmp["fromOtherLable"] = true
            } else {
                tmp["fromOtherLable"] = false
            }

        }
        changCheckStause(tmp)
        ref_checkStause.current = tmp
    }

    // const [anchorEl,setanchorEl] = useState(null)
    // const [authorMenuOpen,setauthorMenuOpen] = useState(true)
    // const handleauthorMenuClose = () =>{

    // }

    const [searchValue, setsearchValue] = useState("")
    const ref_searchValue = useRef("")
    const changeSearchValue = (event) => {
        ref_searchValue.current = event.target.value
        setsearchValue(event.target.value)
        // console.log(ref_searchValue.current)
    }




    const doSearch = () => {
        console.log(ref_searchValue.current)
        hilightAuthor(ref_searchValue.current)
    }

    return (


        <div style={{ display: "inline" }} >
            <div style={{ display: "inline" }} >
                <div style={{
                    width: 1050,
                    height: 850,
                    float: "left",
                    overflow: "hidden"
                }}>
                    <div id={UID.current} style={{
                        width: 1100,
                        height: 850,
                    }} />
                </div>
            </div>

            <Paper style={
                {
                    width: 550,
                    height: 840,
                    float: "right"
                }
            } elevation={3} >

                <FieldDistribution
                    sankData={smallViewSankData}
                    year={smallViewYear}
                    colorMap={theme_color_map}
                    hilightAuthor={hilightAuthor}
                    style={
                        {
                            width: 550,
                            height: 550
                        }
                    }
                />
                <Grid
                    container
                    spacing={3}
                // direction="column"
                // justify="center"
                // alignItems="flex-start"
                >

                    <Grid item xs={12} spacing={3}>
                        <div style={{
                            marginLeft: 50
                        }}>
                            <AccountCircleIcon
                                color="secondary"
                            />
                            <TextField
                                style={{ marginTop: -20, marginLeft: 10 }}
                                color="secondary"
                                label="查询作者"
                                value={searchValue}
                                onChange={changeSearchValue}
                                onKeyDown={(e) => {
                                    if (e.keyCode === 13) {
                                        doSearch()
                                    }
                                }}
                            />
                            <Button
                                style={{ marginLeft: 10, marginTop: -20, width: 80 }}
                                variant="outlined"
                                color="primary"
                                onClick={doSearch}
                            >
                                搜索
                            </Button>

                            <Button
                                style={{ marginLeft: 10, marginTop: -20, width: 80 }}
                                variant="outlined"
                                color="secondary"
                                onClick={() => {
                                    changeSearchValue({
                                        target: {
                                            value: ""
                                        }
                                    })
                                    disHilightAuthor()
                                }}
                            >
                                清空
                            </Button>


                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        <div style={{ width: 450, marginLeft: 50, display: "inline-flex" }}>
                            <Chip
                                icon={<ArrowBackIcon />}
                                style={{ width: 100 }}
                                label={checkStause["fromOther"] ? "show" : "hide"}
                                color={checkStause["fromOther"] ? "primary" : "secondary"}
                                variant="outlined"
                            />
                            <div style={{ marginLeft: 3 }} >
                                <Switch
                                    checked={checkStause["fromOther"]}
                                    onChange={() => { handelCheckChnage("fromOther") }}
                                    name="checkedA"
                                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                                />
                                <FormControlLabel
                                    control={<Switch
                                        checked={checkStause["fromOtherLable"]}
                                        onChange={() => { handelCheckChnage("fromOtherLable") }}
                                        name="checkedA"
                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                        label="标签显示"
                                    />}
                                    label="标签显示"
                                />
                            </div>
                        </div>
                    </Grid>


                    <Grid item xs={12}>
                        <div style={{ width: 450, marginLeft: 50, display: "inline-flex" }}>
                            <Chip
                                icon={<ArrowForwardIcon />}
                                style={{ width: 100 }}
                                label={checkStause["toOther"] ? "show" : "hide"}
                                color={checkStause["toOther"] ? "primary" : "secondary"}
                                variant="outlined"
                            />
                            <div style={{ marginLeft: 3 }} >
                                <Switch
                                    checked={checkStause["toOther"]}
                                    onChange={() => { handelCheckChnage("toOther") }}
                                    name="checkedA"
                                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                                />
                                <FormControlLabel
                                    control={<Switch
                                        checked={checkStause["toOtherLable"]}
                                        onChange={() => { handelCheckChnage("toOtherLable") }}
                                        name="checkedA"
                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                    />}
                                    label="标签显示"
                                />
                            </div>
                        </div>
                    </Grid>

                    <Grid item xs={12} spacing={3}>
                        <div style={{
                            marginLeft: 50,
                            marginTop: 15
                        }}>
                            <Chip
                                // icon={<WifiTetheringIcon />}
                                style={{ marginTop: -21 }}
                                label={"起始年份" + value[0]}
                                color={"primary"}
                                variant="outlined"
                            />
                            <Chip
                                // icon={<WifiTetheringIcon />}
                                style={{ marginTop: -21, marginLeft: 20 }}
                                label={"结束年份" + value[1]}
                                color={"primary"}
                                variant="outlined"
                            />
                        </div>
                    </Grid>


                    <Grid item xs={12} spacing={3}>
                        <PrettoSlider style={{ width: 450, marginLeft: 50, marginTop: -3, color: "#FF5722" }} min={1990} max={2020} value={value} onChange={handleChange} />
                    </Grid>



                </Grid>
            </Paper>
            {/* <div style={{ width: 300, height: 300 ,float:"left"}} id="snaksmallpieview" /> */}
        </div >

    )
}

