import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
const DataTable = (props) => {// [head1,head1,...]   [{head1:data1,head2:data2,head3:data3},...]
    return (
        <TableContainer component={Paper} style={{ maxHeight: props.maxHeight }} >
            <Table stickyHeader aria-label="sticky table">
                <TableHead    >
                    <TableRow>
                        {
                            props.head.map(
                                row => (<TableCell key={row}>{row}</TableCell>)
                            )
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.data.map((row) => (
                        <TableRow key={row.Title}>
                            {
                                props.head.map(
                                    attr => (
                                        <TableCell key={attr + "_" + row.Title} >
                                            {row[attr]}
                                        </TableCell>
                                    )
                                )
                            }
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default function SankYearTable(props) {
    const [data, setdata] = useState([])
    const drawTable = () => {
        if (props.sankData.length === 0) {
            console.log("sankdata not load")
        } else {
            
            const dataTmp = []
            props.sankData.forEach(authorRec => {
                authorRec.forEach(rec => {
                    if (Number(rec.year) === props.year) {
                        dataTmp.push(
                            {
                                "index": dataTmp.length,
                                "theme": rec.theme,
                                "name": rec.name
                            }
                        )
                    }
                })
            })
            setdata(dataTmp)
        }
    }

    useEffect(drawTable, [props.year, props.sankData])
    return (
        <DataTable
            head={["index", "theme", "name"]}
            data={data}
            maxHeight={470}
        />
    )
}

