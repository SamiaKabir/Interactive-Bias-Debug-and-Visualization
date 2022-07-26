import React, { useEffect, useState } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import { CssBaseline, Paper, Stack, Box, Container, Button, IconButton,TextField,Typography,Popper, Card, CardContent} from '@mui/material';
import { DataGrid, GridToolbar,  GridToolbarContainer,GridToolbarColumnsButton, GridToolbarFilterButton,GridToolbarExport,GridToolbarDensitySelector } from '@mui/x-data-grid';
import customStyles from './style';
import Highlighter from 'react-highlight-exact-words';
import { lightBlue } from '@mui/material/colors';


function RenderInstanceTable(props) {
  const keyWords=props.keyWords;
  const index= props.index;
  const All_instances=props.All_instances;
  const All_contents=props.All_contents;
  const H_color=props.H_color;
  const maximum_biases=props.max_biases;
  const all_glossary= props.glossary;
  const filter_keywords=props.filter_keywords;

  // console.log(keyWords_highlight)


  // const [keyWords,setKeyWords]=useState(props.keyWords);

  // if(keyWords_highlight){
  //   if(filter_keywords && filter_keywords.length>0){
  //     keyWords=filter_keywords
  //   }
  //   else{
  //     keyWords=keyWords_highlight
  //   }
  // }


  // Use this to force rendering from child components/functions
  const forceUpdate = React.useReducer(bool => !bool)[1];

  // state var to rerender the bottom content
  const [currentContent,setCurrentContent]=useState(null);

  function createData(id, instance) {
      return { id: id,
              instance: instance };
  }

  // generate different arrays for diffrent bias types

  var glossary_map= new Map();

  all_glossary.forEach((obj)=>{
    if(glossary_map.has(obj.type)){
      var new_arr= glossary_map.get(obj.type).concat(obj.group);
      glossary_map.set(obj.type,new_arr);
    }
    else{
      glossary_map.set(obj.type,obj.group)
    }
  });

  var glossar_array=[]
  var all_glossary_word=[]
  var all_words= keyWords

  if(glossary_map){
    for (let [key, value] of glossary_map) {
      glossar_array.push(value)
      if(all_glossary_word.length==0){
          all_glossary_word=value;
      }
      else{
        all_glossary_word=all_glossary_word.concat(value);
      }
    }
    if(all_glossary_word && all_words)
      all_words= all_words.concat(all_glossary_word)

  }


  const getHighlightTag = () => ({ children, highlightIndex }) => {
    const backgroundColors = ["green", "red", "blue","#7D3C98","#eb6e60","#B7950B","#ff00ff","#800000","#5c5c8a","#006666","#999966"];

    for(var i=0;i<glossar_array.length;i++){
      if (glossar_array[i].includes(children))
        return (
          <mark
            style={{
              // backgroundColor: "transparent",
              // color: backgroundColors[i],
              // fontWeight: "bold"
              backgroundColor:backgroundColors[i],
              color: 'white'
              
            }}
          >
            {children}
          </mark>
        );

    }
    return (
      <mark style={{ backgroundColor: "#fffd8f" }}>{children}</mark>
    );
  };


    // Generate data to be entered in the instance table

    const columns=[
        { field: 'id', headerName: 'id', width: '90', headerAlign: 'center',
        align: 'center' },
        { field: 'instance', headerName: 'Article Title', width: '500',
          renderCell: renderCellExpand,headerAlign: 'center',
          align: 'center' },
    ]; 
      
    const rows = [];
    var count=1;
    const filtered_instances=[]
    const filtered_contents=[]


    if(All_instances){
      All_instances.forEach((e)=>{
        filtered_instances.push([])
        filtered_contents.push([])
      })
    }

    // console.log(filtered_instances)

    var filter_regex=""
 

    if(filter_keywords){
      if(filter_keywords.length>0){
      for (var i=0;i<filter_keywords.length-1;i++){
          filter_regex=filter_regex+filter_keywords[i];
          filter_regex=filter_regex+"|";
        }
      
      filter_regex=filter_regex+filter_keywords[filter_keywords.length-1];
      }
      
    }

    // filter_regex=filter_regex+"/";
    const final_filter_regex= new RegExp(filter_regex, 'g')
    
    // const [final_filter_regex,setfinal_filter_regex]=useState(final_regex)
    

    console.log(final_filter_regex)
    
    
    // if(str.match( /word1|word2/g )){
    //   var matches = str.match(final_filter_regex);
    //   console.log(matches)
    // }

    
    // console.log(All_instances.at(index))
    // console.log(index)
  

    if(All_instances && All_contents){
      if(All_instances.length>index && All_contents.length>index){
        for(var i=0; i<All_instances.at(index).length;i++){
          var sentences=All_instances.at(index).at(i)
          var contents=All_contents.at(index).at(i)
          if(sentences.match(final_filter_regex)){
            // console.log(filtered_instances)
            filtered_instances.at(index).push(sentences);
            filtered_contents.at(index).push(contents);
          
          }
          else if(contents.match(final_filter_regex)){
            filtered_instances.at(index).push(sentences);
            filtered_contents.at(index).push(contents);
          }
        }
        All_instances.at(index).map((sentences)=>{
          
              
        })
     }
    }

  // Do the filtering based on the keywords received

  // if(All_instances){
  //   if(All_instances.length>index){
  //     All_instances.at(index).map((sentences)=>{
  //           filtered_instances.at(index).push(sentences)
  //     })
  //  }
  // }  
  
    
    if(All_instances && filtered_instances){
        if(filtered_instances.length>index){
          filtered_instances.at(index).map((sentences)=>{
                rows.push(createData(count,sentences));
                count++;     
            })
        }
    }

    // change the current onclick content
    const showTableContent= (e)=>{
      var content_indx=e.id-1;
      // currentContent=All_contents.at(index).at(content_indx);
      setCurrentContent(filtered_contents.at(index).at(content_indx));
    }

    // generate custom toolbar for the data grid
    function CustomToolbar() {
        return (
          <GridToolbarContainer 
          style={{borderBottom:'1px solid',borderColor:'#a1969654', backgroundColor:'#7a7d7d'}}
          >
            <GridToolbarColumnsButton style={{color:'white',fontSize:'0.9em',paddingRight:'10px'}}/>
            <GridToolbarFilterButton style={{color:'white',fontSize:'0.9em',paddingRight:'10px'}}/>
            <GridToolbarDensitySelector style={{color:'white',fontSize:'0.9em',paddingRight:'10px'}} />
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
              {/* {value} */}
              <Highlighter
                searchWords={keyWords}
                autoEscape={true}
                textToHighlight={value}
                // highlightStyle={{backgroundColor: H_color}}
                highlightStyle={{backgroundColor: "#fffd8f"}}
              />
            </Box>
            {showPopper && (
              <Popper
                open={showFullCell && anchorEl !== null}
                anchorEl={anchorEl}
                style={{ width, offset: -17 }}
              >
                <Paper
                  elevation={1}
                  style={{ minHeight: wrapper.current.offsetHeight - 3 ,
                           // border:'1px solid',
                  
                       }}
                >

                  <Typography variant="body2" style={{ padding: 8 ,backgroundColor:'#e9f6fb' }}>
                    {/* {value} */}
                    <Highlighter
                      searchWords={keyWords}
                      autoEscape={true}
                      textToHighlight={value}
                      // highlightStyle={{backgroundColor:H_color}}
                      highlightStyle={{backgroundColor: "#fffd8f"}}
                    />
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
          <>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={14}
              rowsPerPageOptions={[14]}
              headerHeight={40}
              components={{ Toolbar: CustomToolbar, 
                NoRowsOverlay: () => (
                  <Stack height="100%" alignItems="center" justifyContent="center">
                    Searching for Matching Instances ...
                  </Stack>
                ),
              }}
              
              sx={{fontSize:'16px',
                   height:'75%',
                  // borderColor:'black',
                  '& .MuiDataGrid-virtualScroller':
                  {
                      backgroundColor:'white',
                      whiteSpace: 'nowrap',
                      overflowX:'hidden!important'
                  },
                  '& .MuiDataGrid-footerContainer':{
                      borderColor:'#a1969670',
                      minHeight:'40px!important',
                      height:'40px!important'
                  },
                  '& .MuiDataGrid-columnHeaders':{
                      borderColor:'#a1969670',
                      minHeight:'40px!important',
                      maxHeight:'40px!important',
                      lineHeight:'40px!important',
                  },

              
              }}
              onCellClick={(e) => {showTableContent(e)}}
            />
            <Card variant="outlined"  style={{height:'25%',borderColor: 'darkgrey', borderWidth: '1px',overflow:'auto',fontSize:'16px' }}>
               {/* {currentContent} */}

               <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Article Content
                  </Typography>
                  {currentContent?
                                 <Highlighter
                                 highlightTag={getHighlightTag()}
                                 searchWords={all_words}
                                 autoEscape={true}
                                 textToHighlight= {currentContent}
                                 caseSensitive={true}
                               />
                               :
                               <></>
                  }
   
                </CardContent>
            </Card>
          </>

        );
    }
    else 
        return <></>;
}


export default RenderInstanceTable;