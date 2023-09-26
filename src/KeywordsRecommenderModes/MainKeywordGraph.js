import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from '../reportWebVitals';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use } from 'echarts';
import Slider from '@material-ui/core/Slider';
import PubSub from 'pubsub-js'
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
import { echartTheme } from "../echartTheme"


export default function MainKeywordGraph(props) {
    const UID = useRef(uuid.v1())

    const visualConfig = {
        sizeRange: 80,
        minSize: 20,
        category: 10
    }

    const crerateGraph = (paperList) => {
        const kwCount = {}
        paperList.forEach(paper => {
            paper.AuthorKeywords.split(",").forEach(
                rawKw => {
                    const kw = rawKw.replace(/(^\s*)|(\s*$)/g, "").toLowerCase()
                    kwCount[kw] = kwCount[kw] === undefined ? 1 : kwCount[kw] + 1
                }
            )
        })

        let miniCount = 2

        let result = Object.keys(kwCount).map(kw => {
            return {
                kw: kw,
                count: kwCount[kw]
            }
        }).filter(obj => obj.count > miniCount && obj.kw !== "")


        while (result.length > 100) {
            miniCount += 1
            console.log("minicounr", miniCount, "result.length", result.length)

            result = Object.keys(kwCount).map(kw => {
                return {
                    kw: kw,
                    count: kwCount[kw]
                }
            }).filter(obj => obj.count > miniCount && obj.kw !== "")
        }
        return result

    }

    const drawpie = (data) => {
        const small_1 = echarts.init(document.getElementById("kwsmallview_1"), "default");
        small_1.setOption(
            {
                title: {

                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{b}</br>{c}</br> {d}%",
                },
                legend: {
                    show: false
                },
                series: [
                    {
                        name: '',
                        type: 'pie',
                        radius: '50%',
                        formatter: "{d}",
                        data: data,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            }
        )
    }

    const drawBar = (x, y) => {
        const small_1 = echarts.init(document.getElementById("kwsmallview_2"), "default");
        small_1.setOption(
            {

                tooltip: {
                    trigger: 'axis',
                    formatter: "{b}</br>{c}</br>",
                    axisPointer: {
                        type: 'shadow'
                    }
                },

                legend: {
                    data: ['']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    boundaryGap: [0, 0.01]
                },
                yAxis: {
                    type: 'category',
                    data: x
                },
                series: [
                    {
                        name: '',
                        type: 'bar',
                        data: y.sort((a, b) => a.value - b.value)
                    },
                ]
            }
        )
    }




    const initOption = (data) => {
        var chartDom = document.getElementById(UID.current);
        var myChart = echarts.init(chartDom, "default");
        const nodes = []

        const max = Math.max(...data.map(obj => obj.count))
        const min = Math.min(...data.map(obj => obj.count))
        const subval = max - min

        const categories = []
        for (let i = 0; i < visualConfig.category; i++) {
            categories.push({
                name: ""
            })
        }

        const pieNodes = []
        const bar_x = []
        const bar_y = []


        data.forEach(obj => {
            const category_num = Math.floor(((obj.count - min) / subval) * visualConfig.category) + 1
            pieNodes.push(
                {
                    name: obj.kw,
                    value: obj.count,
                    label: {
                        show: ((obj.count - min) / subval) > 0.1
                    },
                    itemStyle: {
                        color: echartTheme.color[category_num % echartTheme.color.length]
                    }
                }
            )

            bar_x.push(obj.kw)
            bar_y.push({
                name: obj.kw,
                value: obj.count,
                itemStyle: {
                    color: echartTheme.color[category_num % echartTheme.color.length]
                }
            })
            nodes.push(
                {
                    name: obj.kw,
                    value: obj.count,
                    symbolSize: ((obj.count - min) / subval) * visualConfig.sizeRange + visualConfig.minSize,
                    label: {
                        show: ((obj.count - min) / subval) > 0.1,
                        fontSize: Math.floor(6 * ((obj.count - min) / subval)) + 10,
                        color: "#000000"
                    },
                    itemStyle: {
                        color: echartTheme.color[category_num % echartTheme.color.length]
                    }
                }
            )
        })





        const option = {
            title: {
                text: '关键词分布'
            },
            tooltip: {
                        trigger: 'item',
                        formatter: "{b}</br>{c}",
                    },
            series: [

                {
                    

                    type: 'graph',
                    layout: 'force',
                    roam: true,
                    data: nodes,
                    force: {
                        gravity: 0.4,
                        repulsion: 600,
                        layoutAnimation: false,
                    },
                    edges: [],
                    categories: categories,

                }
            ]
        };
        myChart.setOption(option);
        myChart.on("click", args => {
            props.doSearch(args.data.name)
        })
        drawpie(pieNodes)
        drawBar(bar_x, bar_y)
    }

    const handelGrapgChange = () => {
        if (props.paperData === null) {
            console.log("empty")
        } else {
            initOption(crerateGraph(props.paperData))

        }
    }

    const initPaperData = () => {
        handelGrapgChange()
    }

    useEffect(initPaperData, [props.paperData])

    return (
        <div style={{ display: "inline" }}>
            <div id={UID.current} style={{
                width: 1000,
                height: 840,
                float: "left"
            }}>
            </div>
            <div style={
                {
                    width: 420,
                    height: 840,
                    float: "right",
                    marginRight: 100
                }
            } elevation={3} >
                <div style={{ width: 420, height: 420 }} id="kwsmallview_1" ></div>
                <div style={{ width: 420, height: 420 }} id="kwsmallview_2" ></div>
            </div>
        </div >
    )
}

