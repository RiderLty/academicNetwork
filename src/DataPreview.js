import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        width: 800,
        margin: "0 auto",
        flexWrap: 'wrap',
        '& > *': {
            margin: theme.spacing(0.5),
        },
    },
}));

export default function DataPreview(props) {
    const classes = useStyles();

    const Attributes = [
        "Conference",
        "Year",
        "Title",
        "DOI",
        "Link",
        "FirstPage",
        "LastPage",
        "PaperType",
        "Abstract",
        "AuthorNames-Deduped",
        "AuthorNames",
        "AuthorAffiliation",
        "InternalReferences",
        "AuthorKeywords",
        "AminerCitationCount_02-2019",
        "XPloreCitationCount_02-2019",
        "PubsCited",
        "Award",
    ]



    const [showAttributes, setShowAttributes] = useState(["Title", "AuthorNames-Deduped", "Year", "DOI", "Link", "PubsCited"])

    const  handleDelete =(args) => {
        setShowAttributes(showAttributes.filter( attr =>  attr!== args ))
    }
    const handelAdd = (args) =>{
        setShowAttributes([...showAttributes,args])
    }

    const [paperData,setPaperData] = useState([])
    useEffect(()=>{
        setPaperData(props.paperData)
    },[props.paperData]  )

    return (
        <div>
            <div className={classes.root}>
                {
                    Attributes.map(
                        row => {
                            if (showAttributes.indexOf(row) !== -1) {
                                return (
                                    <Chip
                                        label={row}
                                        key={row}
                                        onDelete={() => {handleDelete(row)}}
                                        variant="outlined"
                                        clickable
                                        color="secondary"
                                        onClick={() => {handleDelete(row)}}
                                    />
                                )

                            } else {
                                return (
                                    <Chip
                                        label={row}
                                        key={row}
                                        variant="outlined"
                                        clickable 
                                        color="primary"
                                        onClick={()=>{handelAdd(row)}}
                                        onDelete={() => {handelAdd(row)}}
                                        deleteIcon={<AddIcon />}
                                    />
                                )
                            }
                        }

                    )
                }
            </div>
            <TableContainer component={Paper} style={{maxHeight:680}} >

                <Table stickyHeader aria-label="sticky table">
                    <TableHead    >
                        <TableRow>
                            {
                                showAttributes.map(
                                    row => (<TableCell key={row}>{row}</TableCell>)
                                )
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paperData.map((row) => (
                            <TableRow key={row.Title}>
                                {
                                    showAttributes.map(attr => (<TableCell key={attr + "_" + row.Title} >{row[attr]}</TableCell>))
                                }
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}