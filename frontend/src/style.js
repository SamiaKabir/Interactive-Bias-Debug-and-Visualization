import { makeStyles } from '@mui/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const theme = createTheme();

const customStyles= makeStyles((theme) => ({
  leftRightPanel:{
        height: '100%',
        backgroundColor: '#476072eb!important',
        maxHeight:'95vh',
        overflow: 'auto!important',
        // backgroundColor: '#476072b8!important'
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
    transform: 'rotate(-90deg)',
    color: '#ededed!important',
    marginTop: '75vh!important'
  },
  biasEditorTitleTop:{
    color: '#ededed!important',
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
    backgroundColor: '#e9f6fb!important'
  },
  chartViz:{
    color: '#1976d2!important',
    height:'0.8em!important',
    width:'0.8em!important',
  },
  chartPanel:{
    height:'96.5%',
    backgroundColor:'#EEEEEE!important',
    borderColor:'#00000061'

  },
  barPanel:{
    height:'3%',
    backgroundColor:'#EEEEEE!important',
    marginTop:'0.5%',
    borderColor:'#00000061'
  },
  topicFooter:{
    float:'right',
    margin:'0px',
    "&:hover": {
      background: '#1976d20a!important',
      borderRadius:'0px',
    },
    "&:active": {
      background: '#1976d20a!important',
      borderRadius:'0px',
    },
    "&:after": {
      background: '#1976d20a!important',
      borderRadius:'0px',
    },
  },
  biasCardStyle:{
    margin:'15px',
    borderRadius:'2px',
    padding:'10px',
    borderLeft:'solid 4px',
    borderLeftColor:'#b6dce7'
  },
  biasViz:{
    color: '#3c9934!important',
    height:'0.8em!important',
    width:'0.8em!important',
  },
  biasFooter:{
    float:'right',
    margin:'0px',
    padding:'0px!important',
    paddingTop:'5px!important',
    paddingRight:'5px!important',
    fontsize:'0.70rem!important'
  },


}));

export default customStyles;