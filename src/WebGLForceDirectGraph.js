import React, { useState,useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use } from 'echarts';


export default function WebGLForceDirectGraph(props){
    const UID = useRef(uuid.v1())
    
    const initOption = ( data ) => {
            var chartDom = document.getElementById(UID.current);
            var myChart = echarts.init(chartDom,"default");
            myChart.clear()
            var nodes = data.nodes.map(function (nodeName, idx) {
                return {
                    name: props.queryDataMap(nodeName),
                    value: data.dependentsCount[idx]
                    // value:1 //力的值 
                }
            });
            var edges = [];
            for (var i = 0; i < data.edges.length;) {
                var s = data.edges[i++];
                var t = data.edges[i++];
                edges.push({
                    source: s,
                    target: t
                });
            }

            nodes.forEach(function (node) {
                node.emphasis = {
                    label: {
                        show: true
                    }
                }
                node.label = {
                        show: false
                    }
            });

            const option = {
                backgroundColor: '#000000',
                series: [{
                    color : "#F57C00",
                    type: 'graphGL',
                    nodes: nodes,
                    edges: edges,
                    modularity: {
                        resolution: 1,
                        sort: true
                    },
                    lineStyle: {
                        color: '#FFFFFF',
                        opacity:0.5
                    },
                    itemStyle: {
                        opacity: 1,
                        color: (params) => {
                            // if (params.data.value > 1 ){
                            //     return "#FF0000"
                            // }
                            if( params.data.name.indexOf("10.") > -1 ){
                                return "#FF0000"
                            }
                            return "#00FF00"
                        },
                    },
                    focusNodeAdjacency: true,
                    focusNodeAdjacencyOn: 'click',
                    symbolSize: function (value) {
                                   
                        return 3
                    },
                    label: {
                        color: '#fff'
                    },
                    emphasis: {
                        label: {
                            show: true
                        },
                        lineStyle: {
                            opacity: 0.5,
                            width: 4
                        }
                    },
                    forceAtlas2: {
                        steps: 1,
                        stopThreshold: 20,
                        jitterTolerence: 10,
                        edgeWeight: [0.2, 1],
                        gravity: 20,
                        edgeWeightInfluence: 1
                    }
                }]
            }
             myChart.setOption(option);
        }
    
    const handelDataChange =  () =>{
        if(props.graphData === null){
            console.log("empty")
        }else{
            initOption(props.graphData)
        }   
    }


    
    useEffect(handelDataChange)
    return (
    <div id={UID.current} style={props.style}>
    </div>
    )

}// 这个东西  虽然可以渲染大图 但是几乎不支持任何交互 所以只能用作总体预览了
//主要窗口改为聚类图吧

