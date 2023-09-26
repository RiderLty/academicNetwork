import * as echarts from 'echarts';
import ecStat from 'echarts-stat';
import React, { useState,useEffect, useRef, useLayoutEffect } from 'react';
import uuid from "uuid"

export default  function ClusteringGraph(props)  {
    const UID = useRef(uuid.v1())

    const handelDataChange =  () =>{
        if(props.graphData === null){
            console.log("empty")
        }else{
            loadGraph(props.graphData)
        }   
    }


    const loadGraph = (graphData) =>{
        var chartDom = document.getElementById(UID.current);
        var myChart = echarts.init(chartDom,"default");
        myChart.clear()
        
        echarts.registerTransform(ecStat.transform.clustering);
        var CLUSTER_COUNT = 6;
        var DIENSIION_CLUSTER_INDEX = 3;
        var COLOR_ALL = [
            '#37A2DA', '#e06343', '#37a354', '#b55dba', '#b5bd48', '#8378EA', '#96BFFF'
        ];
        var pieces = [];
        for (var i = 0; i < CLUSTER_COUNT; i++) {
            pieces.push({
                value: i,
                label: '' + i,
                color: COLOR_ALL[i]
            });
        }
        var option = {
            dataset: [{
                source: graphData
            }, {
                transform: {
                    type: 'ecStat:clustering',
                    // print: true,
                    config: {
                        clusterCount: CLUSTER_COUNT,
                        outputType: 'single',
                        outputClusterIndexDimension: DIENSIION_CLUSTER_INDEX,
                        dimensions: [0, 1],
                        
                    }
                }
            }],
            tooltip: {
                position: 'top'
            },
            visualMap: {
                type: 'piecewise',
                top: 'middle',
                min: 0,
                max: CLUSTER_COUNT,
                left: 10,
                splitNumber: CLUSTER_COUNT,
                dimension: DIENSIION_CLUSTER_INDEX,
                pieces: pieces
            },
            grid: {
                left: 120
            },
            xAxis: {
            },
            yAxis: {
            },
            series: {
                type: 'scatter',
                encode: { 
                    tooltip: 2,
                    x:0,
                    y:1
                },
                symbolSize: 15,
                itemStyle: {
                    borderColor: '#555'
                },
                datasetIndex: 1
            }
        };
        myChart.setOption(option);
        myChart.off("click")
        myChart.on("click" ,props.clickHnadeler)
    }
    useEffect( handelDataChange )
    return (
    <div id={UID.current} style={props.style}>
    </div>
    )
}
