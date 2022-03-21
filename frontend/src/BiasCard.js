import React, { useEffect, useState } from 'react';
import './App.css';
import { CssBaseline, Grid, AppBar, Box, Typography, Toolbar, Paper, Container, Button, IconButton, InputBase, Divider, Card, CardContent, CardHeader,CardActions,TextField,Stack,Chip,FormControl} from '@mui/material';
import customStyles from './style';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';


function RenderBiasCard(props) {
    const bias_types= props.bias_types;
    const cssStyles_imported= customStyles();

    console.log(bias_types)

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
                            style={{position: 'absolute',right:'0px'}}>
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
                                {subgroup}
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
        </>

        );
      
        
    }
    else
    {

    }  return ( <> </>);
  
}

export default RenderBiasCard;
