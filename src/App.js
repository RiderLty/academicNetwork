import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import "./App.css";
import logo from './logo.svg';
import WebGLForceDirectGraph from "./WebGLForceDirectGraph";
import ClusteringGraph from "./ClusteringGraph"
import { handEledgelist, handelClustering } from "./graphEncoding"
import QuoteForce from "./QuoteForce"
import CircularGraph from './CircularGraph';
import CooperationRelation from './CooperationRelation'
import OverviewGraph from './MainPageModes/Year'
import DynamicDiscovery from './DynamicDiscovery'
import PaperInfo from './FloatingWindowModes/PaperInfo'
import MainPageView from './MainPageView'
import FieldDistribution from "./Sank2Modes/FieldDistribution";
import FloatingWindow from "./FloatingWindowModes/FloatingWindow"
import Sank from "./Sank"
import DataPreview from "./DataPreview"


import clsx from 'clsx';
import { fade, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';
import AssignmentIcon from '@material-ui/icons/Assignment';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import DonutLargeIcon from '@material-ui/icons/DonutLarge';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import BlurOnIcon from '@material-ui/icons/BlurOn';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import StorageIcon from '@material-ui/icons/Storage';
import PermDataSettingIcon from '@material-ui/icons/PermDataSetting';
import SettingsIcon from '@material-ui/icons/Settings';
import AccountTreeIcon from '@material-ui/icons/AccountTree';

import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import MainKeywordGraph from './KeywordsRecommenderModes/MainKeywordGraph';
import ContourGrapg from "./Sank2Modes/ContourGrapg"
import { saveAs } from 'file-saver';
import CardMedia from '@material-ui/core/CardMedia';
import Sankver2 from "./Sank2Modes/Sankver2"



const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    menuButtonHidden: {
        display: 'none',
    },
    title: {
        flexGrow: 1,
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9),
        },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
    },
    fixedHeight: {
        height: 240,
    },
    CircularGraphModeStyle: {
        width: "100%",
        height: "100%",
        display: "inline"
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '30ch',
            '&:focus': {
                width: '40ch',
            },
        }
    },
    table: {
        minWidth: "100%",
    },
}));


const BFSubGraph = (graph, center_index, deepth) => {
    // console.log("传入 BFS",graph)
    const visited = {}//存放index
    for (let i = 0; i < graph.nodes.length; i++) {
        visited[i] = false
    }
    const queue = []//存的也是index
    queue.push(center_index)
    for (let loopCount = 0; loopCount < deepth; loopCount++) {
        const thisLoopVisit = queue.slice()
        queue.length = 0
        for (let node_i of thisLoopVisit) {
            if (visited[node_i] === false) {
                visited[node_i] = true
                graph.edges.forEach(([start, end]) => {
                    if (start === node_i && visited[end] == false) {
                        queue.push(end)
                    }
                    if (end === node_i && visited[start] == false) {
                        queue.push(start)
                    }
                })
            }
        }
        // console.log("loop:",loopCount,queue)
    }
    const nodes = []

    const reSort = {}
    for (let i = 0; i < graph.nodes.length; i++) {
        if (visited[i]) {
            reSort[i] = nodes.length
            nodes.push(graph.nodes[i])
        }
    }
    const edges = []//下标变化后 重排
    graph.edges.forEach(([start, end]) => {
        if (visited[start] && visited[end]) {
            edges.push([reSort[start], reSort[end]])
        }
    })
    return {
        nodes: nodes,
        edges: edges
    }
}


const keywordFilter = (object, arg) => {
    return (object.Abstract.toLowerCase().indexOf(arg.toLowerCase()) != -1 || object.Title.toLowerCase().indexOf(arg.toLowerCase()) != -1) || (object.AuthorKeywords.toLowerCase().indexOf(arg.toLowerCase()) != -1)
}


const AutherFilter = (object, arg) => {
    let flag = false
    object["AuthorNames-Deduped"].forEach((name) => {
        if (name.indexOf(arg) !== -1) {
            flag = true
        }
    })
    return flag
}

const realtionFilter = (object, type, arg) => {//关系过滤器 过滤与所给参数有关的论文 
    //参数指定为作者或者某一篇论文  先生成网络 再使用BFS过滤 
    //最后返回仍然是论文列表
    //当展示模块使用某个关系构建图时
    //会得到一个连通图

}

const andFilter = () => {

}

const orFilter = () => {

}

