import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import App from '../App';
import reportWebVitals from '../reportWebVitals';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use, format } from 'echarts';
import PubSub from 'pubsub-js'
import { echartTheme } from "../echartTheme"
import G6 from '@antv/g6';
import * as author_outline from "./datas/author_outline.json"
import * as paper_outline from "./datas/paper_outline.json"
import * as mail_outline from "./datas/mail_outline.json"


export default function ContourGrapg(props) {


    const UID = useRef(uuid.v1())


    const getYearGraph = (nodes, links, comm) => {
        const miniConnect = data_type.current === "学者" ? 8 : 0
        const miniComauthorNum = 0
        const edgeConnectNum = {}

        const overNodes_Set = new Set()

        const overLinks = []

        const overComm = []
        links.forEach(link => {
            edgeConnectNum[link.source] = edgeConnectNum[link.source] + 1 || 1
            edgeConnectNum[link.target] = edgeConnectNum[link.target] + 1 || 1
        })

        for (let nodeName in edgeConnectNum) {
            if (edgeConnectNum[nodeName] > miniConnect) {
                overNodes_Set.add(nodeName)
            }
        }

        links.forEach(link => {
            if (overNodes_Set.has(link.source) && overNodes_Set.has(link.target)) {
                overLinks.push(link)
            }
        })

        comm.forEach(author_names => {
            const unicon = new Set([...author_names].filter(x => overNodes_Set.has(x)))
            if (Array.from(unicon).length > miniComauthorNum) {
                overComm.push(Array.from(unicon))
            }
        })
        return {
            nodes: Array.from(overNodes_Set).map((name,index) => ({
                id: name,
                zise: 2, 
                style: {
                    fill: echartTheme.color[ index % echartTheme.color.length ],
                    stroke: echartTheme.color[ index % echartTheme.color.length ],
                },
            })),
            links: overLinks,
            comm: overComm
        }

    }


    const graph = useRef(null)

    const initChart = (yearIndex) => {

        

        let outlinedata = null
        if (data_type.current === "论文") {
            outlinedata = paper_outline.default
        } else if(data_type.current === "学者") {
            outlinedata = author_outline.default
        }else if(data_type.current === "邮件") {
            outlinedata = mail_outline.default
        }else{
            return
        }

        const yearOutlineGraph = getYearGraph(outlinedata.nodes[yearIndex], outlinedata.edges[yearIndex], outlinedata.comm[yearIndex])
        
        console.log("yearOutlineGraph",yearOutlineGraph)
        // return
        
        
        const width = 500;
        const height = 420;
        document.getElementById(UID.current).innerHTML = "";
        const _graph = new G6.Graph({
            container: UID.current,
            width,
            height,
            modes: {
                default: ['drag-canvas', 'zoom-canvas', 'drag-node', 'lasso-select'],
            },
            layout: {
                type: 'force',
                preventOverlap: true,
                linkDistance: 20,
                nodeStrength: -10,
                edgeStrength: 0.3
            },
        });

        _graph.data({
            nodes: yearOutlineGraph.nodes,
            edges: yearOutlineGraph.links.map(function (edge, i) {
                edge['id'] = 'edge' + i;
                return Object.assign({}, edge);
            }),
        });
        _graph.render();


        _graph.on('afterlayout', () => {
            const hulls = []
            yearOutlineGraph.comm.forEach((authorNames,index) => {
                hulls.push(
                    _graph.createHull({
                        id: JSON.stringify(authorNames),
                        type: authorNames.length > 10 ? 'bubble' : 'round-convex',
                        members: authorNames,
                        padding: 10,
                        style: {
                            fill: echartTheme.color[ index % echartTheme.color.length ],
                            stroke: echartTheme.color[ index % echartTheme.color.length ],
                        },
                    })
                )
            })
            _graph.on('afterupdateitem', (e) => {
                for (let i = 0; i < hulls.length; i++) {
                    hulls[i].updateData(hulls[i].members);
                }
            });
        });
    }


    useEffect(() => {
        initChart(30)
    }, [])
    const year_control = useRef(2016)
    useEffect(() => {
        year_control.current = props.year
        initChart(year_control.current - 1990)
    }, [props.year])
    const data_type = useRef("作者")
    useEffect(() => {
        data_type.current = props.dataSetSelectValue
        initChart(year_control.current - 1990)

    }, [props.dataSetSelectValue])

    return (
        <div id={UID.current} style={props.style}>

        </div>
    )
}




