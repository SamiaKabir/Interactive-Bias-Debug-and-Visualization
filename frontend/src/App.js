import React, { useEffect, useState } from 'react';
import './App.css';
import { CssBaseline, Grid, AppBar, Box, Typography, Toolbar, Paper, Container, Button, IconButton, InputBase, Divider, Card } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import AddIcon from '@mui/icons-material/Add';
import customStyles from './style';
import RenderTopicCard from './TopicCard';
import RenderInstanceTable from './InstanceTable';
import RenderBiasCard from './BiasCard';
import axios from 'axios';
import ChordChart from './views/ChordChart';
import * as d3 from 'd3';




function App() {

  // declare style variable
  const cssStyles= customStyles();

  // const [currentTime, setCurrentTime] = useState(0);
  // useEffect(() => {
  //   fetch('/time').then(res => res.json()).then(data => {
  //     setCurrentTime(data.time);
  //   });
  // }, []);


  // for expanding the bias editor
  const [size, setClicked] = useState([2.5,4.0,5.0,0.5]);
  const [expandFlag, setExpand]= useState(true);
  const handleExpand = () => {
    let newSize=[2.0,3.5,4.0,2.5];
    console.log("clicked");
    setClicked(newSize);
    setExpand(false);
  };

  // for collapsing the bias editor
  const handleCollapse = () => {
    let newSize=[2.5,4.0,5.0,0.5];
    console.log("clicked");
    setClicked(newSize);
    setExpand(true);
  };

  //bias editor conditional view on expand
  const ExpandBiasEditor= React.memo((props)=> {
    // getBiases();
    // if(isExpand!=props.isExpand){
    const [isExpand,setIsExpand]=useState(props.isExpand)
    if (isExpand) {
      return (
      <>
         <Button variant="text" onClick={handleExpand} style={{backgroundColor:'#7a7d7d',width:'100%'}}>
             <ArrowBackIosNewIcon style={{ marginTop: '0.5vh', marginLeft: '0.6vw',marginBottom: '0.5vh', color: 'white' }} />
         </Button>
         <div className={cssStyles.biasEditorTitle}>
            <Typography variant="body1" align="center" sx={{fontSize:'18px'}}>
              Bias Editor
            </Typography>
         </div>
      </>
      );
    }
    else{
      return (
        <>
           <Box sx={{ flexGrow: 1 }}>
              <AppBar position="static" style={{backgroundColor: '#7a7d7d'}}>
                <Toolbar variant="dense">
                  <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={handleCollapse}>
                    <ArrowForwardIosIcon style={{ marginTop: '1vh', marginLeft: '0.6vw', color: 'white' }} />
                  </IconButton>
                  <Typography variant="h6" color="inherit" component="div" style={{marginLeft: '20%',fontSize:'1.20rem'}}>
                    Bias Editor
                  </Typography>
                </Toolbar>
              </AppBar>
             <RenderBiasCard 
             bias_types={bias_types_original} 
             bias_glossary={bias_glossary_original} 
             bias_types_send={bias_types} 
             bias_glossary_send={bias_glossary} 
             enableDisable= {enableDisable}
             reRender={isExpand}
             receiveBiasUpdate={receiveBiasUpdate}
             biasUpdate={handleBiasUpdate}
             />
           </Box>
        </>
        );
    }
  // }
  });

  // select model
  const [model, setModel]= useState(1);
  const handleModelSelection = e => {
    // send selected model to backend
    fetch('/selectmodel', {
      // Declare what type of data we're sending
      headers: {
        'Content-Type': 'application/json'
      },
      // Specify the method
      method: 'POST',
      // A JSON payload
      body: JSON.stringify(e.target.value)
      }).then(function (response) {
      return response.text();
      }).then(function (text) {
   });

    setModel(e.target.value);
  };


  // Add new topic card
  const [topicTitle, setTopicTitle]= useState("");
  const handleTopicInput = e => {
    // console.log(e.target.value);
    setTopicTitle(e.target.value);
  };

  const [addNewCard, setaddNewCard]= useState(0);
  const [topics, setTopics]= useState(["Profession"]);

  const handleAddTopicCard= () => {
    console.log(topicTitle);
    if(!topics.includes(topicTitle) && topicTitle!=""){
      topics.push(topicTitle);
      let newSize=topics.length;
      setTopics(topics);
      setaddNewCard(newSize);
    }
    console.log(topics);

  };

  // get the matching news title isnatnces from backend
  const [All_instances, setAll_instances]=useState([]);
   // get the matching news contents from backend
  const [All_instance_contents, setAll_instance_contents]=useState([]);

  const getInstances = async (index) => {
      await fetch('/getinstances?param1='+index).then(res => res.json()).then(data => {
          // console.log(data.instances);
          setAll_instances(data.instances)
          setAll_instance_contents(data.contents)
      }); 
  }

  // get bias and max bias dictionary from backend
  const [All_biases, set_allBiases]=useState([]);
  // const [max_biases, set_maxBiases]=useState([]);
  const getBiasDicts = async() => {
    await fetch('/getbiases').then(res => res.json()).then(data => {
      set_allBiases(data);
      // console.log(data.max_biases)
      // set_maxBiases(data.max_biases)
    }); 
  }
  

  // state variable to pass the filter terms for instance table from the chord chart
  const [Filter_instances, setFilter_instances]=useState([]);

  const handleFilterChange = (updatedFilter) => {
    console.log(updatedFilter)
    setFilter_instances(updatedFilter);
    setInstanceData(updatedFilter)
  };

  


  // Read in Bias types
  const [bias_types,setBias_types]=useState([]);
  const [bias_types_original, setbiasTypesOriginal]=useState([]);

  const [enableDisable, setEnableDisable]= useState([]);
  useEffect(() => {
    d3.json("/bias_types").then((d) => {
      setBias_types(d);
      let bias_types_deep_copy = JSON.parse(JSON.stringify(d));
      setbiasTypesOriginal(bias_types_deep_copy)
          // set the initial value of the state variable
      let all_subgroups=[]
      bias_types_deep_copy.map((e)=>{
          all_subgroups.push(true);
      });
      setEnableDisable(all_subgroups);
    });
    return () => undefined;
  }, []);
  // console.log(bias_types)

  // Read in Bias Glossary
  const [bias_glossary,setBias_glossary]=useState([]);
  const [bias_glossary_original,setBias_glossary_original]=useState([]);
  useEffect(() => {
    d3.json("/bias_glossary").then((d) => {
      setBias_glossary(d);
      let bias_glossary_deep_copy = JSON.parse(JSON.stringify(d));
      setBias_glossary_original(bias_glossary_deep_copy)

    });
    return () => undefined;
  }, []);

  // console.log(bias_glossary)




// reRender the chart and instance view
  const [chartData,setChartData]=useState(null);
  const [instanceData,setInstanceData]=useState(null);
  const [instanceIndex,setInstanceIndex]=useState(0);
  const [hightlighColor,setHightlighColor]=useState("#000");
  
  const handleChartChange = (updatedChart) => {
    console.log(updatedChart)
    setChartData(updatedChart);
    setInstanceData(updatedChart.data);
    setInstanceIndex(updatedChart.index)
    setHightlighColor(updatedChart.color)
    getInstances(updatedChart.index);
    getBiasDicts();
  };

// function to send the updated bias data back to app.py
  const sendNewBiasData=(updatedBiasData)=>{
        // console.log(actualKeyWords);
        fetch('/biasupdates', {
          // Declare what type of data we're sending
          headers: {
            'Content-Type': 'application/json'
          },
          // Specify the method
          method: 'POST',
          // A JSON payload
          body: JSON.stringify(updatedBiasData)
          }).then(function (response) {
          return response.text();
          }).then(function (text) {
       });
  }
// Receive changed bias data , Rerender chart based on bias update
const handleBiasUpdate= (updatedBiasData)=>{
  console.log(updatedBiasData);
  setBias_types(updatedBiasData.biasTypes);
  setBias_glossary(updatedBiasData.biasGlossary);
  setBias_glossary_original(updatedBiasData.biasGlossaryOriginal);
  setbiasTypesOriginal(updatedBiasData.biasTypesOriginal);
  setEnableDisable(updatedBiasData.enableBias)
  sendNewBiasData(updatedBiasData);
  // setTimeout(() => {  getBiasDicts(); }, 2000);
  getBiasDicts();
} 

// Receive changed bias data 
const receiveBiasUpdate= (updatedBiasData)=>{
  console.log(updatedBiasData);
  setBias_types(updatedBiasData.biasTypes);
  setBias_glossary(updatedBiasData.biasGlossary);
  setEnableDisable(updatedBiasData.enableBias)
  sendNewBiasData(updatedBiasData);
  // setTimeout(() => {  getBiasDicts(); }, 2000);
  getBiasDicts();
} 

// instrumenting the app
const instrumenting= (e, panel) => {
  console.log(panel);
  fetch('/logclick', {
    // Declare what type of data we're sending
    headers: {
      'Content-Type': 'application/json'
    },
    // Specify the method
    method: 'POST',
    // A JSON payload
    body: JSON.stringify(panel)
    }).then(function (response) {
    return response.text();
    }).then(function (text) {
 });

}




  // Main Body Grid layout
  return (
    <>
    <CssBaseline />
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{backgroundColor: '#e6e6e6',borderBottom:'10px',borderBottomColor:'black'}}>
        <Toolbar>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{ flexGrow: 1, color:'black',display: { xs: 'none', sm: 'block' } }}
          >
            Interactive Bias Debugging of Word Embeddings and Text Corpora 
          </Typography>

          <Box sx={{ minWidth: 200}}>
          <FormControl fullWidth >
            <InputLabel id="demo-simple-select-label" style={{}} >Select Model</InputLabel>
            <Select 
              sx={{height: 40}}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={model}
              label="Select Model"
              onChange={handleModelSelection}
            >
              <MenuItem value={1}>Word2Vec</MenuItem>
              <MenuItem value={2}>GloVe</MenuItem>
              <MenuItem value={3}>BERT</MenuItem>
            </Select>
          </FormControl>
        </Box>
        </Toolbar>
 
      </AppBar>
    </Box>

    <Grid container spacing={0.8}>
          {/* topic panel */}
          <Grid item  md={size[0]} onClick={(e)=>{instrumenting(e,1)}}>  
            <Paper  className={cssStyles.leftRightPanel} variant="outlined" square >
              <Paper component="form" sx={{ p: '1px 1px', display: 'flex', alignItems: 'center',margin: '2px 2px 4px 1px',backgroundColor:'#EEEEEE'}}>
                Topic Name:
                <InputBase sx={{ ml: 1, flex: 1, backgroundColor:'white'}} placeholder=" Add a New Topic Here" inputProps={{ 'aria-label': 'add new topic' }} 
                onChange={handleTopicInput} onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}/>
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                <IconButton  sx={{ p: '10px' }} aria-label="add" onClick={handleAddTopicCard}>
                    <AddIcon />
                </IconButton>
              </Paper>
              <RenderTopicCard topics={topics} isChartChange={handleChartChange}/>
            </Paper>
          </Grid>

          {/*  intsance panel */}
          <Grid item  md={size[1]} onClick={(e)=>{instrumenting(e,2)}}>
            <Paper variant="outlined" square  className={cssStyles.middlePanels}>
              <RenderInstanceTable keyWords={instanceData} index={instanceIndex} All_instances={All_instances} 
              All_contents={All_instance_contents} H_color={hightlighColor} 
              max_biases={All_biases.max_biases} glossary={bias_glossary}
              filter_keywords={Filter_instances} glossary_original={bias_glossary_original} />
            </Paper>
          </Grid>

         {/* Bias chart panel */}
          <Grid item  md={size[2]} onClick={(e)=>{instrumenting(e,3)}}>
            <Paper variant="outlined" square className={cssStyles.middlePanels2}>
              <Paper variant="outlined" className={cssStyles.chartPanel}>
                 <div id="chordChart" style={{height:'100%'}}>
                      <ChordChart data={chartData} bias_types={bias_types} bias_dictionary={All_biases.biases} max_bias_scores={All_biases.max_biases}
                      onfilterUpdate={handleFilterChange}/>
                 </div>
              </Paper> 
              {/* <Paper variant="outlined" className={cssStyles.barPanel}/> */}
            </Paper>
          </Grid>
          {/* Bias Editor panel */}
          <Grid item  md={size[3]} onClick={(e)=>{instrumenting(e,4)}}>
            <Paper className={cssStyles.leftRightPanel} variant="outlined" square>
              <ExpandBiasEditor isExpand={expandFlag}></ExpandBiasEditor>
            </Paper>
          </Grid>
    </Grid>
    
    </>
  );
}

export default App;
