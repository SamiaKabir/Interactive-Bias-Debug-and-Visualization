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

    // console.log(keyWords);

    const handleKeySubmit = (e,indx) => {
      if(e.key == 'Enter'){
       console.log(indx);

       if(keyWords.length<indx+1){
        let newArray=[];
        newArray.push(keyWord);
        keyWords.push(newArray);
        setKeyWords(keyWords);
        forceUpdate();

       }
   
        else if((!keyWords[indx].includes(keyWord) && keyWord!="")){
          keyWords[indx].push(keyWord);
          setKeyWords(keyWords);
          forceUpdate();
        }
      }
    };

    //delete keywords onclick
    const handleDelete = (e,indx,indx2) => {
      keyWords[indx2].splice(indx,1);
      setKeyWords(keyWords);
      forceUpdate();
    };

    // send seedwords to server and read suggested words from server
    const handleKeyWordTransfer=(e,all_topics,KeyWords,indx)=>{
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
            "keyWords": KeyWords
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
            // for (let i = 0; i < keyWords.length; i++) {
              for (let j = 0; j < data.words[0].length; j++) {
                keyWords[indx].push(data.words[indx][j]);
              }

            // }
            setKeyWords(keyWords);
            forceUpdate();
          }); }
        // }, delayInMilliseconds);
        getSuggestions();
      }

      // handle new chart render
      const handleChartRender=(e,index) =>{
        const updatedChart={
          'index':index,
          'data': keyWords[index]
        }
        setisChart(updatedChart);
        onisChartChange(updatedChart);
      }

    


    if(topics.length>0){
        return topics.map((element) => 
            <>
            <Card style={{margin:'10px', marginBottom:'15px', borderRadius:'10px'}}>
            
            <CardHeader 
            title=
            {
            <div style={{position:'relative',fontSize:'1.1rem'}}>
              Topic: {element} 
              <IconButton edge="start" color="inherit" size="small">
                  <EditIcon style={{color: 'darkgrey', fontSize:'1.0rem'}} />
              </IconButton>
              <input className={cssStyles_imported.colorPicker} type="color"  value={color[topics.indexOf(element)]} style={{}} 
              onChange={(e) => {
                 handleColorChange(e,topics.indexOf(element));
              }}/>
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
                     border: "black",
                     },
                  }}
                  label="Add seed word"
                  onChange={handleKeyWordInput}
                  onKeyDown={(e)=>{handleKeySubmit(e,topics.indexOf(element))}}
                />
              
              </div>

              <CardActions style={{width:"100%", paddingLeft:'0px'}}>
              <div style={{position:'relative',width:'100%'}}>
                <Button size="small" style={{float:'left',fontSize:'0.7em'}} onClick={(e)=>{handleKeyWordTransfer(e,topics,keyWords,topics.indexOf(element))}}>
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
                        keyWords[topics.indexOf(element)].map((keys)=> <Chip label={keys} variant="outlined" className={cssStyles_imported.chipStyle}
                          onDelete= {(e) => {handleDelete(e,keyWords[topics.indexOf(element)].indexOf(keys),topics.indexOf(element));}}/>)
                        :<></>
                      }
                      </>
                    : <></>
                  }
                  
              </Paper>

            </CardContent>
            <Divider variant="middle" />
            <CardActions style={{padding:"0px"}}>
              <div style={{position:'relative',width:'100%'}}>
                <IconButton style={{ float:'right',margin:'0px'}} onClick={(e)=>{handleChartRender(e,topics.indexOf(element))}} >
                 <AddchartIcon className={cssStyles_imported.chartViz}/>
                </IconButton>
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

