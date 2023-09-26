import React, { useState,useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use } from 'echarts';

//引用关系 力导向图
export default function QuoteForce(props){
    const UID = useRef(uuid.v1())
    
    const initOption = ( data ) => {
            var chartDom = document.getElementById(UID.current);
            var myChart = echarts.init(chartDom,"default");
            myChart.clear()
            var option = {

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

