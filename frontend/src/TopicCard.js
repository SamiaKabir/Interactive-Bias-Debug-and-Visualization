import React, { useEffect, useState } from 'react';
import './App.css';
import { CssBaseline, Grid, AppBar, Box, Typography, Toolbar, Paper, Container, Button, IconButton, InputBase, Divider, Card, CardContent, CardHeader,CardActions,TextField,Stack,Chip,FormControl} from '@mui/material';
// import AddIcon from '@mui/icons-material/Add';
import customStyles from './style';
import { ColorPicker, createColor, ColorButton } from "mui-color";
import EditIcon from '@mui/icons-material/Edit';
// import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import AddchartIcon from '@mui/icons-material/Addchart';


function RenderTopicCard(props) {
    const topics= props.topics;
    const onisChartChange = props.isChartChange;
    const cssStyles_imported= customStyles();
    
    // Use this to force rendering from child components/functions
    const forceUpdate = React.useReducer(bool => !bool)[1];

    // chord chart rendering flag
    const[isChart,setisChart]=useState(0);


    let allColor=[];
    topics.map(element => {
      allColor.push("#000");
    });

    const [color, setColor] = useState(createColor(allColor));
    const handleColorChange = (e,i) => {
      color[i]=e.target.value;
      setColor(color);
    };


    // handle reading input for seedwords
    const [keyWord, setkeyWord]= useState("");
    const handleKeyWordInput = e => {
      // console.log(e.target.value);
      setkeyWord(e.target.value);
    };
    
    const [keyWords,setKeyWords]= useState([]);
    const [actualKeyWords,setActualKeyWords]= useState([]);

    // console.log(keyWords);

    const handleKeySubmit = (e,indx) => {
      e.stopPropagation();
      if(e.key == 'Enter'){

       if(keyWords.length<indx+1){
        let newArray=[];
        // newArray.push(keyWord);
        keyWords.push(newArray);
        e.stopPropagation();
        actualKeyWords.push(newArray);
        // setActualKeyWords(actualKeyWords);
        // setKeyWords(keyWords);
        // forceUpdate();
       }
   
        if((!keyWords[indx].includes(keyWord) && keyWord!="")){
          // console.log("here")
          keyWords[indx].push(keyWord);
          setKeyWords(keyWords);
          // forceUpdate();
        }

        if((!actualKeyWords[indx].includes(keyWord) && keyWord!="")){
          // console.log("here2")
          actualKeyWords[indx].push(keyWord);
          setActualKeyWords(actualKeyWords);
          // forceUpdate();
        }
        forceUpdate();

      }
      // console.log(keyWords)
      // console.log(actualKeyWords)
    };

    //delete keywords onclick
    const handleDelete = (e,indx,indx2) => {
      e.stopPropagation();
      keyWords[indx2].splice(indx,1);
      setKeyWords(keyWords);
      actualKeyWords[indx2].splice(indx,1);
      setActualKeyWords(actualKeyWords);
      forceUpdate();
    };

    // send seedwords to server and read suggested words from server
    const handleKeyWordTransfer=(e,all_topics,KeyWords,indx)=>{
      var send_data_copy;
      send_data_copy=actualKeyWords


      // console.log(actualKeyWords);
      fetch('/topics', {
        // Declare what type of data we're sending
        headers: {
          'Content-Type': 'application/json'
        },
        // Specify the method
        method: 'POST',
        // A JSON payload
        body: JSON.stringify({
            "topics": all_topics,
            "keyWords": send_data_copy
        })
        }).then(function (response) {
        return response.text();
        }).then(function (text) {
        });
    
        var delayInMilliseconds = 2000; //2 second
    
        // setTimeout(function() {
          const getSuggestions = async () => {
          await fetch('/gettopics').then(res => res.json()).then(data => {
            console.log(data.words);
            console.log(data.repWords);

            for (let j = 0; j < data.repWords[indx].length; j++) {
              if(!keyWords[indx].includes(data.repWords[indx][j])){
                keyWords[indx].push(data.repWords[indx][j]);
              }
            }
            setKeyWords(keyWords);
            forceUpdate();
            for (let j = 0; j < data.words[indx].length; j++) {
              if(!actualKeyWords[indx].includes(data.words[indx][j])){
                actualKeyWords[indx].push(data.words[indx][j]);
              }
            }
            
            setActualKeyWords(actualKeyWords);
            forceUpdate();
            console.log(actualKeyWords)
            console.log(keyWords)
          }
          ); }
        // }, delayInMilliseconds);
        getSuggestions();
      }

      // set the keywords to current version if suggestion is not asked
      const handlePostKeyWordTransfer=(e,indx)=>{
        var send_data_copy=actualKeyWords

        fetch('/posttopics', {
          // Declare what type of data we're sending
          headers: {
            'Content-Type': 'application/json'
          },
          // Specify the method
          method: 'POST',
          // A JSON payload
          body: JSON.stringify({
              "keyWords": send_data_copy
          })
          }).then(function (response) {
          return response.text();
          }).then(function (text) {
          });

      };



      // handle new chart render
      const handleChartRender=(e,index) =>{
        console.log(actualKeyWords)
        console.log(keyWords)
        handlePostKeyWordTransfer(e,index);
        const updatedChart={
          'index':index,
          'data': actualKeyWords[index],
          'color':color[index]
        }
        setisChart(updatedChart);
        onisChartChange(updatedChart);
      }

    


    if(topics.length>0){
        return topics.map((element) => 
            <>
            <Card className={cssStyles_imported.topicCardStyle}>
            
            <CardHeader 
            title=
            {
            <div style={{position:'relative',fontSize:'1.1rem'}}>
              Topic: {element} 
              {/* <IconButton edge="start" color="inherit" size="small">
                  <EditIcon style={{color: 'darkgrey', fontSize:'1.0rem'}} />
              </IconButton> */}
              {/* <input className={cssStyles_imported.colorPicker} type="color"  value={color[topics.indexOf(element)]}
              onChange={(e) => {
                 handleColorChange(e,topics.indexOf(element));
              }}/> */}
            </div>} 
             style={{padding: '5px', paddingLeft:'16px',paddingTop:'8px'}}/>
            <Divider variant="middle" />

            <CardContent>
              {/* Keyword input prompt */}
              <div style={{alignItems:'center'}}>
                <TextField
                  size="small"
                  placeholder='Add seed word'
                  style={{
                     width:'100%',  
                    '&:active': {
                     backgroundColor:"#e6e6e6",
                     border: "black",
                     },
                  }}
                  label="Press Enter(⏎)to add seed word"
                  onChange={handleKeyWordInput}
                  onKeyDown={(e)=>{handleKeySubmit(e,topics.indexOf(element))}}
                />
              
              </div>

              <CardActions style={{width:"100%", paddingLeft:'0px',paddingRight:'0px'}}>
              <div style={{position:'relative',width:'100%'}}>
                <Button variant="contained" size="small" style={{float:'right',fontSize:'0.8em'}} onClick={(e)=>{handleKeyWordTransfer(e,topics,keyWords,topics.indexOf(element))}}>
                  Suggest similar words
                </Button>
              </div>
              </CardActions>

              {/* List of keywords in each topic card */}
              <Paper variant='outlined' sx={{ p: '5px', display: 'block', alignItems: 'center',margin: '2px 2px 2px 1px',height:'15vh', maxHeight:'12%',overflowY:'auto'}}>
                  { 
                    (keyWords.length>=topics.indexOf(element)+1)?
                    
                      <>
                      {
                        (keyWords[topics.indexOf(element)].length>0)? 
                        keyWords[topics.indexOf(element)].map((keys)=> <Chip label={keys} 
                        sx={{
                          "& .MuiChip-label": {
                            fontSize:'1.1em'
                          }
                        }}
                        variant="outlined" 
                        className={cssStyles_imported.chipStyle}
                          onDelete= {(e) => {handleDelete(e,keyWords[topics.indexOf(element)].indexOf(keys),topics.indexOf(element));}}/>)
                        :<></>
                      }
                      </>
                    : <></>
                  }
                  
              </Paper>

            </CardContent>
            <Divider variant="middle" />
            <CardActions style={{width:"100%", paddingLeft:'0px',paddingRight:'16px'}}>
              <div style={{position:'relative',width:'100%'}}>
                <Button variant="contained" color="primary" className={cssStyles_imported.topicFooter} 
                // startIcon={<AddchartIcon className={cssStyles_imported.chartViz}/> }
                onClick={(e)=>{handleChartRender(e,topics.indexOf(element))}}
                >
                      CHECK FOR BIAS
                </Button>
              </div>

            </CardActions>
          </Card>
          </>
          );

        }
        else {
        return ( <> </>);
        }
    
      
}

export default RenderTopicCard;

