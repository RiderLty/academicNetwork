import React, { useState,useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use } from 'echarts';
import PubSub from 'pubsub-js'

//用于动态添加节点的图 
const crerateGraph = (paperList) => {//作者之间有过论文合作 即同一篇论文作者s 则存在边
    let autherPapers = {}//作者的paper  autherPapers["jack"] = [156,258,372,...]
    let papers = []//作者 [0,1,2,3,4,5,6,7,8,9,...]
    let paperAuthers = [] //[[论文下标],[],[],[],...]//与作者一一对应
    paperList.forEach((paper,index) => {
        papers.push(papers.length)
        paper["AuthorNames-Deduped"].forEach( (name) => {
            if(autherPapers[name] === undefined){
                autherPapers[name] = [index]
            }else{
                autherPapers[name].push(index)
            }
        } )

    })
    
    let nodes  = Object.keys(autherPapers)
    let edgeSet = new Set()
    let edges = []
    
    paperList.forEach((paper,index) => {
        const autherTmp = []
        paper["AuthorNames-Deduped"].forEach( (name) => {
            autherTmp.push(nodes.indexOf(name))
        })
        paperAuthers.push(autherTmp)
    })
    
    
    nodes.forEach( (currentName,currentIndex) => {
        const a = autherPapers[currentName]
        nodes.forEach( (name,index) => {
            if( currentIndex < index){
                const b = autherPapers[name]
                for( let _a of a){
                    for( let _b of b){
                        if( _a === _b){
                            edgeSet.add(  `${currentIndex}-${index}`  )
                            break
                        }
                    }   
                }
            }
        })    
    })
    edgeSet.forEach( edge => {
        edges.push(edge.split("-"))
    } )
    return {
        authers:nodes,// [name_1,name_2,......]
        autherPapers:autherPapers,//  作者 -> [paper_1_index,paper_2_index,...] 
        papers:papers, //[0,1,2,3,4,5,6,7,8,9, ...]
        paperAuthers:paperAuthers,//[[论文下标],[],[],[],...]//与作者一一对应
        paperMap:paperList//   paperindex -> {title:...,doi:...,...}
    }
}






