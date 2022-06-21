import React, { useEffect, useState } from 'react';
import './App.css';
import { CssBaseline, Grid, AppBar, Box, Typography, Toolbar, Paper, Container, Button, IconButton, InputBase, Divider, Card, CardContent, CardHeader,CardActions,TextField,Stack,Chip,FormControl, InputAdornment,Input} from '@mui/material';
import customStyles from './style';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddBias from './AddBiasCard';



const RenderBiasCard= React.memo((props) =>{
    // const bias_types= props.bias_types;
    const bias_glossary=props.bias_glossary;
    const cssStyles_imported= customStyles();
    const onBiasUpdate=props.biasUpdate;

    const backgroundColors = ["green", "red", "blue","#7D3C98","#E74C3C","#B7950B"];

    
    const [reRender,setRerender]= useState(props.reRender);


    // create a state variable with the bias_types
    const [bias_types,setBiasTypes]=useState(props.bias_types);

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

    // expand icon toggle
    const [expandIcon,setExpandIcon]=useState(false);

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
    const [wordInputValue, setWordInputValue] = useState(all_input_propts);

    function handleInputChange(event,index) {
        // console.log(index)
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
        e.stopPropagation();
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
        e.stopPropagation();
   
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

    // show the add bias card on click of the add bias button
    const [showAddBiasModule,setshowAddBiasModule]=useState(false);
    const showAddBiasCard= (e)=>{
        setshowAddBiasModule(true);
    };

    // hide the add bias card and update new bias values upon update on addBias card
    const hideAddBiasCard= (newBias)=>{
        console.log(newBias);
        // set new bias type
        const newType={
            'subgroup': newBias.subgroups,
            'type': newBias.name,
        }
        bias_types.push(newType);

        // set represnetative words
        for(let i=0;i<newBias.repWords.length;i++){
            bias_glossary_map.set(newBias.subgroups[i],newBias.repWords[i]);
        }
        
        setBias_glossary_map(bias_glossary_map);
        setBiasTypes(bias_types);
        setshowAddBiasModule(false);
    };

    // convert to array from map
    const convert_map_to_list= () =>{
        var new_glossary_map=[]

        bias_types.map((bias)=>{
            bias.subgroup.map((sbg)=>{
                var obj={
                    'word':sbg,
                    'type':bias.type,
                    'group': bias_glossary_map.get(sbg)
                }
                new_glossary_map.push(obj);

            });

        });
        return new_glossary_map;

    };

    const onChartRerender= (e)=>{
        const new_map=convert_map_to_list();
        const updatedBiasData={
            'biasTypes':bias_types,
            'biasGlossary':new_map,
        }
        onBiasUpdate(updatedBiasData);
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
                            <span class="dot" style={{backgroundColor: backgroundColors[bias_types.indexOf(element)]}}></span>
                            Bias Type: {element.type} 
                            {showSubGroup[bias_types.indexOf(element)]?
                                <IconButton edge="start" color="inherit" size="small" 
                                style={{position: 'relative',float:'right'}}  onClick={(e)=>{hideSubgroupRender(e,bias_types.indexOf(element))}}>                   
                                    <ExpandLessIcon style={{color: 'darkgrey'}}/>
                                </IconButton>
                                :
                                <IconButton edge="start" color="inherit" size="small" 
                                style={{position: 'relative',float:'right'}} onClick={(e)=>{handleSubgroupRender(e,bias_types.indexOf(element))}}>      
                                    <ExpandMoreIcon style={{color: 'darkgrey'}} />
        
                                </IconButton>
                            }
                            {/* <IconButton edge="start" color="inherit" size="small" 
                            style={{position: 'absolute',right:'0px'}}
                            onClick= {(e) => {handleBiasDelete(e,element.type);}}
                            >
                                <DeleteIcon style={{color: 'darkgrey', fontSize:'1.0rem'}} />
                            </IconButton>                         */}
                        </div>} 
                            style={{padding: '5px', paddingLeft:'18px',paddingTop:'8px',paddingBottom:'0px'}}
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
                            <Button varient='contained' className={cssStyles_imported.biasFooter_2} onClick= {(e) => {handleBiasDelete(e,element.type);}}
                                startIcon={<DeleteIcon className={cssStyles_imported.biasViz_2}/>} color="error">
                                    Delete
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
            {
                (showAddBiasModule)?
                <AddBias updateandhide={hideAddBiasCard}></AddBias>
                :
                <></>
            }
            <div style={{position:'relative',margin:'5px'}}>
                <Button variant="contained" style={{backgroundColor:'#e6e6e6',color: 'black', fontSize:'0.9rem',paddingLeft:'20px'}} startIcon={<AddIcon />}
                onClick={(e)=>{showAddBiasCard(e)}} 
                >
                ADD NEW BIAS
                </Button>
                <Button variant="contained"  style={{backgroundColor:'#e6e6e6',color: 'black', fontSize:'0.9rem',paddingLeft:'20px',float:'right'}} startIcon={<RestartAltIcon />}
                onClick={(e)=>{onChartRerender(e)}}>
                RE-RENDER
                </Button>
            </div>
        </>
        );
    }
    else
    {
        return ( 
            <>
            {
                (showAddBiasModule)?
                <AddBias updateandhide={hideAddBiasCard}></AddBias>
                :
                <></>
            }
            <div style={{position:'relative',margin:'5px'}}>
                <Button  variant="contained"  style={{backgroundColor:'#e6e6e6',color: 'black', fontSize:'0.9rem',paddingLeft:'10px'}} startIcon={<AddIcon />}
                 onClick={(e)=>{showAddBiasCard(e)}} 
                >
                ADD NEW BIAS
                </Button>
                <Button variant="contained"  style={{backgroundColor:'#e6e6e6',color: 'black', fontSize:'0.9rem',paddingLeft:'10px',float:'right'}} startIcon={<RestartAltIcon />}
                onClick={(e)=>{onChartRerender(e)}}>
                RE-RENDER
                </Button>
            </div>

            </>

        );

    }  
  
});

export default RenderBiasCard;
