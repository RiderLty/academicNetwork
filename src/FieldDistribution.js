import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as echarts from 'echarts';
import 'echarts-gl';
import uuid from "uuid"
import { use } from 'echarts';
import PubSub from 'pubsub-js'
import { echartTheme } from "./echartTheme"
//论文领域分布图

// function getNumberInNormalDistribution(mean, std_dev) {
//     return mean + (randomNormalDistribution() * std_dev);
// }

// function randomNormalDistribution() {
//     var u = 0.0, v = 0.0, w = 0.0, c = 0.0;
//     do {
//         u = (Math.random() * 0.8 + 0.1 ) * 2 - 1.0;
//         v = (Math.random() * 0.8 + 0.1 ) * 2 - 1.0;
//         w = u * u + v * v;
//     } while (w == 0.0 || w >= 1.0)
//     c = Math.sqrt((-2 * Math.log(w)) / w);
//     return u * c;
// }


// const getField = (paperEntity) => {// 论文实体 => [...领域]
//     // return paperEntity.AuthorKeywords.split(",")
//     const len = Math.round((Math.random() * 0.8 + 0.1 ) * 5)
//     const field = []
//     for (let i = 0; i < len; i++) {
//         field.push(Math.round((Math.random() * 0.8 + 0.1 ) * 10) + "")
//     }
//     return field
// }





// const getFieldsData = (paperList) => {
//     const fieldPaperCounts = {}//领域的count 用于绘制饼图(不适合，饼图的部分占比应该由其中的节点数量决定)
//     const AuthorPapers = {}//作者的论文[...index]
//     const fieldNodes = {}
//     paperList.forEach((paper, index) => {
//         for (let field of getField(paper)) {
//             fieldPaperCounts[field] = fieldPaperCounts[field] + 1 || 1
//         }
//         for (let authorName of paper["AuthorNames-Deduped"]) {
//             if (AuthorPapers[authorName] === undefined) {
//                 AuthorPapers[authorName] = [index]
//             } else {
//                 AuthorPapers[authorName].push(index)
//             }
//         }
//     }
//     )
//     const getNodeValue = (type, key, field) => {//取值模块 闭包 
//         let value = 0
//         if (type === "author") { //  作者的值 = count [论文数 in 该领域]  或许应该使用论文值之和
//             AuthorPapers[key].forEach((paperIndex) => {
//                 const paperEntity = paperList[paperIndex]

//                 value += getField(paperEntity).indexOf(field) === -1 ? 0 : 1//直接计数

//                 // if( getField(paperEntity).indexOf(field) === -1 ){//权重统计
//                 //     value += getNodeValue("paper",paperIndex,field)//使用getValue获取
//                 //     // value += paperEntity.PubsCited//直接使用引用数
//                 // }
//             }
//             )
//             return value
//         } else if (type === "paper") { // 论文的值为PubsCited
//             value = paperList[key].PubsCited
//             return value
//         }
//         return 0
//     }

//     Object.keys(fieldPaperCounts).forEach((fieldName) => {
//         fieldNodes[fieldName] = {
//             autherNodes: [],
//             paperNodes: [],
//         }
//     }
//     )

//     paperList.forEach((paper, index) => {
//         for (let fieldName of getField(paper)) {//对于论文所涉及的每一个领域
//             const paperValue = getNodeValue("paper", index, fieldName)
//             if (paperValue > 0) {
//                 fieldNodes[fieldName].paperNodes.push(//论文存入每个领域
//                     {
//                         type: "paper",
//                         key: index,
//                         value: paperValue
//                     }
//                 )
//             }

//             for (let authorName of paper["AuthorNames-Deduped"]) {
//                 const authorValue = getNodeValue("author", authorName, fieldName)
//                 if (authorValue > 0) {//不出意外 这个其实是永真的 应为至少为1
//                     fieldNodes[fieldName].autherNodes.push(
//                         {
//                             type: "author",
//                             key: authorName,
//                             value: authorValue
//                         }
//                     )
//                 }