const paperFilter = (paperList, arg) => {//子图筛选 根据关键词 筛选满足条件的paper
    var filtered = []
    paperList.forEach(paper => {
        if (keywordFilter(paper, arg)) {
            filtered.push(paper)
        }
    }
    )
    return filtered
}

function App(props) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(true);
    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

    const [forceGraphData, setForceGraphData] = useState(null)
    const [clusteringGraphData, setClusteringGraphData] = useState(null)
    const [quoteGraphData, setQuoteGraphData] = useState(null)

    //但是  有些是特殊的 拥有单独状态

    const [paperData, setPaperData] = useState([])//作为统一的数据源 数据的处理在图内部进行
    const [sankData, setSankData] = useState([])
    //点击之类的操作 也仅仅是传递给父组件 然后由父组件修改数据源 子组件再统一重新渲染


    const nodes = useRef(null)//节点 来自于边数组的节点数组 与传入聚类的向量数组有着相同的顺序 可用于直接索引
    // [node1,node2,node3] 值为边文件的值
    const edges = useRef(null)//边 [[start,end],[]] start,end为节点在nodes中的下标
    const vecs = useRef(null)//向量 struce2vec得到的向量 Map key为node值 传入聚类的顺序应当有nodes决定

    const datamap = useRef(null)

    const edgeListUrl = "./api/academicNetwork.edgelist"//边列表
    const struct2vecResultUrl = "./api/academicNetwork.emb"//节点向量化
    const dataMap = "./api/datamap.json"//节点下标 到 数据的映射


    const paperDataSet = "./api/IEEE VIS papers 1990-2018.json" //论文数据集 之后将数据过滤安排在后端 
    const sankDataSet = "./api/sankRawData.json"

    function getEdgeList() {
        return new Promise((resolve, reject) => {
            fetch(edgeListUrl).then(resp =>
                resp.text().then(data => resolve(data))
            )
        })
    }
    function getVec() {
        return new Promise((resolve, reject) => {
            fetch(struct2vecResultUrl).then(resp =>
                resp.text().then(data => resolve(data))
            )
        })
    }
    function getMap() {
        return new Promise((resolve, reject) => {
            fetch(dataMap).then(resp =>
                resp.json().then(data => resolve(data))
            )
        })
    }


    function getPaperDataSet() {
        return new Promise((resolve, reject) => {
            fetch(paperDataSet).then(resp =>
                resp.json().then(data => resolve(data))
            )
        })
    }

    function getSankDataSet() {
        return new Promise((resolve, reject) => {
            fetch(sankDataSet).then(resp =>
                resp.json().then(data => resolve(data))
            )
        })
    }

    const queryDataMap = (index) => {//查询数据映射 传入index 返回用于显示在图标上的文本
        return datamap.current[Number(index)] || "null"
    }



    const raw_paperdata = useRef("")

    useEffect(() => {
        getPaperDataSet().then(data => {
            raw_paperdata.current = data
            setPaperData(data)
            // doSearch("2D")
        })
        getSankDataSet().then(data => {
            setSankData(data)
        })
    }, [])



    // const handelClusteringClick = (params) => {//点击获取子图
    //     console.log("node:", nodes.current[params.dataIndex])//params.dataIndex 为点击的节点 在 节点数组的下标
    //     console.log("vec:", vecs.current.get(nodes.current[params.dataIndex]))
    //     const subGrapg = BFSubGraph({
    //         nodes: nodes.current,
    //         edges: edges.current
    //     }, params.dataIndex, 5)//获取到的子图 index仍然对应原始数据映射
    //     console.log("sunGraph", subGrapg)

    //     const edge_tmp = []
    //     const forceTmp = []

    //     for (let i = 0; i < subGrapg.edges.length; i++) {
    //         edge_tmp.push(subGrapg.edges[i][0])
    //         edge_tmp.push(subGrapg.edges[i][1])
    //         forceTmp.push(1)
    //     }

    //     setForceGraphData({
    //         nodes: subGrapg.nodes,
    //         edges: edge_tmp,
    //         dependentsCount: forceTmp
    //     })
    // }



    const MainPageMode = () => {
        return <MainPageView
            paperData={paperData}
        />
    }

    const BigDataWarming = (mode) => {
        const [show, setShow] = useState(false)
        const [open, setOpen] = React.useState(true);
        const cancelButton = () => {
            setOpen(false);
            window.location.href = "/#/"
        };

        const continueButton = () => {
            setShow(true)
            setOpen(false);
        };


        const warming = (
            <Dialog
                open={open}
                onClose={cancelButton}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"警告，数据量过大"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        当前使用数据集大小为{paperData.length}，继续渲染可能会导致渲染缓慢，是否继续？
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={continueButton} color="primary">
                        继续
                    </Button>
                    <Button onClick={cancelButton} color="secondary">
                        取消
                    </Button>
                </DialogActions>
            </Dialog>
        )




        const limit = 1000
        if (paperData.length > limit) {
            return (
                show ?
                    mode
                    :
                    warming
            )
        } else {
            return mode
        }

    }



    const CircularGraphMode = () => {
        return BigDataWarming(
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                spacing={3}
            >
                <Grid item xs={12} >
                    <CircularGraph
                        paperData={paperData}
                        style={
                            {
                                width: "100%",
                                height: 850
                            }
                        }
                    />

                </Grid>
                <FloatingWindow paperData={paperData} />
            </Grid>
        )
    };
    const CooperationRelationMode = () => {
        return BigDataWarming(
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                spacing={3}
            >
                <Grid item xs={12} >
                    <CooperationRelation
                        paperData={paperData}
                        style={
                            {
                                width: 1080,
                                height: 850
                            }
                        }
                    />
                </Grid>
                <FloatingWindow paperData={paperData} />
            </Grid>
        )
    };



    const SankMode = () => {
        return (
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                spacing={3}
            >
                <Grid item xs={12} >
                    <Sank
                        sankdata={sankData}
                        style={
                            {
                                width: "100%",
                                height: 850
                            }
                        }
                    />
                </Grid>
            </Grid>
        )
    };



    const Sankver2MOD = () => {
        return (
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                spacing={3}
            >
                <Grid item xs={12} >
                    <Sankver2
                        sankdata={sankData}
                        style={
                            {
                                width: "100%",
                                height: 850
                            }
                        }
                    />
                </Grid>
            </Grid>
        )
    }

    const OverviewGraphMode = () => {
        return BigDataWarming(
            <DataPreview paperData={paperData} />
        )
    };

    const DynamicDiscoveryMode = (props) => {

        // console.log(props.match)

        return (
            <DynamicDiscovery
                paperData={paperData}
                style={
                    {
                        width: "100%",
                        height: 850
                    }
                }
                type={props.match.params.type}
                first={props.match.params.args}
            />
        )
    };


    const FieldDistributionMode = () => {
        return (
            <FieldDistribution
                sankData={sankData}
                year={2015}
                style={
                    {
                        width: 550,
                        height: 550
                    }
                }
            />
        )
    }



    const KeywordsRecommenderPageMode = () => {

        return (
            <MainKeywordGraph
                paperData={paperData}
                doSearch={doSearch}
                style={
                    {
                        width: "100%",
                        height: 1200
                    }
                }
            />
        )
    }



    const ContourGrapgPageMode = () => {
        return (
            <ContourGrapg
                paperData={paperData}
                style={
                    {
                        width: "100%",
                        height: 1200
                    }
                }
            />
        )
    }

    const searchValue = useRef("")
    const [searchvalue_stause, setsearchvalue_stause] = useState("")
    const setSearchValue = (event) => {
        searchValue.current = event.target.value
        // setsearchvalue_stause(event.target.value)
    }



    const doSearch = (args) => {
        console.log("dosearch", args)
        searchValue.current = args
        let filted = paperFilter(raw_paperdata.current, searchValue.current);
        setPaperData(filted)
        //  window.location.href = "/#/"
    }


    const exportData = () => {
        var blob = new Blob([JSON.stringify(paperData, null, 4)], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "export result " + searchValue.current + ".json")
    }
    const customData = () => {
        document.getElementById("btn_file_hidden").click();
    }
    const fileUploaded = () => {
        const file = document.getElementById("btn_file_hidden").files[0]

        console.log(file)

        const reader = new FileReader()
        reader.readAsText(file, "UTF-8")
        reader.onload = function (evt) { //读取完文件之后会回来这里
            const fileString = evt.target.result; // 读取文件内容
            const uploadpaper = JSON.parse(fileString)
            raw_paperdata.current = uploadpaper
            doSearch("")
        }
    }


    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
                <Toolbar className={classes.toolbar}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
                    >
                        <MenuIcon />
                    </IconButton>


                    <img
                        style={{
                            width: 30,
                            height: 30,
                            marginRight: 20
                        }}
                        src="./acavis.png"
                        title="Contemplative Reptile"
                    />
                    <Typography component="h1" variant="h4" color="inherit" noWrap className={classes.title}>
                        AcaVis
                    </Typography>
                    <div className={classes.search}>
                        <div className={classes.searchIcon}>
                            <SearchIcon />
                        </div>
                        <InputBase
                            placeholder="search…"
                            classes={{
                                root: classes.inputRoot,
                                input: classes.inputInput,
                            }}
                            inputProps={{ 'aria-label': 'search' }}
                            onChange={setSearchValue}
                            // value={searchvalue_stause}
                            onKeyDown={(e) => {
                                if (e.keyCode === 13) {
                                    doSearch(searchValue.current)
                                }
                            }}

                        />
                    </div>
                </Toolbar>
            </AppBar>





            <Drawer
                variant="permanent"
                classes={{
                    paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
                }}
                open={open}
            >
                <div className={classes.toolbarIcon}>
                    <IconButton onClick={handleDrawerClose}>
                        <ChevronLeftIcon />
                    </IconButton>
                </div>
                <Divider />
                <List>
                    <ListItem button onClick={
                        () => { window.location.href = "/#/" }
                    }>
                        <ListItemIcon>
                            <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="首页" />
                    </ListItem>
                    <ListItem button onClick={
                        () => { window.location.href = "/#/KeywordsRecommenderPageMode" }
                    }>
                        <ListItemIcon>
                            <BlurOnIcon />
                        </ListItemIcon>
                        <ListItemText primary="关键词分布" />
                    </ListItem>
                    <ListItem button onClick={
                        () => { window.location.href = "/#/CooperationRelationMode" }
                    } >
                        <ListItemIcon>
                            <DonutLargeIcon />
                        </ListItemIcon>
                        <ListItemText primary="合作关系" />
                    </ListItem>
                    <ListItem button onClick={
                        () => { window.location.href = "/#/CircularGraphMode" }
                    }>
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText primary="论文互引" />
                    </ListItem>

                    <ListItem button onClick={
                        () => { window.location.href = "/#/SankMode" }
                    }>
                        <ListItemIcon>
                            <AccountTreeIcon />
                        </ListItemIcon>
                        <ListItemText primary="主题演化" />
                    </ListItem>


                    <ListItem button onClick={
                        () => { window.location.href = "/#/OverviewGraphMode" }
                    }>
                        <ListItemIcon>
                            <LayersIcon />
                        </ListItemIcon>
                        <ListItemText primary="数据表格" />
                    </ListItem>

                </List>
                <Divider />
                <List>
                    <div>
                        <ListSubheader inset>Saved reports</ListSubheader>
                        <ListItem button onClick={exportData}>
                            <ListItemIcon>
                                <PermDataSettingIcon />
                            </ListItemIcon>
                            <ListItemText primary="导出数据" />
                        </ListItem>
                        <ListItem button onClick={customData}>
                            <ListItemIcon>
                                <StorageIcon />
                            </ListItemIcon>
                            <ListItemText primary="自定义数据" />
                        </ListItem>
                        {/* <ListItem button>
                            <ListItemIcon>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText primary="相关设置" />
                        </ListItem> */}
                        <ListItem button onClick={() => {
                            doSearch("")
                        }}>
                            <ListItemIcon>
                                <ClearAllIcon />
                            </ListItemIcon>
                            <ListItemText primary="清空筛选器" />
                        </ListItem>
                    </div>
                </List>
            </Drawer>


            <main className={classes.content}  key="router"  >
                <div className={classes.appBarSpacer} />
                <Container maxWidth="100%" className={classes.container}>
                    <Router>
                        <Route path="/" component={MainPageMode} exact />
                        <Route path="/CircularGraphMode" component={CircularGraphMode} />
                        <Route path="/CooperationRelationMode" component={CooperationRelationMode} />
                        <Route path="/OverviewGraphMode" component={OverviewGraphMode} />
                        <Route path="/SankMode" component={SankMode} />
                        <Route path="/DynamicDiscoveryMode/:type/:args" component={DynamicDiscoveryMode} />
                        <Route path="/FieldDistributionMode" component={FieldDistributionMode} />
                        <Route path="/KeywordsRecommenderPageMode" component={KeywordsRecommenderPageMode} />
                        <Route path="/ContourGrapgPageMode" component={ContourGrapgPageMode} />
                        <Route path="/Sankver2MOD" component={Sankver2MOD} />
                    </Router>
                </Container>
            </main>
            <input
                type="file"
                id="btn_file_hidden"
                style={{ display: "none" }}
                onChange={fileUploaded}
                accept=".json"
            />
        </div>
    );
}

export default App;
