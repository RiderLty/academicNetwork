import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import PaperInfo from "./PaperInfo"
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import PubSub from 'pubsub-js'

import Slide from '@material-ui/core/Slide';

import AuthorInfo from "./AuthorInfo"


const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));


export default function FloatingWindow(props) {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [checkedAnmie, setCheck] = useState(true)
    const [animeDirection,setAnimeDirection] = useState("up")
    const stack = useRef([])
    const [cardDataMap, setCardDataMap] = useState(null)

    const updateCardData = (cardData,inout) => {
        if(inout === "in"){
            setAnimeDirection("down")
        }else{
            setAnimeDirection("up")
        }
        setCheck(false)
        setTimeout(() => { setCardDataMap(cardData) }, 200)
        setTimeout(() => { 
            if(inout === "in"){
                setAnimeDirection("up")
            }else{
                setAnimeDirection("down")
            }
            setCheck(true) 
        }, 200)
    }

    const handelPush = (pushData) => {
        if (stack.current.length === 0) {//push时为0 为第一层 开启显示
            setOpen(true)
        }
        stack.current.push(pushData)
        updateCardData(pushData,"in")
        console.log("open!", stack.current)
    }

    const handelPop = () => {//pop  关闭当前 且呈现上一个
        console.log("before do pop", stack.current)
        if (stack.current.length === 1) {//如果现在是1 则关闭
            stack.current = []
            updateCardData(null,"out")
            setOpen(false)
        }//pop 但是为长度为0 关闭显示
        else {//不为1 则pop当前的 现在最后一个
            stack.current.pop()
            updateCardData(stack.current[stack.current.length - 1],"out")
        }
    }

    const handelClose = () => {
        stack.current = []
        updateCardData(null,"out")
        setOpen(false)
    }

    const [paperInfoRawData, setPaperInfoRawData] = useState(null)
    const [authorInfoRawData, setAuthorInfoRawData] = useState(null)

    const getAuthorInfo = (authorName) => {
        const authorPapers = []
        props.paperData.forEach((paperEntity, index) => {
            if (paperEntity["AuthorNames-Deduped"].indexOf(authorName) !== -1) {
                const paperEntityWithIndex = JSON.parse(JSON.stringify(paperEntity))
                paperEntityWithIndex["_index"] = index//添加了index属性
                authorPapers.push(paperEntityWithIndex)
            }
        }
        )
        return {
            name: authorName,
            papers: authorPapers
        }
    }

    const getPaperInfo = (paperIndex) => {
        console.log(paperIndex,props.paperData[paperIndex])
        const paperInfoWithIndex = {...props.paperData[paperIndex],_index:paperIndex}
        return paperInfoWithIndex
    }

    useEffect(() => {
        PubSub.subscribe("paper_selected", (msg, paperIndex) => {
            handelPush({
                type: "paper",
                data: getPaperInfo(paperIndex) 
            })
        })
        PubSub.subscribe("author_selected", (msg, authorName) => {
            handelPush({
                type: "author",
                data: getAuthorInfo(authorName)
            })
        })
        PubSub.subscribe("float_window_close_card", (msg, data) => {
            handelPop()
        })
    }, [])
    return (
        <div>
            <Backdrop className={classes.backdrop} open={open} onClick={ (target)=>{handelClose()} } >
                <Slide direction={animeDirection} in={checkedAnmie} >
                    <div style={{height:800}}  >
                        {
                            cardDataMap === null ?
                                <div />
                                :
                                cardDataMap.type === "paper" ?
                                    <PaperInfo data={cardDataMap.data} />
                                    :
                                    <AuthorInfo data={cardDataMap.data} />
                        }
                    </div>
                </Slide>
            </Backdrop>
        </div >
    )
}