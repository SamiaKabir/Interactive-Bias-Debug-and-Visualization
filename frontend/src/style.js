import { makeStyles } from '@mui/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const theme = createTheme();

const customStyles= makeStyles((theme) => ({
  leftRightPanel:{
        height: '100%',
        backgroundColor: '#f5f7f8eb!important',
        maxHeight:'95vh',
        overflow: 'auto!important',
        borderColor: 'darkgrey!important',
        borderWidth: '1.5px!important',
  },
  middlePanels:{
      height: '100%',
      backgroundColor:'#EEEEEE!important',
      borderColor: 'darkgrey!important',
      borderWidth: '1px!important',
      maxHeight:'95vh',
      overflow: 'auto!important',
  },
  middlePanels2:{
    height: '95vh',
    backgroundColor:'white',
    borderColor: 'darkgrey!important',
    borderWidth: '1px!important',
    maxHeight:'95vh',
    overflow: 'auto!important',
},
  biasEditorTitle:{
    // transform: 'rotate(-90deg)',
    color: '#black!important',
    marginTop: '1.5vh!important',
  },
  biasEditorTitleTop:{
    color: '#white!important',
    marginTop: '1vh!important',
    marginLeft: '5vw!important',
    display: 'inline-flex'
  },
  colorPicker:{
    width: '25px',
    height: '25px',
    margin: '0px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'transparent',
    position: 'absolute',
    right:'0px'
  },
  chipStyle:{
    backgroundColor: '#f2f2f2!important',
    margin:'2px!important',
  },
  chartViz:{
    color: 'black!important',
    height:'0.8em!important',
    width:'0.8em!important',
  },
  chartPanel:{
    height:'100%',
    backgroundColor:'#f5f7f8eb!important',
    borderColor:'#00000061'
  },
  barPanel:{
    height:'3%',
    backgroundColor:'#EEEEEE!important',
    marginTop:'0.5%',
    borderColor:'#00000061'
  },
  topicCardStyle:{
    margin:'10px',
    marginBottom:'15px',
    borderRadius:'10px',
    border:'solid 1.5px',
    borderColor:'darkgrey'
  },
  topicCardStyle2:{
    margin:'10px',
    marginBottom:'15px',
    borderRadius:'10px',
    border:'solid 2.5px',
    borderColor:'#1976d2'
  },
  topicFooter:{
    // backgroundColor:'#e6e6e6!important',
    // color:'black!important',
    float:'right!important',
    fontSize:'0.8rem!important',
  },
  biasCardStyle:{
    margin:'15px',
    borderRadius:'2px',
    padding:'10px',
    borderLeft:'solid 4px',
    borderLeftColor:'#cccccc'
  },
  biasViz:{
    color: '#2196f3!important',
    height:'0.8em!important',
    width:'0.8em!important',
  },
  biasFooter:{
    float:'right',
    // margin:'0px',
    // padding:'0px!important',
    // paddingTop:'5px!important',
    // paddingRight:'5px!important',
    fontsize:'0.70rem!important'
  },
  biasViz_2:{
    color: '#d32f2f!important',
    height:'0.8em!important',
    width:'0.8em!important',
  },
  biasFooter_2:{
    float:'right',
    // margin:'0px',
    // padding:'0px!important',
    // paddingTop:'5px!important',
    // paddingRight:'5px!important',
    fontsize:'0.70rem!important'
  },


}));

export default customStyles;