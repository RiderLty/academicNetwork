import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use } from 'echarts';
import Year from "./MainPageModes/Year";
import Conference from "./MainPageModes/Conference";
import Affiliation from "./MainPageModes/Affiliation"
import PubsCited from "./MainPageModes/PubsCited"
import PubSub from 'pubsub-js'

import Grid from '@material-ui/core/Grid';

export default function MainPageView(props) {

    const paperDataSet = "/api/IEEE VIS papers 1990-2018.json" //论文数据集 之后将数据过滤安排在后端 

    function getPaperDataSet() {
        return new Promise((resolve, reject) => {
            fetch(paperDataSet).then(resp =>
                resp.json().then(data => resolve(data))
            )
        })
    }

    const [paperData, setPaperData] = useState(null)
    const [filteedPaperData, setFiltedPaperData] = useState(null)
    const refPaperData = useRef(null)

    const render = () => {
        setPaperData(props.paperData)
        setFiltedPaperData(props.paperData)
        refPaperData.current = props.paperData
        
    }

    const yearFilter = useRef([0, 65536])
    const pubsCitedFilter = useRef([0, 65536])


    
    const applyFilter = () => {
        const filtedDataTmp = refPaperData.current.filter(paper => {
                    const yearApply = yearFilter.current[0] < Number(paper.Year) && Number(paper.Year) < yearFilter.current[1]
                    const pubsCitedApply = pubsCitedFilter.current[0] < paper.PubsCited && paper.PubsCited < pubsCitedFilter.current[1]
                    return yearApply && pubsCitedApply
                }
            )
        setFiltedPaperData(filtedDataTmp)
    }


  
    useEffect(() => {
        render()
        PubSub.subscribe("mainPgage_yaer_range_selected", (msg, data) => {
            yearFilter.current = [data.start, data.end]
            applyFilter()
        })
        PubSub.subscribe("mainPgage_PubsCited_range_selected", (msg, data) => {
            pubsCitedFilter.current = [data.start, data.end]
            applyFilter()
        })

    }, [])

    return (
        <div>
            <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="flex-start"
            >
                <Grid item xs={6}>
                    <Year
                        paperData={paperData}
                        style={
                            {
                                width: "100%",
                                height: 420
                            }
                        }
                    />
                </Grid>
                <Grid item xs={6}>
                    <Conference
                        paperData={filteedPaperData}
                        style={
                            {
                                width: "100%",
                                height: 420
                            }
                        }
                    />
                </Grid>
                <Grid item xs={6}>
                    <PubsCited
                        paperData={paperData}
                        style={
                            {
                                width: "100%",
                                height: 420
                            }
                        }
                    />
                </Grid>
                <Grid item xs={6}>
                    <Affiliation
                        paperData={filteedPaperData}
                        style={
                            {
                                width: "100%",
                                height: 420
                            }
                        }
                    />
                </Grid>
            </Grid>

        </div>
    )

}