//             }
//         }
//     }
//     )
//     return {
//         fields: Object.keys(fieldPaperCounts),//绘制饼图不应该使用这个
//         fieldNodes: fieldNodes,
//         AuthorPapers: AuthorPapers,
//     }
// }

// const getOptionData = (fieldsData, visualConfig) => {//领域数据,可视化配置 生成option
//     const getNodes = (fieldName) => {
//         if (visualConfig.usingType === "paper") {
//             return fieldsData.fieldNodes[fieldName].paperNodes
//         }
//         else {
//             return fieldsData.fieldNodes[fieldName].autherNodes
//         }
//     }

//     const fields = []
//     let totalCount = 0

//     fieldsData.fields.forEach((fieldName) => {//节点数量 ~ 饼图比例

//         if (getNodes(fieldName).length > visualConfig.miniCount) {
//             fields.push(
//                 {
//                     name: fieldName,
//                     start: totalCount,
//                     end: totalCount + getNodes(fieldName).length
//                 }
//             )
//             totalCount += getNodes(fieldName).length
//         }
//     })

//     const nodeLocations = []

//     const nodeData = []
//     const pieData = []
//     const drawLineData = [[0, 0]]


//     fields.forEach((fieldEntity, index) => {

//         let min = Math.min(...getNodes(fieldEntity.name).map(node => { return node.value }))
//         let max = Math.max(...getNodes(fieldEntity.name).map(node => { return node.value }))

//         pieData.push(
//             { value: fieldEntity.end - fieldEntity.start, name: fieldEntity.name, visualMap: false },
//         )
//         drawLineData.push([visualConfig.size, fieldEntity.start * 360 / totalCount])
//         drawLineData.push([0, 0])

//         for (let node of getNodes(fieldEntity.name)) {
//             const r = (node.value - min) / (max - min)

//             // const thet = ((Math.random() * 0.8 + 0.1 )) * (radianEnd - radianStart) + radianStart

//             // const thet = Math.PI * 2
//             //     * ((getNumberInNormalDistribution(50, 0) / 100)
//             //         * (fieldEntity.end - fieldEntity.start) + fieldEntity.start)
//             //     / totalCount

//             const thet = 360  //本质上 value 代表r thet是没有实际意义的 但是为乐可视化需要 使其正态分布在中轴
//                 * ((getNumberInNormalDistribution(50, 10) / 100)
//                     * (fieldEntity.end - fieldEntity.start) + fieldEntity.start)
//                 / totalCount


//             nodeLocations.push(
//                 {
//                     category: fieldEntity.name,
//                     type: node.type,
//                     name: node.name,
//                     key: node.key,
//                     r: r,
//                     thet: thet,
//                 }
//             )
//             nodeData.push(
//                 [
//                     r * visualConfig.size,
//                     thet,
//                     index
//                 ]
//             )
//         }
//     })



//     var option = {
//         title: {
//             text: ''
//         },
//         polar: {},
//         angleAxis: {
//             type: 'value',
//             startAngle: 0,
//             axisTick: {
//                 show: false
//             },
//             axisLabel: {
//                 show: false
//             }

//         },
//         radiusAxis: {
//             show: false,
//             axisTick: {
//                 show: false
//             },
//         },


//         visualMap: [
//             {
//                 type: 'continuous',
//                 dimension: 2,
//                 max: fields.length,
//                 inRange: {
//                     color: [
//                         "#2196F3",
//                         "#E91E63",
//                     ],
//                     symbolSize: 8
//                 }
//             }
//         ],
//         series: [
//             {
//                 coordinateSystem: 'polar',
//                 name: 'line',
//                 type: 'scatter',
//                 data: nodeData
//             },
//             {
//                 coordinateSystem: 'polar',
//                 name: 'line',
//                 type: 'line',
//                 data: drawLineData,
//                 itemStyle: {
//                     normal: {
//                         color: "#000000",
//                         size: 0,
//                         show: false,
//                         opacity: 0
//                     },
//                     emphasis: {
//                     }
//                 },
//                 lineStyle: {
//                     normal: {
//                         width: 0.2,
//                         color: "#000000"
//                     },
//                     hilight: {
//                     }
//                 }
//             }
//         ]
//     };
//     return option
// }





