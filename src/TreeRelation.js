import React, { useState,useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use } from 'echarts';
import PubSub from 'pubsub-js'
//论文作者之间合作关系

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
        paperAuthers.push(   )
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






export default function TreeRelation(props){
    const UID = useRef(uuid.v1())
    const visualConfig = {
        maxSymbolSize:10,
        maxEdgeWidth:10,
        seriesNum:8
    }
    const initOption = ( data ) => {
            var chartDom = document.getElementById(UID.current);
            var myChart = echarts.init(chartDom,"default");
            myChart.clear()
            
            



            const option = {
                
            }
            
            myChart.setOption(option);
            
            myChart.on( "click", (args) => {}
                   
            )

            // PubSub.clearAllSubscriptions();
            
            // PubSub.subscribe( 'paper_selected', (msg,args) => {//选中论文 json文件的index 
                
            // })

            // PubSub.subscribe( 'author_selected', (msg,args) => {//选中作者 name ?

            // })

            // PubSub.subscribe( 'clear_selected',(msg,args) => {//清除所有选中

            // })
            



            // PubSub.subscribe('CircularGraph_mousemove_dataIndex', (msg,paperDataIndex) => {//引用关系传递的onhover的dataindex 代表论文下标
            //     const AuthorNames_Deduped = data.paperMap[paperDataIndex]["AuthorNames-Deduped"]
            //     myChart.dispatchAction(
            //         {
            //             type: 'highlight',
            //             seriesIndex:0,
            //             dataIndex: data.nodes.indexOf(  AuthorNames_Deduped[0]   )
            //         }
            //     )
            // });
        
        }
    
    const handelDataChange =  () =>{
        if(props.paperData === null){
            console.log("empty")
        }else{
            initOption( crerateGraph(props.paperData))
        }   
    }

   
    
    useEffect(handelDataChange)
    return (
        <div id={UID.current} style={props.style}>
        </div>
    )

}

