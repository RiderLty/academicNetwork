import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import cx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import TextInfoContent from '@mui-treasury/components/content/textInfo';
import { useN01TextInfoContentStyles } from '@mui-treasury/styles/textInfoContent/n01';
import { useWideCardMediaStyles } from '@mui-treasury/styles/cardMedia/wide';
import { useFadedShadowStyles } from '@mui-treasury/styles/shadow/faded';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import PubSub from 'pubsub-js'
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Grid from '@material-ui/core/Grid';



const width = 950
const height = 800

const widthaddbar = width+10
const heightsubtop = height-40


const useStyles = makeStyles((theme) => ({
    root: {
        margin: 'auto',
        width: width,
        maxHeight: height,
        overflow: "hiden",
    },
    scrollpart: {
        width: widthaddbar,
        maxHeight: heightsubtop,
        overflow: "scroll",
    },
    content: {
        padding: 24,
    },
    Box: {
        '& > *': {
            margin: theme.spacing(0.5),
        },
    },
    headimg: {
        width: '100%',
        height: 300,
    }
}));

export default function PaperInfo(props) {

    const [paperData, setPaperData] = useState({
        "Conference": "",
        "Year": "",
        "Title": "",
        "DOI": "",
        "Link": "",
        "FirstPage": 0,
        "LastPage": 0,
        "PaperType": "",
        "Abstract": "",
        "AuthorNames-Deduped": [],
        "AuthorNames": "",
        "AuthorAffiliation": "",
        "InternalReferences": "",
        "AuthorKeywords": "",
        "AminerCitationCount_02-2019": 0,
        "XPloreCitationCount_02-2019": 0,
        "PubsCited": 0,
        "Award": ""
    })



    const cardStyles = useStyles();
    const wideCardMediaStyles = useWideCardMediaStyles();
    const fadeShadowStyles = useFadedShadowStyles();
    const textCardContentStyles = useN01TextInfoContentStyles();

    useEffect(() => {
        if (props.data !== null) {
            setPaperData(props.data)
        }
    }, [props.data])

    const goto_dynamic = (type,args) => {
        window.location.href = `/#/DynamicDiscoveryMode/${type}/${args}`
    }

    return (
        <Card className={cx(cardStyles.root, fadeShadowStyles.root)} onClick={ (e) => {e.stopPropagation()}}>
            <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="flex-start"
            >
                <IconButton
                    color="primary"
                    onClick={() => {
                        PubSub.publish("float_window_close_card", "")
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <IconButton 
                color="primary" 
                onClick={() => {
                        goto_dynamic("paper",paperData._index)
                    }}
                    >
                    <MoreVertIcon />
                </IconButton>
            </Grid>

            <div className={cardStyles.scrollpart}>
                <CardMedia
                    className={cardStyles.headimg}
                    image={"./img/paper.png"}
                />
                <CardContent className={cardStyles.content}>
                    <TextInfoContent
                        classes={textCardContentStyles}
                        heading={paperData["Title"]}
                        body={
                            paperData.Abstract//.slice(0, 800) + "..."
                        }
                    />
                </CardContent>
                <Box className={cardStyles.Box} px={3} pb={3}>
                    {paperData["AuthorNames-Deduped"].map((row) => (
                        <Chip
                            variant="outlined"
                            color="primary"
                            avatar={<Avatar>{row.slice(0, 1)}</Avatar>}
                            label={row}
                            clickable
                            onClick={
                                () => {
                                    PubSub.publish("author_selected", row)
                                }
                            } />
                    ))}
                </Box>
            </div>
        </Card>
    );
}