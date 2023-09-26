import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use } from 'echarts';
import Slider from '@material-ui/core/Slider';
import PubSub from 'pubsub-js'
import { echartTheme } from "../echartTheme"

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

import ContourGrapg from "./ContourGrapg"


import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Select from '@material-ui/core/Select';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';



import SankYearTable from "./SankYearTable"

import * as data1 from "./datas/paper.json"
import * as data2 from "./datas/author.json"
import * as data3 from "./datas/mail.json"

import { LinearProgress } from '@material-ui/core';

import ColorMap from "./ColorMap"


const [style_hilight, style_normal, style_hidden, style_label] = [0, 1, 2, 3]//样式状态


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
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
            height: 26
        },
    }
));

function valuetext(value) {
    return `${value}`;
}


const queryData = () => {

}



export default function Sankver2(props) {
    const UID = useRef(uuid.v1())
    const rawData = useRef({//原始数据
        links: [],
        nodes: [],
        entry: []
    })
    const year_filtered = useRef({//年份筛选后的数据
        links: [],
        nodes: [],
        entry: []
    })
    const view_data = useRef({//视图驱动使用的数据  没有操作时与年份筛选数据相同
        links: [],
        nodes: [],
        entry: []
    })

    const [smallViewData, setsmallViewData] = useState([])//小型视图的数据

    const cal_year = (start, end) => {//筛选年份  从原始数据 到年份筛选后数据 
        year_filtered.current = {
            nodes: rawData.current.nodes.filter(node => {
                const year = Number(node["attributes"]["year"])
                return year >= start && year <= end
            }).map(node => {
                return {
                    ...node,
                    depth: node.depth - (start - 1990),
                }
            }),
            links: rawData.current.links.filter(link => {
                const source_year = Number(link["attributes"]["source_year"])
                const target_year = Number(link["attributes"]["target_year"])
                return source_year >= start && source_year <= end && target_year >= start && target_year <= end
            }),
            entry: rawData.current.entry
        }
        // console.log("year_filtered.current ", year_filtered.current)
    }
    const verifySubset = (_set, _subset) => {//只验证单层，如果_subset是_set 的子集则true否则false
        for (let key of Object.keys(_subset)) {
            if ((_set[key] === undefined) || (_set[key] !== _subset[key])) {
                return false
            }
        }
        return true//
    }
    const styleRef = useRef({//控制样式的集合
        node: [{}],
        showlabel: [],
        hilightLink: [],
        normalLink: [{}]
    })
    const styleManager = (type, args) => {//统一管理样式的接口
        //对于节点 显示标签 > 显示  > 隐藏
        //设置 node:[{}] 来匹配所有节点 以显示全部
        //对于边 则
        //显示，隐藏，换色高亮 

        if (type === "node") {
            styleRef.current = {
                ...styleRef.current,
                node: [...styleRef.current.node, ...args]
            }
        } else if (type === "node_label") {
            styleRef.current = {
                ...styleRef.current,
                showlabel: [...styleRef.current.showlabel, ...args]
            }
        }
        else if (type === "link") {
            styleRef.current = {
                ...styleRef.current,
                normalLink: [...styleRef.current.normalLink, ...args]
            }
        } else if (type === "link_hl") {
            styleRef.current = {
                ...styleRef.current,
                hilightLink: [...styleRef.current.hilightLink, ...args]
            }
        } else if (type === "clear") {
            styleRef.current = {
                node: [{}],
                showlabel: [],
                hilightLink: [],
                normalLink: [{}]
            }
        } else if (type === "empty") {
            styleRef.current = {
                node: [],
                showlabel: [],
                hilightLink: [],
                normalLink: []
            }
        }
    }
    const getNodeType = (attributes) => {//获取节点状态
        for (let node_lb of styleRef.current.showlabel) {
            if (verifySubset(attributes, node_lb)) {
                return style_label
            }
        }
        for (let node_hl of styleRef.current.node) {
            if (verifySubset(attributes, node_hl)) {
                return style_normal
            }
        }
        return style_hidden
    }
    const getLinkType = (attributes) => {//获取边状态
        for (let link_hl of styleRef.current.hilightLink) {
            if (verifySubset(attributes, link_hl)) {
                return style_hilight
            }
        }
        for (let link_normal of styleRef.current.normalLink) {
            if (verifySubset(attributes, link_normal)) {
                return style_normal
            }
        }
        return style_hidden
    }
    const cal_view = () => {//计算视图 从年份数据 以及当前样式控制器 显示视图
        const nodes = []
        const links = []
        const connectedNodes = new Set()//如果高亮一条线  或者普通显示一条线 则其相关节点必定高亮
        let allNormalFlag = true //如果全为普通 则为[{}] 减少运算
        year_filtered.current.links.map(link => {
            const type = getLinkType(link["attributes"])
            if (type === style_hilight || type === style_normal) {
                connectedNodes.add(link.source)
                connectedNodes.add(link.target)
            } else {
                allNormalFlag = false
            }
            let colorAttr = "gradient"
            if (type === style_hilight) {
                colorAttr = "#d90051"
            }
            let opacity = 0.1

            if (type === style_hilight) {
                opacity = 0.9
            } else if (type === style_normal) {
                opacity = 0.6
            }
            links.push(
                {
                    ...link,
                    lineStyle: {
                        opacity: opacity,
                        color: colorAttr
                    }
                }
            )
        })
        if (allNormalFlag) {
            connectedNodes.clear()
        }


        styleManager("node_label", Array.from(connectedNodes).map(theme_year => (
            {
                theme: theme_year.substring(0, theme_year.length - 5),
                year: theme_year.substring(theme_year.length - 4)
            }
        )))
        // console.log("styleRef",JSON.stringify(styleRef.current,null,4))
        year_filtered.current.nodes.map(node => {
            const type = getNodeType(node["attributes"])
            nodes.push(
                {
                    ...node,
                    itemStyle: {
                        opacity: (type === style_normal || type === style_label) ? 1 : 0.1,
                        color: ColorMap(node["attributes"]["theme"])
                    },
                    label: {
                        show: type === style_label
                    }
                }
            )

        })
        // console.log("cal_view", JSON.stringify(styleRef.current, null, 4))
        view_data.current = {
            nodes: nodes,
            links: links,
            entry: view_data.current.entry
        }
    }

    const initViewData = () => {
        switchToData_2()
    }

    //切换数据集
    const switchToData_1 = () => {
        setsmallViewData(data1.default.entry)

        setyearValue([2013, 2018])
        yearValueRef.current = [2013, 2018]
        setsmallChartYear(2015)

        rawData.current = data1.default
        cal_year(yearValueRef.current[0], yearValueRef.current[1])
        cal_view()
        updateData()
    }
    const switchToData_2 = () => {
        setsmallViewData(data2.default.entry)

        setyearValue([2015, 2020])
        yearValueRef.current = [2015, 2020]
        setsmallChartYear(2016)


        rawData.current = data2.default
        cal_year(yearValueRef.current[0], yearValueRef.current[1])
        cal_view()
        updateData()
    }
    const switchToData_3 = () => {
        setsmallViewData(data3.default.entry)

        setyearValue([1990, 2000])
        yearValueRef.current = [1990, 2000]
        setsmallChartYear(1996)


        rawData.current = data3.default
        cal_year(yearValueRef.current[0], yearValueRef.current[1])
        cal_view()
        updateData()

    }
    const myChart = useRef(null)
    const initChart = () => {
        myChart.current = echarts.init(document.getElementById(UID.current), "default")
        myChart.current.setOption({
            title: {
                text: 'Sankey view'
            },
            tooltip: {
                trigger: 'item',
                triggerOn: 'mousemove'
            },
            series: [
                {
                    layoutIterations: 32,
                    label: {
                        show: false,
                    },
                    type: 'sankey',
                    data: [],
                    links: [],
                    emphasis: {
                        focus: 'adjacency'
                    },
                    lineStyle: {
                        color: 'gradient',
                        curveness: 0.5
                    }
                }
            ]
        });
        myChart.current.off("mouseover")
        myChart.current.off("mouseout")
        myChart.current.off("click")
        myChart.current.on("mouseover", args => {//悬浮事件
            changeHl(args)
        })
        myChart.current.on("click", args => {
            if (args.dataType === "node") {
                setsmallChartYear(Number(args.data.attributes.year))
            }
        })
        myChart.current.on("mouseout", args => {
            styleManager("clear")
            cal_view()
            updateData()
        })
    }
    const changeHl = (args) => {//响应悬浮高亮
        styleManager("empty")
        if (datasetRef.current === "论文") {
            if (args.dataType === "node") {
                //论文数据集  悬浮于节点之上
                //显示 source === target === 节点theme 的边以及 name === theme 的节点
                styleManager("link", [{ target_theme: args.data.attributes.theme, source_theme: args.data.attributes.theme }])//
            } else {
                //悬浮于边 
                //高亮引用了这篇论文的所有表示边   
                //line = A -> B
                //show = [ A -> B ，A -> C，A -> D]
                styleManager("link", [args.data.hover.link])
            }
        } else if (datasetRef.current === "学者") {
            if (args.dataType === "node") {
                //悬浮节点 高亮领域领域
                styleManager("link", [args.data.hover.link])
            } else {
                //悬浮边 高亮相同主题
                styleManager("link", [args.data.hover.link])
            }
        } else if (datasetRef.current === "邮件") {
            if (args.dataType === "node") {
                // console.log("args.data.attributes.theme",args.data.attributes.theme)
                styleManager("link", [{ target_theme: args.data.attributes.theme }, { source_theme: args.data.attributes.theme }])//
            } else {
                styleManager("link", [args.data.hover.link])
            }
        }
        cal_view()
        updateData()
    }
    const updateData = () => {
        myChart.current.setOption({
            series: [
                {
                    data: view_data.current.nodes,
                    links: view_data.current.links,
                }
            ]
        });
    }
    useEffect(initChart, [])
    useEffect(initViewData, [])
    const state = useRef("")
    const hilightline = (args) => {
        //辅助视图的接口
        //这里需要判断用那个数据集
        if (args === "") {
            styleManager("clear")
        } else {
            if (datasetRef.current === "论文") {
                styleManager("empty")
                styleManager("link_hl", [{ from: args }])
            } else if ((datasetRef.current === "学者")) {
                styleManager("empty")
                styleManager("link_hl", [{ author_name: args }])
            } else if ((datasetRef.current === "邮件")) {
                styleManager("empty")
                styleManager("link_hl", [{ person_name: args }])

            }
        }
        cal_view()
        updateData()
    }

    const [smallChartYear, setsmallChartYear] = useState(2016)

    const [yearValue, setyearValue] = useState([2015, 2020])
    const yearValueRef = useRef([2015, 2020])
    const handleYearChange = (event, newValue) => {
        if (newValue !== yearValueRef.current) {
            setyearValue(newValue);
            yearValueRef.current = newValue
            cal_year(yearValueRef.current[0], yearValueRef.current[1])
            cal_view()
            updateData()
        }
    };
    const [searchValue, setsearchValue] = useState("")
    const ref_searchValue = useRef("")
    const changeSearchValue = (event) => {
        ref_searchValue.current = event.target.value
        setsearchValue(event.target.value)
        // console.log(ref_searchValue.current)
    }


    const [smallViewHlname, setsmallViewHlname] = useState("")

    const doSearch = () => {
        if (ref_searchValue.current === "") {
            styleManager("clear")
            setsmallViewHlname("")
            cal_view()
            updateData()
        } else {
            try {
                styleManager("empty")
                if (datasetRef.current === "论文") {
                    setsmallViewHlname(ref_searchValue.current)
                    styleManager("link_hl", [{ from: ref_searchValue.current }])
                } else if ((datasetRef.current === "学者")) {
                    setsmallViewHlname(ref_searchValue.current)
                    styleManager("link_hl", [{ author_name: ref_searchValue.current }])
                } else if ((datasetRef.current === "邮件")) {
                    setsmallViewHlname(ref_searchValue.current)
                    styleManager("link_hl", [{ person_name: ref_searchValue.current }])
                }
                cal_view()
                updateData()
            } catch (err) {
                alert("请输入正确的查询表达")
            }
        }



    }

    const datasetRef = useRef("")
    const [dataSetSelectValue, setdataSetSelectValue] = useState("学者")
    const handelDataSelectChange = (event) => {
        setdataSetSelectValue(event.target.value);
        datasetRef.current = event.target.value
        if (event.target.value === "论文") {
            switchToData_1()
        } else if (event.target.value === "学者") {
            switchToData_2()
        } else if (event.target.value === "邮件") {
            switchToData_3()
        }

    }



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


    return (
        <div style={{ display: "inline" }} >
            <div style={{ display: "inline" }} >
                <div style={{
                    width: 1050,
                    height: 450,
                    float: "left",
                    overflow: "hidden"
                }}>
                    <div id={UID.current} style={{
                        width: 1100,
                        height: 450,
                    }} />

                </div>
            </div>
            <div style={
                {
                    width: 550,
                    height: 840,
                    float: "right"
                }
            } elevation={3} >
                <Grid
                    container
                    spacing={3}
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
                                label="query"
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
                                search
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
                                    doSearch()
                                }}
                            >
                                clear
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
                                        label="lable display"
                                    />}
                                    label="lable display"
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
                                    label="lable display"
                                />
                            </div>
                        </div>
                    </Grid>
                    <Grid item xs={12} spacing={3}>
                        <div style={{
                            marginLeft: 50,
                            marginTop: 0,
                            border:"1px solid rgba(245, 0, 87, 0.8)",
                            borderRadius:"4px",
                            padding:"5px",
                            width:315
                        }}>
                            <FormControl  style={{ width: 300 }}>
                                <InputLabel id="catacontrol-label" color="secondary">dataset control</InputLabel>
                                <Select
                                    labelId="catacontrol-label"
                                    id="catacontrol-label-select-helper"
                                    color="secondary"
                                    value={dataSetSelectValue}
                                    onChange={handelDataSelectChange}
                                >
                                    {
                                        [["学者","Scholar dataset"], ["论文","Citation dataset"], ["邮件","email dataset"]].map(row => (
                                            <MenuItem value={row[0]}>
                                                {row[1]}
                                            </MenuItem>))
                                    }
                                </Select>
                            </FormControl>

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
                                label={"year start" + yearValue[0]}
                                color={"primary"}
                                variant="outlined"
                            />
                            <Chip
                                // icon={<WifiTetheringIcon />}
                                style={{ marginTop: -21, marginLeft: 20 }}
                                label={"year end" + yearValue[1]}
                                color={"primary"}
                                variant="outlined"
                            />
                        </div>
                    </Grid>
                    <Grid item xs={12} spacing={3}>
                        <PrettoSlider style={{ width: 450, marginLeft: 50, marginTop: -3, color: "#FF5722" }} min={1990} max={2020} value={yearValue} onChange={handleYearChange} />
                    </Grid>
                    <Grid item xs={12} spacing={3}>
                        <SankYearTable
                            sankData={smallViewData}
                            year={smallChartYear}
                        />
                    </Grid>
                </Grid>
            </div>
            <div style={{
                width: 1050,
                height: 385,
                float: "left",
                overflow: "hidden",
                display: "flex",
                flexDirection: "row",
            }}
            >
               <div >
                    <FieldDistribution
                    sankData={smallViewData}
                    year={smallChartYear}
                    hilightAuthor={hilightline}
                    hlname={smallViewHlname}
                    style={
                        {
                            width: 500,
                            height: 420
                        }
                    } />
               </div>
                <ContourGrapg

                    year={smallChartYear}
                    dataSetSelectValue={dataSetSelectValue}
                    style={
                        {
                            width: 500,
                            height: 420
                        }
                    }
                />

            </div>
        </div >
    )
}