// const yearData = {//这个 应该是sank图初始化就完成的 然后年份变化 直接取出传过来
//     year: 1990,
//     theme_author: {
//         theme_3D: [
//             {
//                 name: "name1",
//                 count: 10
//             },
//             {
//                 name: "llname1",
//                 count: 1
//             },
//             {
//                 name: "llname1",
//                 count: 2
//             },
//             {
//                 name: "llname3",
//                 count: 3
//             },
//             {
//                 name: "name2",
//                 count: 5
//             },
//             {
//                 name: "name3",
//                 count: 10
//             }
//         ],
//         theme2: [
//             {
//                 name: "name1",
//                 count: 10
//             },
//             {
//                 name: "name2",
//                 count: 5
//             },
//             {
//                 name: "name3",
//                 count: 10
//             }
//         ],
//         theme3: [
//             {
//                 name: "name1",
//                 count: 10
//             },
//             {
//                 name: "name2",
//                 count: 5
//             },
//             {
//                 name: "name3",
//                 count: 10
//             }
//         ]
//     }
// }




export default function FieldDistribution(props) {
    const UID = useRef(uuid.v1())
    const chart = useRef(null)
    const visualConfig = {
        pieNum: 4,//N段圆环
    }
    const translateData = (yearData) => {
        const themePie = []
        const valuePolar = []
        let angleSUM = 0
        const pieRange = {}
        for (let theme in yearData.theme_author) {

            themePie.push(
                {
                    value: yearData.theme_author[theme].length,
                    name: theme
                }
            )
            pieRange[theme] = {
                start: angleSUM,
                end: angleSUM + yearData.theme_author[theme].length
            }
            angleSUM += yearData.theme_author[theme].length
        }

        let themeCount = 0

        for (let theme in yearData.theme_author) {
            const ConeDistribution = [] //锥形分布数据
            const thetaStart = pieRange[theme].start * 360 / angleSUM
            const thetaEnd = pieRange[theme].end * 360 / angleSUM

            const r_t_map = {}
            yearData.theme_author[theme].forEach(element => {
                ConeDistribution.push(element)
                const theta = (Math.random() * 0.8 + 0.1) * (thetaEnd - thetaStart) + thetaStart
                if (element.count > visualConfig.pieNum) {
                    const r = 1 / visualConfig.pieNum * (Math.random() * 0.8 + 0.1) //随机  0.1~0.9
                    r_t_map[element.name] = [r, theta]
                } else {
                    const r = (visualConfig.pieNum - element.count + (Math.random() * 0.8 + 0.1)) * (1 / visualConfig.pieNum)
                    r_t_map[element.name] = [r, theta]
                }
            })

            const get_r_theta = (author) => {
                // thetaStart
                // thetaEnd
                // ConeDistribution 可以闭包调用
                return r_t_map[author.name]
            }

            yearData.theme_author[theme].forEach(element => {
                const r_theta = get_r_theta(element)
                valuePolar.push(
                    {
                        r: r_theta[0],
                        theta: r_theta[1],
                        color: colorMap.current[theme] === undefined ? echartTheme.color[themeCount % echartTheme.color.length] : colorMap.current[theme],
                        name: element.name,
                        count: element.count
                    }
                )

            })

            themeCount += 1
        }




        return {
            pie: themePie,
            polar: valuePolar
        }
    }

    const makeSeries = (values) => {
        const interval = Math.floor(60 / visualConfig.pieNum)
        const series = []
        for (let i = 0; i < visualConfig.pieNum; i++) {
            series.push(
                {
                    type: 'pie',
                    radius: [i * interval + "%", (i + 1) * interval + "%"],
                    label: {
                        show: false
                    },
                    data: values,
                    itemStyle: {
                        color: "#ffffff",
                        borderWidth: 1,
                        borderColor: "#6e7079",
                        borderType: "dashed"

                    },
                    emphasis: {
                        scale: false
                    }
                }
            )
        }
        series.push(
            {
                type: 'pie',
                radius: ["60%", "65%"],
                label: {
                    show: true,

                },
                data: values,
                itemStyle: {
                    color: "#CDCDCD",
                    borderRadius: 3,
                    borderWidth: 1,
                    borderColor: "#ffffff",
                },
                emphasis: {
                    scale: false,
                    label: {
                        show: true
                    },
                }
            }
        )
        return series

    }

    const makePolar = (nodes) => { // 半径 角度 悬浮标签 颜色
        const polar = {
            coordinateSystem: 'polar',
            name: 'line',
            type: 'scatter',

            symbolSize: 10,
            data: [

                {
                    value: [1, 360],
                    label: {},
                    symbolSize: 0,
                },
                ...nodes.map(node => (
                    {
                        value: [node["r"], node["theta"]],
                        label: "姓名:" + node["name"] + "</br>发表数:" + node["count"],
                        name: node["name"],
                        itemStyle: {
                            color: node["color"]
                        },
                    }
                )
                )
            ]
        }
        return polar
    }


    const makeYearData = (sankdata, year) => {

        const theme_author = {}
        sankdata.forEach(authorPapers => {
            const author_theme_count = {}
            const author_name = authorPapers[0].name
            authorPapers.forEach(paperInfo => {
                if (paperInfo.year === year) {
                    author_theme_count[paperInfo.theme] = author_theme_count[paperInfo.theme] + 1 || 1
                }
            })
            for (let theme_name in author_theme_count) {
                if (theme_author[theme_name] === undefined) {
                    theme_author[theme_name] = [{ name: author_name, count: author_theme_count[theme_name] }]
                } else {
                    theme_author[theme_name] = [...theme_author[theme_name], { name: author_name, count: author_theme_count[theme_name] }]
                }
            }
        })
        return {
            year: year,
            theme_author: theme_author
        }

    }
    const initChart = () => {
        // console.log("colorMap.current",colorMap.current)
        if (props.sankData === undefined || props.sankData.length === 0 || props.year === null) {
            return
        }



        const yearData = makeYearData(props.sankData, props.year)



        const dataResult = translateData(yearData)

        if (chart.current === null) {
            chart.current = echarts.init(document.getElementById(UID.current), "default");
        } else {
            chart.current.clear()
        }



        const series = makeSeries(dataResult.pie)

        series.push(makePolar(dataResult.polar))

        // console.log(makePolar(dataResult.polar))

        const option = {
            title: {
                text: props.year
            },
            animation: false,
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    if (params.componentSubType === "scatter") {
                        return params.data.label;
                    }
                    return ""
                }
            },
            polar: {
                radius: "60%"
            },
            angleAxis: {
                show:false,
                type: 'value',
                startAngle: 90
            },
            radiusAxis: {
                show:false,

            },
            series: series
        }
        chart.current.setOption(option)
        chart.current.off("mouseover")
        chart.current.on("mouseover", { componentSubType: "scatter" }, (args) => {//,
            if (args.componentSubType === "scatter") {
                props.hilightAuthor(args.data.name)
            }
        }
        )
        chart.current.off("mouseout")
        chart.current.on("mouseout", { componentSubType: "scatter" }, (args) => {//,
            
            if (args.componentSubType === "scatter") {
                props.hilightAuthor("")
                // console.log("out!!!",args)
            }
        })

    }

    useEffect(initChart, [props.sankData, props.year])

    const colorMap = useRef({})

    useEffect(() => {
        colorMap.current = props.colorMap
        initChart()
    }, [props.colorMap])
    return (
        <div id={UID.current} style={props.style}>
        </div>
    )
}
