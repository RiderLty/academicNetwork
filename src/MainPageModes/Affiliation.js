import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from '../reportWebVitals';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use } from 'echarts';
import Slider from '@material-ui/core/Slider';
import PubSub from 'pubsub-js'
// import echartTheme from "../echartTheme"
export default function Affiliation(props) {
    const UID = useRef(uuid.v1())

    const visualConfig = {
        maxSymbolSize: 10,
        maxEdgeWidth: 10,
        seriesNum: 8
    }

    const [numberRange, setNumberRange] = useState([0, 65536])
    const numberRangeRef = useRef([0, 65536])
    const crerateGraph = (paperList) => {
        const AffilS = {}
        paperList.forEach(paper => {
            paper.AuthorAffiliation.split(";").forEach(
                Affil => {
                    AffilS[Affil] = AffilS[Affil] === undefined ? 1 : AffilS[Affil] + 1
                }
            )
        })
        const axis = []
        const value = []
        let otherCount = 0

        let min = 65536
        let max = 0

        Object.keys(AffilS).forEach(key => {
            if (key !== "") {
                min = Math.min(AffilS[key], min)
                max = Math.max(AffilS[key], max)
                if (AffilS[key] > filterValue) {
                    axis.push(key)
                    value.push({
                        value: AffilS[key],
                        name: key
                    })
                } else {
                    otherCount += AffilS[key]
                }
            }
        })
        setNumberRange([min, max])
        numberRangeRef.current = [min, max]
        return {
            axis: axis,
            value: value
        }
    }

    const initOption = (data) => {
        var chartDom = document.getElementById(UID.current);
        // echarts.registerTheme()
        var myChart = echarts.init(chartDom, "default");
        myChart.clear()
        const option = {
            title: {
                text: '所属机构',
                left: 'left'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                data: [],
                orient: 'vertical',
                left: 'left',
                selected: {
                    "other": false
                }
            },

            series: [
                {
                    name: 'AuthorAffiliation',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    data: data.value,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        formatter: '{b}: {d}'
                    },
                }
            ]
        };
        myChart.setOption(option);
        myChart.on("click", args => { console.log(args) })

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
        setfilterValue(Math.floor((numberRange[1] + numberRange[0]) / 2))
    }

    const [filterValue, setfilterValue] = React.useState(10);

    const handleChange = (event, newValue) => {
        setfilterValue(newValue);
    };

    useEffect(initPaperData, [props.paperData])

    useEffect(handelGrapgChange, [filterValue])

    


    useEffect(() => {
        setfilterValue(Math.floor((numberRangeRef.current[1] + numberRangeRef.current[0]) / 2))
    }, [props.paperData])

    return (
        <div style={props.style}>
            <div id={UID.current} style={props.style}>
            </div>
            <Slider
                value={filterValue}
                onChange={handleChange}
                aria-labelledby="continuous-slider"
                valueLabelDisplay="auto"
                min={numberRange[0]}
                max={numberRange[1]}
            />
        </div>
    )
}

