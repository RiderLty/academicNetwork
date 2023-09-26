import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use } from 'echarts';
import PubSub from 'pubsub-js'
import ColorMap from "./ColorMap"
//论文领域分布图


export default function FieldDistribution(props) {
    const UID = useRef(uuid.v1())
    const chart = useRef(null)
    const visualConfig = {
        pieNum: 4,//N段圆环
    }
    const translateData = (yearData) => {
        const themePie = []
        const valuePolar = []
        let angleSUM = 0
        const pieRange = {}
        for (let theme in yearData.theme_author) {

            themePie.push(
                {
                    value: yearData.theme_author[theme].length,
                    name: theme
                }
            )
            pieRange[theme] = {
                start: angleSUM,
                end: angleSUM + yearData.theme_author[theme].length
            }
            angleSUM += yearData.theme_author[theme].length
        }
        let themeCount = 0
        for (let theme in yearData.theme_author) {
            const ConeDistribution = [] //锥形分布数据
            const thetaStart = pieRange[theme].start * 360 / angleSUM
            const thetaEnd = pieRange[theme].end * 360 / angleSUM

            const r_t_map = {}
            yearData.theme_author[theme].forEach(element => {
                ConeDistribution.push(element)
                const theta = (Math.random() * 0.8 + 0.1) * (thetaEnd - thetaStart) + thetaStart
                if (element.count > visualConfig.pieNum) {
                    const r = 1 / visualConfig.pieNum * (Math.random() * 0.8 + 0.1) //随机  0.1~0.9
                    r_t_map[element.name] = [r, theta]
                } else {
                    const r = (visualConfig.pieNum - element.count + (Math.random() * 0.8 + 0.1)) * (1 / visualConfig.pieNum)
                    r_t_map[element.name] = [r, theta]
                }
            })

            const get_r_theta = (author) => {
                // thetaStart
                // thetaEnd
                // ConeDistribution 可以闭包调用
                return r_t_map[author.name]
            }

            yearData.theme_author[theme].forEach(element => {
                const r_theta = get_r_theta(element)
                let nodecolor = ""
                let opacity = 1
                if( props.hlname !== undefined && props.hlname !== ""  ){
                    if(element.name === props.hlname){
                        nodecolor = "#d90051"
                    }else{
                        nodecolor = ColorMap(theme)
                        opacity = 0.1
                    }
                }else{
                    nodecolor = ColorMap(theme)
                }
                valuePolar.push(
                    {
                        r: r_theta[0],
                        theta: r_theta[1],
                        color: nodecolor,
                        name: element.name,
                        count: element.count,
                        opacity:opacity
                    }
                )

            })

            themeCount += 1
        }




        return {
            pie: themePie,
            polar: valuePolar
        }
    }

    const makeSeries = (values) => {
        const interval = Math.floor(60 / visualConfig.pieNum)
        const series = []
        for (let i = 0; i < visualConfig.pieNum; i++) {
            series.push(
                {
                    type: 'pie',
                    radius: [i * interval + "%", (i + 1) * interval + "%"],
                    label: {
                        show: false
                    },
                    data: values,
                    itemStyle: {
                        color: "#ffffff",
                        borderWidth: 1,
                        borderColor: "#6e7079",
                        borderType: "dashed"

                    },
                    emphasis: {
                        scale: false
                    }
                }
            )
        }
        series.push(
            {
                type: 'pie',
                radius: ["60%", "65%"],
                label: {
                    show: true,

                },
                data: values,
                itemStyle: {
                    color: "#CDCDCD",
                    borderRadius: 3,
                    borderWidth: 1,
                    borderColor: "#ffffff",
                },
                emphasis: {
                    scale: false,
                    label: {
                        show: true
                    },
                }
            }
        )
        return series

    }

    const makePolar = (nodes) => { // 半径 角度 悬浮标签 颜色
        const polar = {
            coordinateSystem: 'polar',
            name: 'line',
            type: 'scatter',

            symbolSize: 10,
            data: [

                {
                    value: [1, 360],
                    label: {},
                    symbolSize: 0,
                },
                ...nodes.map(node => (
                    {
                        value: [node["r"], node["theta"]],
                        label: "name:" + node["name"] + "</br>count:" + node["count"],
                        name: node["name"],
                        itemStyle: {
                            color: node["color"],
                            opacity: node["opacity"],
                        },
                    }
                )
                )
            ]
        }
        return polar
    }


    const makeYearData = (sankdata, year) => {
        
        const theme_author = {}
        sankdata.forEach(authorPapers => {
            const author_theme_count = {}
            const author_name = authorPapers[0].name
            authorPapers.forEach(paperInfo => {
                if (Number(paperInfo.year) === year) {
                    author_theme_count[paperInfo.theme] = author_theme_count[paperInfo.theme] + 1 || 1
                }
            })
            
            for (let theme_name in author_theme_count) {
                if (theme_author[theme_name] === undefined) {
                    theme_author[theme_name] = [{ name: author_name, count: author_theme_count[theme_name] }]
                } else {
                    theme_author[theme_name] = [...theme_author[theme_name], { name: author_name, count: author_theme_count[theme_name] }]
                }
            }
        })
        return {
            year: year,
            theme_author: theme_author
        }

    }

    const dataResult = useRef(null)
    const initChart = () => {
        // console.log("colorMap.current",colorMap.current)
        if (props.sankData === undefined || props.sankData.length === 0 || props.year === null) {
            return
        }

        const yearData = makeYearData(props.sankData, props.year)

        dataResult.current = translateData(yearData)

        if (chart.current === null) {
            chart.current = echarts.init(document.getElementById(UID.current), "default");
        } else {
            chart.current.clear()
        }

        const series = makeSeries(dataResult.current.pie)

        series.push(makePolar(dataResult.current.polar))

        // console.log(makePolar(dataResult.polar))

        const option = {
            title: {
                text: props.year
            },
            animation: false,
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    if (params.componentSubType === "scatter") {
                        return params.data.label;
                    }
                    return ""
                }
            },
            polar: {
                radius: "60%"
            },
            angleAxis: {
                show:false,
                type: 'value',
                startAngle: 90
            },
            radiusAxis: {
                show:false,

            },
            series: series
        }
        chart.current.setOption(option)
        chart.current.off("mouseover")
        chart.current.on("mouseover", { componentSubType: "scatter" }, (args) => {//,
            if (args.componentSubType === "scatter") {
                props.hilightAuthor(args.data.name)
            }
        }
        )
        chart.current.off("mouseout")
        chart.current.on("mouseout", { componentSubType: "scatter" }, (args) => {//,
            
            if (args.componentSubType === "scatter") {
                props.hilightAuthor("")
                // console.log("out!!!",args)
            }
        })

    }




    useEffect(initChart, [props.sankData, props.year,props.hlname])
    return (
        <div id={UID.current} style={props.style}>
        </div>
    )
}
