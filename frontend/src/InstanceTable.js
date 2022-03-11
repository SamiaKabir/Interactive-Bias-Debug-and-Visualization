import React, { useEffect, useState } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import { CssBaseline, Paper, Box, Container, Button, IconButton,TextField,Typography,Popper} from '@mui/material';
import { DataGrid, GridToolbar,  GridToolbarContainer,GridToolbarColumnsButton, GridToolbarFilterButton,GridToolbarExport,GridToolbarDensitySelector } from '@mui/x-data-grid';
import customStyles from './style';


function RenderInstanceTable(props) {
    const keyWords=props.keyWords;
    const index= props.index;
    const All_instances=props.All_instances;


    function createData(id, instance) {
        return { id: id,
                instance: instance };
    }

    // Generate data to be entered in the instance table

    const columns=[
        { field: 'id', headerName: 'id', width: '90' },
        { field: 'instance', headerName: 'Instance', width: '400',
          renderCell: renderCellExpand },
    ]; 
      
    const rows = [];
    var count=1;

    
    console.log(All_instances.at(index))
    console.log(index)
    
    if(All_instances){
        if(All_instances.length>index){
            All_instances.at(index).map((sentences)=>{
                rows.push(createData(count,sentences));
                count++;     
            })
        }
    }

    // generate custom toolbar for the data grid
    function CustomToolbar() {
        return (
          <GridToolbarContainer 
          style={{borderBottom:'1px solid',borderColor:'#a1969654', backgroundColor:'black'}}
          >
            <GridToolbarColumnsButton style={{color:'white',fontSize:'0.8em',paddingRight:'10px'}}/>
            <GridToolbarFilterButton style={{color:'white',fontSize:'0.8em',paddingRight:'10px'}}/>
            <GridToolbarDensitySelector style={{color:'white',fontSize:'0.8em',paddingRight:'10px'}} />
          </GridToolbarContainer>
        );
      }

    //expand on hover for large sentence
    function isOverflown(element) {
        return (
          element.scrollHeight > element.clientHeight ||
          element.scrollWidth > element.clientWidth
        );
      }
      
    const GridCellExpand = React.memo(function GridCellExpand(props) {
        const { width, value } = props;
        const wrapper = React.useRef(null);
        const cellDiv = React.useRef(null);
        const cellValue = React.useRef(null);
        const [anchorEl, setAnchorEl] = React.useState(null);
        const [showFullCell, setShowFullCell] = React.useState(false);
        const [showPopper, setShowPopper] = React.useState(false);
      
        const handleMouseEnter = () => {
          const isCurrentlyOverflown = isOverflown(cellValue.current);
          setShowPopper(isCurrentlyOverflown);
          setAnchorEl(cellDiv.current);
          setShowFullCell(true);
        };
      
        const handleMouseLeave = () => {
          setShowFullCell(false);
        };
      
        React.useEffect(() => {
          if (!showFullCell) {
            return undefined;
          }
      
          function handleKeyDown(nativeEvent) {
            // IE11, Edge (prior to using Bink?) use 'Esc'
            if (nativeEvent.key === 'Escape' || nativeEvent.key === 'Esc') {
              setShowFullCell(false);
            }
          }
      
          document.addEventListener('keydown', handleKeyDown);
      
          return () => {
            document.removeEventListener('keydown', handleKeyDown);
          };
        }, [setShowFullCell, showFullCell]);
      
        return (
          <Box
            ref={wrapper}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
              alignItems: 'center',
              lineHeight: '24px',
              width: 1,
              height: 1,
              position: 'relative',
              display: 'flex',
            }}
          >
            <Box
              ref={cellDiv}
              sx={{
                height: 1,
                width,
                display: 'block',
                position: 'absolute',
                top: 0,
              }}
            />
            <Box
              ref={cellValue}
              sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {value}
            </Box>
            {showPopper && (
              <Popper
                open={showFullCell && anchorEl !== null}
                anchorEl={anchorEl}
                style={{ width, offset: -17 }}
              >
                <Paper
                  elevation={1}
                  style={{ minHeight: wrapper.current.offsetHeight - 3 }}
                >
                  <Typography variant="body2" style={{ padding: 8 ,backgroundColor:'#e9f6fb' }}>
                    {value}
                  </Typography>
                </Paper>
              </Popper>
            )}
          </Box>
        );
    });
      
    GridCellExpand.propTypes = {
        value: PropTypes.string.isRequired,
        width: PropTypes.number.isRequired,
    };
      
    function renderCellExpand(params) {
        return (
          <GridCellExpand value={params.value || ''} width={params.colDef.computedWidth} />
        );
    }

    renderCellExpand.propTypes = {
        /**
         * The column of the row that the current cell belongs to.
         */
        colDef: PropTypes.object.isRequired,
        /**
         * The cell value, but if the column has valueGetter, use getValue.
         */
        value: PropTypes.string.isRequired,
    };
      

      


    // Final rendering of the table
    if(keyWords){
        return (
            <DataGrid
            rows={rows}
            columns={columns}
            pageSize={15}
            rowsPerPageOptions={[15]}
            components={{ Toolbar: CustomToolbar }}
            sx={{
                // borderColor:'black',
               '& .MuiDataGrid-virtualScroller':
               {
                 backgroundColor:'white',
               },
               '& .MuiDataGrid-footerContainer':{
                   borderColor:'#a1969670'
               },
               '& .MuiDataGrid-columnHeaders':{
                borderColor:'#a1969670'
               },
            
            }}
          />
        );
    }
    else 
        return <></>;
}


export default RenderInstanceTable;