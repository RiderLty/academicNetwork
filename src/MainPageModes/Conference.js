import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from '../reportWebVitals';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use } from 'echarts';

export default function Conference(props) {
    const UID = useRef(uuid.v1())

    const crerateGraph = (paperList) => {

        const confs = {}

        paperList.forEach(paper => {
            const conf = paper.Conference
            confs[conf] = confs[conf] === undefined ? 1 : confs[conf] + 1
        })
        const axis = []
        const value = []

        Object.keys(confs).forEach(key => {
            if (confs[key] > 10) {
                axis.push(key)
                value.push({
                    value: confs[key],
                    name: key
                })
            }
        })


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

    const initOption = (data) => {
        var chartDom = document.getElementById(UID.current);
        var myChart = echarts.init(chartDom,"default");
        const option = {
            title: {
                text: '所属期刊',
                left: 'left'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                data: [],
                orient: 'vertical',
                left: 'left',
            },

            series: [
                {
                    name: 'Conference',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    data: data.value,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        myChart.setOption(option);

    }

    const handelDataChange = () => {
        if (props.paperData === null) {
            console.log("empty")
        } else {
            initOption(crerateGraph(props.paperData))
        }
    }
    useEffect(handelDataChange,[props.paperData])
    return (
        <div id={UID.current} style={props.style}>
        </div>
    )

}