export default function DynamicDiscovery(props){
    const UID = useRef(uuid.v1())
    
    const visualConfig = {
        symbolSize:40,
        maxSymbolSize:40,
        seriesNum:6
    }

    const usingNode = useRef([])//仅存放ID
    const tmpNode = useRef([])//实时生成图 避免复杂连接关系

    const initOption = ( initNode  ) => {
            const data = graphData.current
            //作者节点 id = index + data.papers.length
            //论文节点 id = index

            usingNode.current = []
            tmpNode.current = []
            
            const createAutherNode = (autherIndex) =>{
                return {
                    "id": autherIndex + data.papers.length,
                    "name":data.authers[autherIndex],
                    "type":"auther",
                    "symbolSize":  visualConfig.symbolSize,
                    // "category": 0
                    "itemStyle": {
                        "color": '#E91E63'
                    }
                }
            }

            const createPaperNode = (paperIndex) =>{
                // console.log("createPaperNode",paperIndex,data.paperMap.length,data.paperMap[paperIndex])
                return {
                    "id": paperIndex,
                    "name":data.paperMap[paperIndex].Title,
                    "type":"paper",
                    "symbolSize":  visualConfig.symbolSize,
                    // "category": 1
                    "itemStyle": {
                        "color": '#40B27D'
                    }
                
                }
            }
            const createEdge = (source,target) => {
                return {
                    source:source+"",
                    target:target+""
                }
            }

            const contains = (id) => {
                return tmpNode.current.indexOf(id) !== -1 || usingNode.current.indexOf(id) !== -1
            }


            const addNode = (id) => {//不判断作者与论文
                tmpNode.current.push(id)
            }

            
            const connectedGraph = ( ...args ) => {
                const nodes = []
                const edges = []
                const existedID = []
 
                
                usingNode.current.forEach( (saveid) => {
                        existedID.push(saveid)
                        
                        // console.log("saveid",saveid,"data.papers.length",data.papers.length)

                        if( saveid >= data.papers.length ){
                            nodes.push( createAutherNode(saveid - data.papers.length) )
                        }else{
                            nodes.push( createPaperNode(saveid))
                        }        
                    }
                )

                tmpNode.current.forEach( (saveid) => {

                        // console.log("saveid",saveid,"data.papers.length",data.papers.length)
                    
                        existedID.push(saveid)
                        if( saveid >= data.papers.length ){
                            nodes.push( createAutherNode(saveid - data.papers.length)  )
                        }else{
                            nodes.push(createPaperNode(saveid))
                        }        
                    }
                )


                const nodeSize = {}
                
                nodes.forEach( (currentNode) => {
                        if( currentNode.type === "paper" ){
                            const currentIndex = Number(currentNode.id)
                            data.paperAuthers[currentIndex].forEach( (autherIndex) => {
                                    const tid = autherIndex + data.papers.length
                                    if( existedID.indexOf(tid) !== -1 ){
                                        edges.push(createEdge(currentIndex,tid))
                                        nodeSize[currentIndex] = nodeSize[currentIndex] === undefined ? 1 :nodeSize[currentIndex]+1
                                        nodeSize[tid] = nodeSize[tid] === undefined ? 1 :nodeSize[tid]+1 
                                    }
                                }
                            )
                        }else{
                            const currentIndex = Number(currentNode.id) - data.papers.length
                            const currentName = data.authers[currentIndex] 
                            data.autherPapers[currentName].forEach(  (paperIndex) => {
                                    if( existedID.indexOf(paperIndex) !== -1 ){
                                        edges.push(createEdge(currentIndex,paperIndex))
                                        nodeSize[currentIndex] = nodeSize[currentIndex] === undefined ? 1 :nodeSize[currentIndex]+1
                                        nodeSize[paperIndex] = nodeSize[paperIndex] === undefined ? 1 :nodeSize[paperIndex]+1 
                                    }
                                }
                            )
                        }    
                    }
                )
                

                let maxSize = -1
                let miniSize = 65536
                Object.keys(nodeSize).forEach( (k) => {
                    maxSize = Math.max( maxSize ,nodeSize[k] )
                    miniSize = Math.min( miniSize ,nodeSize[k] )
                }  )
                
                if(nodes.length === 1){
                    nodes[0].symbolSize = visualConfig.maxSymbolSize / 2
                }else{
                    for(let i = 0 ; i < nodes.length ; i++){
                        nodes[i].symbolSize = Math.ceil(
                                ( 
                                    ( nodeSize[nodes[i].id] - miniSize ) / 
                                    (maxSize - miniSize)
                                )* 
                                (visualConfig.maxSymbolSize / 2) + 
                                visualConfig.maxSymbolSize / 2
                            )
                    }
                }


                if( args.length === 1 ){
                    const selectIndex = Number(args[0]) //选中的节点  高亮与其相关的节点
                    const hlIDs = [selectIndex]//需要高亮的ID
                    edges.forEach( (edge) => {
                        if( Number(edge.source) ===  selectIndex){
                            hlIDs.push(Number(edge.target))
                        }else if(Number(edge.target) ===  selectIndex){
                            hlIDs.push(Number(edge.source))
                        }
                    }
                    )
                    for(let i = 0 ; i < nodes.length ; i++){
                        if(hlIDs.indexOf(nodes[i].id) !== -1 ){
                            nodes[i].label = {
                                show: true
                            }
                        }
                    }
                }

                return {
                    nodes:nodes,
                    links:edges
                }
            }

            const persistenceTmp = () => {
                tmpNode.current.forEach( (sid) => {usingNode.current.push(sid)} )
                tmpNode.current = []
            }


            var chartDom = document.getElementById(UID.current);
            var myChart = echarts.init(chartDom,"default");
            myChart.clear()



            if( initNode !== undefined ){
                if( initNode.type ===  "paper"){
                    addNode(initNode.index)
                    
                }else{
                    addNode(initNode.index + data.papers.length )
                }
                persistenceTmp()
            }

            

            var categories = [
                {name:  "作者"},
                {name:  "论文"}
            ];

            const option = {
                animationDurationUpdate: 1500,
                animationEasingUpdate: 'quinticInOut',
                
                series: [
                    {
                        type: 'graph',
                        layout: 'circular',
                        animation: true,
                        focusNodeAdjacency: true,
                        data: connectedGraph().nodes,
                        force: {
                            repulsion: 100,
                            edgeLength: 5
                        },
                        edges: connectedGraph().links,
                        categories: categories,
                        itemStyle: { 
                            
                            normal: { // 默认样式
                                label: {
                                    show: false,
                                    position: 'top',
                                    formatter: function(params) {
                                        return params.data.name
                                    },
                                    textStyle: {
                                        color: '#333'
                                    }
                                },
                               
                                opacity: 1 // 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。默认0.5

                            },
                            emphasis: { // 高亮状态

                            }
                        },
                        
                        lineStyle: { // ========关系边的公用线条样式。
                            normal: {
                                color: '#000000',
                                width: '1', //线的粗细
                                type: 'solid', // 线的类型 'solid'（实线）'dashed'（虚线）'dotted'（点线）
                                curveness: 0.3, // 线条的曲线程度，从0到1
                            },
                            emphasis: { // 高亮状态

                            }
                        },
                    }
                ],
                
            }

            myChart.setOption(option);
            
            //作者节点 id = index + data.papers.length
            //论文节点 id = index
            const onAuther = (autherNodeIndex) => {
                let flag = false
                const autherIndex = autherNodeIndex - data.papers.length
                const autherName = data.authers[autherIndex]
                const autherPapers = data.autherPapers[autherName]
                autherPapers.forEach(  (paperIndex) => {
                        if( contains(paperIndex) === false ){
                            flag = true
                            addNode(paperIndex)
                        }
                    }
                )
                return flag
            }//会有很多次触发
            const onPaper = (paperIndex) => {
                let flag = false
                const authers = data.paperAuthers[paperIndex]
                authers.forEach( (autherIndex) => {
                    const newNodeIndex = autherIndex + data.papers.length
                    if( contains(newNodeIndex) === false ){
                        flag = true
                        addNode(newNodeIndex)
                    }   
                })
                return flag
            }

            myChart.on( "mouseover", (args) => {
                if(args.dataType === "node"){
                    let flag = false
                    if(args.data.type === "auther") {
                        flag = onAuther(args.data.id)
                    }else{
                        flag = onPaper(args.data.id)
                    }
                    const graphTmpData = connectedGraph(args.data.id)
                        myChart.setOption(
                            {
                                series: [
                                {
                                    data: graphTmpData.nodes,
                                    edges: graphTmpData.links
                                }
                            ]
                        })
                }  
            })

            myChart.on( "mouseout", (args) => {
                tmpNode.current = []
                const graphTmpData = connectedGraph()
                myChart.setOption(
                        {
                            series: [
                            {
                                data: graphTmpData.nodes,
                                edges: graphTmpData.links
                            }
                        ]
                    })
                }
            )
            myChart.getZr().on( "click",(args) => {
                    if(tmpNode.current.length !== 0) {
                        
                        const graphTmpData = connectedGraph()
                            myChart.setOption(
                                {
                                    series: [
                                    {
                                        data: graphTmpData.nodes,
                                        edges: graphTmpData.links
                                    }
                                ]
                            })
                        persistenceTmp()
                    }else{
                        console.log("点击事件 但并没有数据")
                    }    
                }
            )
        }
        
    const graphData = useRef(null) 
    const initNode = useRef({
                    type:"paper",
                    index:-1
                })
    const handelDataChange =  () =>{
        if(props.paperData === null || props.paperData.length === 0 ){
            console.log("empty")
        }else{
            graphData.current = crerateGraph(props.paperData)
            console.log("初始化的图",graphData.current)
            if( props.type === "paper" ){
                initNode.current = {
                    type:"paper",
                    index:Number(props.first)
                }
                initOption(initNode.current)
            } else{
                initNode.current = {
                    type:"author",
                    index:graphData.current.authers.indexOf(props.first)
                }
                initOption(initNode.current)
            }
            console.log("console.log(props)",props)
            
            // PubSub.subscribe( 'paper_selected', (msg,args) => {//选中论文 json文件的index 
            //     if(initNode.current.index !== args){
            //     initNode.current = {
            //         type:"paper",
            //         index:args
            //     }
            //     initOption(initNode.current)
                
            //     }
            // })
            
            // PubSub.subscribe( 'author_selected', (msg,args) => {//选中作者 name ?
            //     if(initNode.current.index !== args){
            //     initNode.current = {
            //         type:"author",
            //         index:graphData.current.authers.indexOf(args)
            //     }
            //     initOption(initNode.current)
            //     }
            // })

        }   
    }
    
    const subToken = useRef(null)

    useEffect(handelDataChange) // type = paper/author first = paperIndex(paper)/nameString(author)
    return(<div id={UID.current} style={props.style}></div> )

}