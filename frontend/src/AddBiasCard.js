import React, { useEffect, useState } from 'react';
import './App.css';
import { CssBaseline, Grid, AppBar, Box, Typography, Toolbar, Paper, Container, Button, IconButton, InputBase, Divider, Card, CardContent, CardHeader,CardActions,TextField,Stack,Chip,FormControl, InputAdornment,Input} from '@mui/material';
import customStyles from './style';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';
import RestartAltIcon from '@mui/icons-material/RestartAlt';



// The Add new Bias Card
const AddBias= React.memo((props)=>{

    const doupdateandhide= props.updateandhide;
    const cssStyles_imported= customStyles();
    // Use this to force rendering from child components/functions
    const forceUpdate = React.useReducer(bool => !bool)[1];

    // Add bias number of subgroup
    const [numSubgroup,setNumSubGroup]=useState([1]);

    const addMoreSubGroups=(e)=>{
        numSubgroup.push(numSubgroup.length+1);
        setNumSubGroup(numSubgroup);
        forceUpdate();
    };

    // new bias name 
    const [newBiasName,setNewBiasName]=useState("");

    const handleNewBiasChange= (event) => {
        setNewBiasName(event.target.value);
    };

    // subgroups name inputs
    const [subgroupsName,setSubgroupsName]=useState([""]);

    const handleSubgroupInputChange=(event,item)=>{
        if(subgroupsName.length<item){
            subgroupsName.push("");
        }
        subgroupsName[item-1]=event.target.value;
        setSubgroupsName(subgroupsName);
        forceUpdate();
    };

    // console.log(numSubgroup);
    // console.log(subgroupsName);

    // Representative word input
    const [wordInputs,setwordInputs]=useState([""]);
    const handleWordInputChange=(event,item)=>{
        if(wordInputs.length<item){
            wordInputs.push("");
        }
        wordInputs[item-1]=event.target.value;
        setwordInputs(wordInputs);
        forceUpdate();
    };
    

    const [allWordInputs,setallWordInputs]=useState([[]]);
    const handleWordInputSubmit=(event,item)=>{
        if(event.key=="Enter"){
            if(allWordInputs.length<item){
                allWordInputs.push([]);
            }
            allWordInputs[item-1].push(event.target.value);
            setallWordInputs(allWordInputs);
            wordInputs[item-1]="";
            setwordInputs(wordInputs);
            forceUpdate();
        }
    };

    // console.log(allWordInputs);

    // Delete a word from the representatitve word
    const handleWordDelete= (event,item,indx)=>{
            allWordInputs[item-1].splice(indx,1);
            setallWordInputs(allWordInputs);
            forceUpdate();
    };

    // update and hide the card
    const updateAndHide=(e)=>{

        var empty_list=false

        
        allWordInputs.forEach((lists)=>{
            if(lists.length==0)
                empty_list=true


        })

        if(empty_list || subgroupsName.length<2){
            if(subgroupsName.length<2){
                alert("Please enter at least two subgroups!")
            }
            else if(empty_list){
                alert("Please enter at least one Bias word for each subgroup!")
            }
        }
        
        else{
            const newBias={
                'name':newBiasName,
                'subgroups': subgroupsName,
                'repWords': allWordInputs
            };
        
            doupdateandhide(newBias);
        }
    }

    return (
        <Card className={cssStyles_imported.biasCardStyle}>
            <CardHeader 
               title=
               {
               <div style={{position:'relative',fontSize:'1.0rem'}}>
                   <Input
                       size="small"
                       sx={{fontSize: '0.9em', align:'center',marginLeft:'7px',width:'20vh'}}
                       placeholder=" Add Bias Type"
                       inputProps={{
                        'aria-label': 'Description',
                       }}
                       onChange={handleNewBiasChange}
                   />                    
               </div>} 
                   style={{padding: '5px', paddingLeft:'16px',paddingTop:'8px'}}
           />
           <Divider variant="middle" />
           <CardContent>
               {
                   numSubgroup.map((item) =>
                   <>
                        <Input
                        size="small"
                        sx={{fontSize: '0.9em', align:'center',marginLeft:'7px',width:'10vh'}}
                        placeholder=" Add Subgroup"
                        // value={}
                        inputProps={{
                            'aria-label': {item},

                        }}
                        onChange={(e)=>{handleSubgroupInputChange(e,item)}}
                        /> 


                        {/* list of representative words of the subgroup */}
                        <Paper variant='outlined' sx={{ p: '5px', display: 'block', alignItems: 'center',margin: '4px 2px 10px 2px',height:'9vh', maxHeight:'2%',overflowY:'auto'}}>
                        <>
                            {
                            (allWordInputs.length>=item)?
                            allWordInputs[item-1].map((keys)=> (
                            <Chip label={keys} variant="outlined" className={cssStyles_imported.chipStyle}
                            onDelete= {(e) => {handleWordDelete(e,item,allWordInputs[item-1].indexOf(keys));}}
                            />)) :
                            <></>
                            
                            }
                            <Input
                            size="small"
                            sx={{fontSize: '0.7em', align:'center',marginLeft:'7px',width:'8vh'}}
                            placeholder=" Add word"
                            value={wordInputs[item-1]}
                            // className={classes.input}
                            inputProps={{
                                'aria-label': 'Description',

                            }}
                            onChange={(e)=>{handleWordInputChange(e,item)}}
                            onKeyDown={(e)=>{handleWordInputSubmit(e,item)}}
                            />
                        </>                 
                        </Paper>   

                    </>


                )
               }

              <Button  style={{color: 'darkgrey', fontSize:'0.8em',paddingLeft:'2px'}} startIcon={<AddIcon />}
               onClick={(e)=>{addMoreSubGroups(e)}} 
               >
               Add more subgroups
              </Button>

           </CardContent>
           <Divider variant="middle" />
           <CardActions style={{padding:"0px"}}>
               <div style={{position:'relative',width:'100%'}}>
               <Button varient='contained' className={cssStyles_imported.biasFooter} onClick={(e)=>{updateAndHide(e)}}
                   startIcon={<DoneIcon className={cssStyles_imported.biasViz}/>} color="success">
                       Update
               </Button>
               </div>

           </CardActions>

        </Card>

     );


    });

export default AddBias;


  