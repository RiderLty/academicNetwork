import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from '../reportWebVitals';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use } from 'echarts';
import PubSub from 'pubsub-js'






export default function PubsCited(props) {
    const UID = useRef(uuid.v1())
    const myChart = useRef(null)
    const crerateGraph = (paperList) => {
        let minYear = 65536
        let maxYear = 0
        const yearCount = {}
        paperList.forEach((paper) => {
            const year = Number(paper.PubsCited)
            yearCount[year] = yearCount.hasOwnProperty(year) ? yearCount[year] + 1 : 1
            minYear = Math.min(minYear, year)
            maxYear = Math.max(maxYear, year)
        })
        const axis = []
        const value = []
        for (let i = minYear; i <= maxYear; i++) {
            axis.push(i)
            value.push(yearCount.hasOwnProperty(i) ? yearCount[i] : 0)
        }
        return {
            axis: axis,
            value: value
        }
    }

    const visualConfig = {
        maxSymbolSize: 10,
        maxEdgeWidth: 10,
        seriesNum: 8
    }

    const reDraw = (data) => {
        var chartDom = document.getElementById(UID.current);
        const option = {       
            xAxis: {
                data: data.axis
            },
            series: [
                {
                    data: data.value
                },

            ],
        };
        myChart.current.setOption(option);
        myChart.current.on("dataZoom", args => {
            const minYear = Number(data.axis[0])
            const maxYear = Number(data.axis[data.axis.length - 1])
            const yearRange = (maxYear - minYear) / 100
            const start = args.batch ? args.batch[0].start : args.start
            const end = args.batch ? args.batch[0].end : args.end 
            PubSub.publishSync('mainPgage_PubsCited_range_selected', {
                start: Math.round(start * yearRange + minYear),
                end: Math.round(end * yearRange + minYear),
            });
        })
    }

    const handelDataChange = () => {
        if (props.paperData === null) {
            console.log("empty")
        } else {
            reDraw(crerateGraph(props.paperData))
        }
    }

    const createEchartDiv = () => {
        var chartDom = document.getElementById(UID.current);
        myChart.current = echarts.init(chartDom,"default");
        const option = {
            title: {
                text: '论文数-被引次数'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: []
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },

            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: []
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: '论文数',
                    type: 'bar',
                    data: [],
                    itemStyle: {
                    normal: {
                        color:"#4CAF50"
                    }   
                }
                },

            ],
            dataZoom: [
                {
                    show: true,
                    realtime: true,
                    start: 0,
                    end: 100,
                    xAxisIndex: [0, 1]
                },
                {
                    type: 'inside',
                    realtime: true,
                    start: 0,
                    end: 100,
                    xAxisIndex: [0, 1]
                }
            ],
        };
        myChart.current.setOption(option);
    }

    useEffect( createEchartDiv,[] )

    useEffect(handelDataChange, [props.paperData])
    return (
        <div id={UID.current} style={props.style}>
        </div>
    )

}

