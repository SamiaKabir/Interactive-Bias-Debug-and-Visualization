import React, { useEffect, useState } from 'react';
import './App.css';
import { CssBaseline, Grid, AppBar, Box, Typography, Toolbar, Paper, Container, Button, IconButton, InputBase, Divider, Card, CardContent, CardHeader,CardActions,TextField,Stack,Chip,FormControl, InputAdornment,Input} from '@mui/material';
import customStyles from './style';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Switch from '@mui/material/Switch';
import AddBias from './AddBiasCard';
import * as d3 from 'd3';



const RenderBiasCard= React.memo((props) =>{
    const bias_glossary=props.bias_glossary;
    const bias_glossary_send=props.bias_glossary_send;
    const cssStyles_imported= customStyles();
    const onBiasUpdate=props.biasUpdate;
    const receiveBiasUpdate=props.receiveBiasUpdate;

    // create a state variable with the bias_types
    const [bias_types,setBiasTypes]=useState(props.bias_types);

    //hide or show card contents based on enable switch
    const [enableBiasType, setenableBiasType]= useState(props.enableDisable);

    console.log(props.bias_types)
    console.log(props.bias_glossary)

    //  // Read in Bias types
    // useEffect(() => {
    // d3.json("/bias_types").then((d) => {
    //     setBiasTypes(d);
    // });
    // return () => undefined;
    // }, []);
    // console.log(bias_types)


    const backgroundColors = ["green", "red", "blue","#7D3C98","#E74C3C","#B7950B"];

    
    const [reRender,setRerender]= useState(props.reRender);


    

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

    // convert the bias glossary to a javascript map
    var bias_glossary_map_init_2= new Map();

    if(bias_glossary_send){
        Object.keys(bias_glossary_send).map(function(key) {
            bias_glossary_map_init_2.set(bias_glossary_send[key].word,bias_glossary_send[key].group)
        });
    }

    
    // let bias_types_new = JSON.parse(JSON.stringify(bias_types));
    // let bias_glossary_map_init_2= new Map(JSON.parse(JSON.stringify(Array.from(bias_glossary_map_init))));

    // console.log(bias_glossary_map_init_2)
    
    // keep two send copys that will be modified on disable
    // const [bias_types_send_copy, setbiasTypesSendCopy]=useState(bias_types_new)
    // const [bias_glossary_send_copy,setGlossarySendCopy]=useState(bias_glossary_map_init_2)

    const [bias_types_send_copy, setbiasTypesSendCopy]=useState(props.bias_types_send)
    const [bias_glossary_send_copy,setGlossarySendCopy]=useState(bias_glossary_map_init_2)

    // console.log(bias_types_send_copy)
    // console.log(bias_glossary_send_copy)



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
        bias_glossary_send_copy.get(word).splice(indx,1);
        setGlossarySendCopy(bias_glossary_send_copy);
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
            bias_glossary_send_copy.get(word).push(wordInputValue[index]);
            setGlossarySendCopy(bias_glossary_send_copy)
            bias_glossary_map.get(word).push(wordInputValue[index]);
            setBias_glossary_map(bias_glossary_map);
            

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
        bias_glossary_send_copy.delete(word);
        setBias_glossary_map(bias_glossary_map);
        setGlossarySendCopy(bias_glossary_send_copy)
        // delete from bias types
        bias_types.map((obj)=>{
            if(obj.type==bias){
                var index2=obj.subgroup.indexOf(word);
                obj.subgroup.splice(index2,1);

            }
        });

        setBiasTypes(bias_types);

        // delete from bias types_send_copy
        bias_types_send_copy.map((obj)=>{
            if(obj.type==bias){
                var index2=obj.subgroup.indexOf(word);
                obj.subgroup.splice(index2,1);

            }
        });
        setbiasTypesSendCopy(bias_types_send_copy)
        // delete from render prompts
        // render_prompts.splice(indx,1);
        forceUpdate();
    };

    // Delete a bias disable from send copy
    const handleBiasDelete = (bias) => {
        // e.stopPropagation();

        // delete from subgroup glossary
        bias_types_send_copy.map((element)=>{
            if(element.type==bias){
                element.subgroup.map((sbgroups)=>{
                    bias_glossary_send_copy.delete(sbgroups);
                    setGlossarySendCopy(bias_glossary_send_copy);
                    // delete from render prompts
                    // render_prompts.splice(render_prompts.indexOf(sbgroups),1);
                    });
                }
            });

        // delete from bias types
        var index2= -1;
        bias_types_send_copy.map((obj)=>{
            if(obj.type==bias){
                index2=bias_types_send_copy.indexOf(obj);
            }
        });

        if(index2>-1){
            bias_types_send_copy.splice(index2,1);
            setbiasTypesSendCopy(bias_types_send_copy);
        }
        // delete from wordinput
        forceUpdate();
    };

    // add bias on enable on send copy
    const handleBiasAddEnable = (bias) => {

        // add bias types
        var index2= -1;
        var object_to_add
        bias_types.map((obj)=>{
            if(obj.type==bias){
                index2=bias_types.indexOf(obj);
                object_to_add=JSON.parse(JSON.stringify(obj))
            }
        });

        if(index2>-1){
            bias_types_send_copy.splice(index2,0,object_to_add);
            setbiasTypesSendCopy(bias_types_send_copy);
        }
        
        console.log(bias_types_send_copy)
        console.log(bias_glossary_send_copy)

        // add subgroup glossary
        bias_types_send_copy.map((element)=>{
        if(element.type==bias){
            element.subgroup.map((sbgroups)=>{
                console.log(sbgroups)
                bias_glossary_send_copy.set(sbgroups,bias_glossary_map.get(sbgroups));
                setGlossarySendCopy(bias_glossary_send_copy);
               
                });
            }
        });

        console.log(bias_glossary_send_copy)

        
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

        // add enable disable option for new card
        enableBiasType.push(true);
        setenableBiasType(enableBiasType);

        // set new bias type
        const newType={
            'subgroup': newBias.subgroups,
            'type': newBias.name,
        }
        bias_types.push(newType);
        bias_types_send_copy.push(newType)

        // set represnetative words
        for(let i=0;i<newBias.repWords.length;i++){
            bias_glossary_map.set(newBias.subgroups[i],newBias.repWords[i]);
            bias_glossary_send_copy.set(newBias.subgroups[i],newBias.repWords[i]);
        }
        
  
        
        setBias_glossary_map(bias_glossary_map);
        setBiasTypes(bias_types);
        setGlossarySendCopy(bias_glossary_send_copy);
        setbiasTypesSendCopy(bias_types_send_copy);
        setshowAddBiasModule(false);

        forceUpdate();

    };

    // convert to array from map
    const convert_map_to_list= (types,glossary) =>{
        var new_glossary_map=[]

        // console.log(bias_glossary_send_copy)
        types.map((bias)=>{
            bias.subgroup.map((sbg)=>{
                        var obj={
                            'word':sbg,
                            'type':bias.type,
                            'group':glossary.get(sbg)
                        }
                        new_glossary_map.push(obj);
        
                    });
            
        });
        return new_glossary_map;

    };

    const onChartRerender= (e)=>{
        var anyTrue=false

        enableBiasType.forEach((e)=>{
            if(e)
                anyTrue=true
        });
        
        const new_map=convert_map_to_list(bias_types_send_copy,bias_glossary_send_copy);
        const new_map_2=convert_map_to_list(bias_types,bias_glossary_map);
        const updatedBiasData={
            'biasTypes':bias_types_send_copy,
            'biasGlossary':new_map,
            'biasTypesOriginal':bias_types,
            'biasGlossaryOriginal':new_map_2,
            'enableBias': enableBiasType,
        }
        if(anyTrue)
            onBiasUpdate(updatedBiasData);
        else
           ;
    };

    // set the initial value of the state variable
    // all_subgroups=[]
    // bias_types.map((element)=>{
    //     all_subgroups.push(true);
    // });

    // //hide or show card contents based on enable switch
    // const [enableBiasType, setenableBiasType]= useState(props.enableDisable);

    const handleEnableDisableRender=(e,index,bias) =>{
        console.log(bias_glossary_send_copy)
        enableBiasType[index]=e.target.checked;
        setenableBiasType(enableBiasType);
        forceUpdate();
        if(!e.target.checked){
            handleBiasDelete(bias);
            forceUpdate();
        }
        if(e.target.checked){
            handleBiasAddEnable(bias);
            forceUpdate();
        }
        var anyTrue=false

        enableBiasType.forEach((e)=>{
            if(e)
                anyTrue=true
        });
        const new_map=convert_map_to_list(bias_types_send_copy,bias_glossary_send_copy);
        const updatedBiasData={
            'biasTypes':bias_types_send_copy,
            'biasGlossary':new_map,
            'enableBias': enableBiasType,
        }
        if(anyTrue)
            receiveBiasUpdate(updatedBiasData);
        
    }

    // enable disable switch
    const AntSwitch = styled(Switch)(({ theme }) => ({
        width: 28,
        height: 16,
        marginLeft:'3px',
        marginRight:'3px',
        padding: 0,
        display: 'flex',
        '&:active': {
          '& .MuiSwitch-thumb': {
            width: 15,
          },
          '& .MuiSwitch-switchBase.Mui-checked': {
            transform: 'translateX(9px)',
          },
        },
        '& .MuiSwitch-switchBase': {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(12px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              opacity: 1,
              backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
            },
          },
        },
        '& .MuiSwitch-thumb': {
          boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
          width: 12,
          height: 12,
          borderRadius: 6,
          transition: theme.transitions.create(['width'], {
            duration: 200,
          }),
        },
        '& .MuiSwitch-track': {
          borderRadius: 16 / 2,
          opacity: 1,
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
          boxSizing: 'border-box',
        },
      }));

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
                        <div style={{position:'relative',fontSize:'1.1rem'}}>
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
                        {(enableBiasType[bias_types.indexOf(element)])?
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
                                                <Chip label={keys} 
                                                sx={{
                                                    "& .MuiChip-label": {
                                                      fontSize:'1.1em'
                                                    }
                                                  }}
                                                variant="outlined" 
                                                className={cssStyles_imported.chipStyle}
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
                        :
                        <></>
                        }
                        <Divider variant="middle"  sx={{marginBottom:'5px'}}/>
                        <CardActions style={{padding:"0px"}}>
                            <div style={{position:'relative',width:'100%'}}>
                            {/* <Button variant="outlined" className={cssStyles_imported.biasFooter} onClick={(e)=>{hideSubgroupRender(e,bias_types.indexOf(element))}}
                                startIcon={<DoneIcon className={cssStyles_imported.biasViz}/>} color="primary">
                                    Update
                            </Button> */}
                            <Button variant="outlined" className={cssStyles_imported.biasFooter_2} 
                            // onClick= {(e) => {handleBiasDelete(e,element.type);}}
                                // startIcon={<DeleteIcon className={cssStyles_imported.biasViz_2}/>} 
                                color="primary"
                                >
                                     {/* Delete */}
                                     <Stack direction="row" spacing={1}  alignItems="center">
                                        {/* Disable */}
                                        <AntSwitch checked={enableBiasType[bias_types.indexOf(element)]} inputProps={{ 'aria-label': 'ant design' }} onChange={(e)=>{handleEnableDisableRender(e,bias_types.indexOf(element),element.type)}} />
                                        Enable
                                    </Stack>
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
                <Button variant="contained" color="primary" style={{fontSize:'0.75vw',paddingLeft:'20px'}} startIcon={<AddIcon />}
                onClick={(e)=>{showAddBiasCard(e)}} 
                >
                ADD NEW BIAS
                </Button>
                <Button variant="contained" color="primary" style={{fontSize:'0.75vw',paddingLeft:'20px',float:'right'}} startIcon={<RestartAltIcon />}
                onClick={(e)=>{onChartRerender(e)}}>
                UPDATE
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
                <Button  variant="contained" color="primary" style={{fontSize:'0.75vw',paddingLeft:'10px'}} startIcon={<AddIcon />}
                 onClick={(e)=>{showAddBiasCard(e)}} 
                >
                ADD NEW BIAS
                </Button>
                <Button variant="contained"  color="primary" style={{fontSize:'0.75vw',paddingLeft:'10px',float:'right'}} startIcon={<RestartAltIcon />}
                onClick={(e)=>{onChartRerender(e)}}>
                UPDATE
                </Button>
            </div>

            </>

        );

    }  
  
});

export default RenderBiasCard;
