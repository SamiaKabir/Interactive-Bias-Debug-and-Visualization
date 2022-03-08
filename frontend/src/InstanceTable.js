import React, { useEffect, useState } from 'react';
import './App.css';
import { CssBaseline, Paper, Container, Button, IconButton,TextField,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,TableFooter,TablePagination} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import customStyles from './style';


function RenderInstanceTable(props) {
    const keyWords=props.keyWords;


    function createData(id, instance) {
        return { id, instance };
    }

    const columns=[
        { field: 'id', headerName: 'id', width: '90' },
        { field: 'instance', headerName: 'Instance', width: '250' },
    ];
    


      
    const rows = [];
    var count=1;
    if(keyWords){
        keyWords.map((words) => {
            rows.push(createData(count,words));
            count++;
        });
    }


    if(keyWords){
        return (
            // <TableContainer sx={{maxWidth:'100%'}} component={Paper}>
            // <Table  aria-label="simple table">
            //     <TableHead>
            //     <TableRow>
            //         <TableCell>Index</TableCell>
            //         <TableCell align="right">Instance</TableCell>
            //     </TableRow>
            //     </TableHead>
            //     <TableBody>
            //     {rows.map((row) => (
            //         <TableRow
            //         key={row.index}
            //         sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            //         >
            //         <TableCell component="th" scope="row">
            //             {row.index}
            //         </TableCell>
            //         <TableCell align="right">{row.instance}</TableCell>
            //         </TableRow>
            //     ))}
            //     </TableBody>
            // </Table>
            // </TableContainer>
            // <div>
             <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            // checkboxSelection
          />

            // </div>

        );
    }
    else 
        return <></>;
}


export default RenderInstanceTable;