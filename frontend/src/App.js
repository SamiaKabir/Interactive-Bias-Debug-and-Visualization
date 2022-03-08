import React, { useEffect, useState } from 'react';
import './App.css';
import { CssBaseline, Grid, AppBar, Box, Typography, Toolbar, Paper, Container, Button, IconButton, InputBase, Divider, Card } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import customStyles from './style';
import RenderTopicCard from './TopicCard';
import RenderInstanceTable from './InstanceTable';
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
  const [size, setClicked] = useState([2.5,3.5,5.5,0.5]);
  const [expandFlag, setExpand]= useState(true);
  const handleExpand = () => {
    let newSize=[2.0,2.5,5.0,2.5];
    console.log("clicked");
    setClicked(newSize);
    setExpand(false);
  };

  // for collapsing the bias editor
  const handleCollapse = () => {
    let newSize=[2.5,3.5,5.5,0.5];
    console.log("clicked");
    setClicked(newSize);
    setExpand(true);
  };

  //bias editor conditional view on expand
  function ExpandBiasEditor(props) {
    const isExpand = props.isExpand;
    if (isExpand) {
      return (
      <>
         <Button variant="text" onClick={handleExpand}>
             <ArrowBackIosNewIcon style={{ marginTop: '1vh', marginLeft: '0.6vw', color: '#ededed' }} />
         </Button>
         <div className={cssStyles.biasEditorTitle}>
            <Typography variant="body1" align="center">
              Bias Editor
            </Typography>
         </div>
      </>
      );
    }
    return (
      <>
         <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" style={{backgroundColor: '#3381986e'}}>
              <Toolbar variant="dense">
                <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={handleCollapse}>
                  <ArrowForwardIosIcon style={{ marginTop: '1vh', marginLeft: '0.6vw', color: '#ededed' }} />
                </IconButton>
                <Typography variant="h6" color="inherit" component="div" style={{marginLeft: '20%'}}>
                  Bias Editor
                </Typography>
              </Toolbar>
            </AppBar>
         </Box>
      </>
      );
  }

  // Add new topic card
  const [topicTitle, setTopicTitle]= useState("");
  const handleTopicInput = e => {
    console.log(e.target.value);
    setTopicTitle(e.target.value);
  };

  const [addNewCard, setaddNewCard]= useState(0);
  const [topics, setTopics]= useState([]);

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

// reRender the chart and instance view
  const [chartData,setChartData]=useState(null);
  const [instanceData,setInstanceData]=useState(null);
  
  const handleChartChange = (updatedChart) => {
    console.log("updatedisChart: ", updatedChart);
    setChartData(updatedChart);
    setInstanceData(updatedChart.data);
  };



  // Main Body Grid layout
  return (
    <>
    <CssBaseline />
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{backgroundColor: '#348199'}}>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Interactive Bias Debugging of Language Model and Text Corpora 
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>

    <Grid container spacing={0.8}>
          {/* topic panel */}
          <Grid item  md={size[0]}>  
            <Paper  className={cssStyles.leftRightPanel} variant="outlined" square >
              <Paper component="form" sx={{ p: '1px 1px', display: 'flex', alignItems: 'center',margin: '2px 2px 4px 1px',backgroundColor:'#EEEEEE'}}>
                <InputBase sx={{ ml: 1, flex: 1, backgroundColor:'white'}} placeholder="Add New Topic" inputProps={{ 'aria-label': 'add new topic' }} 
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
          <Grid item  md={size[1]}>
            <Paper variant="outlined" square  className={cssStyles.middlePanels}>
              <RenderInstanceTable keyWords={instanceData}/>
            </Paper>
          </Grid>

         {/* Bias chart panel */}
          <Grid item  md={size[2]}>
            <Paper variant="outlined" square className={cssStyles.middlePanels2}>
              <Paper variant="outlined" className={cssStyles.chartPanel}>
                 <div id="chordChart" style={{height:'100%'}}>
                      <ChordChart data={chartData}/>
                 </div>
              </Paper> 
              <Paper variant="outlined" className={cssStyles.barPanel}/>
            </Paper>
          </Grid>
          {/* Bias Editor panel */}
          <Grid item  md={size[3]}>
            <Paper className={cssStyles.leftRightPanel} variant="outlined" square>
              <ExpandBiasEditor isExpand={expandFlag} />
            </Paper>
          </Grid>
    </Grid>
    
    </>
  );
}

export default App;
