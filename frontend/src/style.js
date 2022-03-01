import { makeStyles } from '@mui/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const theme = createTheme();

const customStyles= makeStyles((theme) => ({
  leftRightPanel:{
        height: '100%',
        backgroundColor: '#476072eb!important',
        maxHeight:'100vh',
        overflow: 'auto!important',
        // backgroundColor: '#476072b8!important'
  },
  middlePanels:{
      height: '100%',
      backgroundColor:'#EEEEEE!important',
      borderColor: 'darkgrey!important',
      borderWidth: '1px!important',
  },
  middlePanels2:{
    height: '100vh',
    backgroundColor:'white',
    borderColor: 'darkgrey!important',
    borderWidth: '1px!important',
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
  }


}));

export default customStyles;