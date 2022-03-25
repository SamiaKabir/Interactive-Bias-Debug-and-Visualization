import React, { useEffect, useState } from 'react';
import './App.css';
import { CssBaseline, Grid, AppBar, Box, Typography, Toolbar, Paper, Container, Button, IconButton, InputBase, Divider, Card, CardContent, CardHeader,CardActions,TextField,Stack,Chip,FormControl, InputAdornment,Input} from '@mui/material';
import customStyles from './style';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';
import RestartAltIcon from '@mui/icons-material/RestartAlt';


const RenderBiasCard= React.memo((props) =>{
    // const bias_types= props.bias_types;
    const bias_glossary=props.bias_glossary;
    const cssStyles_imported= customStyles();

    
    const [reRender,setRerender]= useState(props.reRender);


    // create a state variable with the bias_types
    const [bias_types,setBiasTypes]=useState(props.bias_types);

    // console.log(bias_glossary)

    // convert the bias glossary to a javascript map
    var bias_glossary_map_init= new Map();

    // additional helper array for rendering input prompts
    var render_prompts=[];

    if(bias_glossary){
        Object.keys(bias_glossary).map(function(key) {
            bias_glossary_map_init.set(bias_glossary[key].word,bias_glossary[key].group)
            render_prompts.push(bias_glossary[key].word);
        });
    }


    // Use this to force rendering from child components/functions
    const forceUpdate = React.useReducer(bool => !bool)[1];

    // set the initial value of the state variable
    let all_subgroups=[]
    bias_types.map((element)=>{
        all_subgroups.push(false);
    });

    //render subgroups of a clicked bias type
    const [showSubGroup, setShowSubGroup]= useState(all_subgroups);

    const handleSubgroupRender=(e,index) =>{
        showSubGroup[index]=true;
        setShowSubGroup(showSubGroup);
        forceUpdate();
    }
    const hideSubgroupRender=(e,index) =>{
        showSubGroup[index]=false;
        setShowSubGroup(showSubGroup);
        forceUpdate();
    }

    //delete representative onclick
    const [bias_glossary_map, setBias_glossary_map]= useState(bias_glossary_map_init);
    const handleDelete = (e,word,indx) => {
        bias_glossary_map.get(word).splice(indx,1);
        setBias_glossary_map(bias_glossary_map);
        forceUpdate();
    };

    // create initil value for wordInput propmt
    let all_input_propts=[]
    render_prompts.forEach ((element)=> all_input_propts.push("") );

    // handle word input
    const [wordInputValue, setWordInputValue] = React.useState(all_input_propts);

    function handleInputChange(event,index) {
        console.log(index)
        wordInputValue[index]=event.target.value;
        setWordInputValue(wordInputValue);
        forceUpdate();
    }

    function handleKeySubmit(event,word,index){
        if(event.key=="Enter"){
        if(!bias_glossary_map.get(word).includes(wordInputValue[index])){
            bias_glossary_map.get(word).push(wordInputValue[index]);
        }
        wordInputValue[index]="";
        setWordInputValue(wordInputValue);
        forceUpdate();
        }
    }

    // Delete a subgroup onclick
    const handleSubgroupDelete = (e,bias,word,indx) => {
        // delete from subgroup glossary
        bias_glossary_map.delete(word);
        setBias_glossary_map(bias_glossary_map);
        // delete from bias types
        bias_types.map((obj)=>{
            if(obj.type==bias){
                var index2=obj.subgroup.indexOf(word);
                obj.subgroup.splice(index2,1);

            }
        });

        setBiasTypes(bias_types);
        // delete from render prompts
        // render_prompts.splice(indx,1);
        forceUpdate();
    };

    // Delete a bias onclick
    const handleBiasDelete = (e,bias) => {
   
        // delete from subgroup glossary
        bias_types.map((element)=>{
            if(element.type==bias){
                element.subgroup.map((sbgroups)=>{
                    bias_glossary_map.delete(sbgroups);
                    setBias_glossary_map(bias_glossary_map);
                    // delete from render prompts
                    // render_prompts.splice(render_prompts.indexOf(sbgroups),1);
                    });
                }
            });

        // delete from bias types
        var index2= -1;
        bias_types.map((obj)=>{
            if(obj.type==bias){
                index2=bias_types.indexOf(obj);
            }
        });

        if(index2>-1){
            bias_types.splice(index2,1);
            setBiasTypes(bias_types);
        }

 

        // delete from wordinput
        forceUpdate();
    };

  
    // Final Rendering of the cards
    if(bias_types.length>0)
    {
        return (
        <>
            {bias_types.map((element) => 
                <>
                    <Card className={cssStyles_imported.biasCardStyle}>
                    
                    <CardHeader 
                        title=
                        {
                        <div style={{position:'relative',fontSize:'1.0rem'}}>
                            Bias Type: {element.type} 
                            <IconButton edge="start" color="inherit" size="small" 
                            style={{position: 'absolute',right:'30px'}}  onClick={(e)=>{handleSubgroupRender(e,bias_types.indexOf(element))}}>
                                <EditIcon style={{color: 'darkgrey', fontSize:'1.0rem'}} />
                            </IconButton>
                            <IconButton edge="start" color="inherit" size="small" 
                            style={{position: 'absolute',right:'0px'}}
                            onClick= {(e) => {handleBiasDelete(e,element.type);}}
                            >
                                <DeleteIcon style={{color: 'darkgrey', fontSize:'1.0rem'}} />
                            </IconButton>                        
                        </div>} 
                            style={{padding: '5px', paddingLeft:'16px',paddingTop:'8px'}}
                    />
                    <Divider variant="middle" />
                    {(showSubGroup[bias_types.indexOf(element)])?
                    <>
                        <CardContent>
                            {element.subgroup.map((subgroup)=>
                                <div>
                                    {/* name of the subgroup */}
                                    <div style={{fontSize:'0.9em',position:'relative'}}>
                                        {subgroup}:
                                        <IconButton edge="start" color="inherit" size="small" 
                                         style={{position: 'absolute',right:'0px'}}
                                         onClick= {(e) => {handleSubgroupDelete(e,element.type,subgroup,subgroup,render_prompts.indexOf(subgroup));}}
                                         >
                                            <DeleteIcon style={{color: 'darkgrey', fontSize:'1.0rem'}}/>
                                        </IconButton> 
                                    </div>
                                    {/* list of representative words of the subgroup */}
                                    <Paper variant='outlined' sx={{ p: '5px', display: 'block', alignItems: 'center',margin: '4px 2px 10px 2px',height:'9vh', maxHeight:'2%',overflowY:'auto'}}>
                                        {
                                            <>
                                            {
                                                bias_glossary_map.get(subgroup).map((keys)=> (
                                                <Chip label={keys} variant="outlined" className={cssStyles_imported.chipStyle}
                                                onDelete= {(e) => {handleDelete(e,subgroup,bias_glossary_map.get(subgroup).indexOf(keys));}}
                                                />
                                                ))
                                            }
                                            <Input
                                                size="small"
                                                sx={{fontSize: '0.7em', align:'center',marginLeft:'7px',width:'8vh'}}
                                                placeholder=" Add word"
                                                value={wordInputValue[render_prompts.indexOf(subgroup)]}
                                                // className={classes.input}
                                                inputProps={{
                                                    'aria-label': 'Description',

                                                }}
                                                onChange={(e)=>{handleInputChange(e,render_prompts.indexOf(subgroup))}}
                                                onKeyDown={(e)=>{handleKeySubmit(e,subgroup,render_prompts.indexOf(subgroup))}}
                                            />

                                            </>
                                                           
                                        }
                                    </Paper>
                                </div>
                            )}
                        
                        </CardContent>
                        <Divider variant="middle" />
                        <CardActions style={{padding:"0px"}}>
                            <div style={{position:'relative',width:'100%'}}>
                            <Button varient='contained' className={cssStyles_imported.biasFooter} onClick={(e)=>{hideSubgroupRender(e,bias_types.indexOf(element))}}
                                startIcon={<DoneIcon className={cssStyles_imported.biasViz}/>} color="success">
                                    Update
                            </Button>
                            </div>
            
                        </CardActions>
                    </>
                    :
                    <></>
                    }
                    </Card>
                </>
            )}
            <Button  style={{color: 'white', fontSize:'1.0rem',paddingLeft:'20px'}} startIcon={<AddIcon />}>
              ADD NEW BIAS
            </Button>
            <Button  style={{color: 'white', fontSize:'1.0rem',paddingLeft:'20px',position:'absolute',right:'10px'}} startIcon={<RestartAltIcon />}>
              RE-RENDER
            </Button>
        </>
        );
    }
    else
    {
        return ( 
            <div style={{position:'relative'}}>
                <Button  style={{color: 'white', fontSize:'1.0rem',paddingLeft:'20px'}} startIcon={<AddIcon />}>
                    ADD NEW BIAS
                </Button>
                <Button  style={{color: 'white', fontSize:'1.0rem',paddingLeft:'20px',position:'absolute',right:'10px'}} startIcon={<RestartAltIcon />}>
                RE-RENDER
                </Button>
            </div>

        );

    }  
  
});

export default RenderBiasCard;
