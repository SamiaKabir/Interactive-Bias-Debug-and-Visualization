import React, { useEffect, useState } from 'react';
import './App.css';
import { CssBaseline, Grid, AppBar, Box, Typography, Toolbar, Paper, Container, Button, IconButton, InputBase, Divider, Card, CardContent, CardHeader,CardActions,TextField,Stack,Chip,FormControl} from '@mui/material';
import customStyles from './style';


function RenderBiasCard(props) {
    const bias_types= props.bias_types;
    const cssStyles_imported= customStyles();

    console.log(bias_types)

    if(bias_types.length>0)
    {
        return bias_types.map((element) => 
            <>
                <Card className={cssStyles_imported.biasCardStyle}>
                
                <CardHeader 
                    title=
                    {
                    <div style={{position:'relative',fontSize:'1.0rem'}}>
                        Bias Type: {element.type} 
                        
                    </div>} 
                        style={{padding: '5px', paddingLeft:'16px',paddingTop:'8px'}}
                />
                <Divider variant="middle" />
                </Card>
            </>

        );
    }
    else
    {

    }  return ( <> </>);
  
}

export default RenderBiasCard;
