import {Component,ReactNode} from "react";

type Props={children:ReactNode};
type State={hasError:boolean};

export default class ErrorBoundary extends Component<Props,State>{
  state:State={hasError:false};

  static getDerivedStateFromError():State{
    return {hasError:true};
  }

  render(){
    if(this.state.hasError){
      return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,fontFamily:"system-ui,sans-serif",background:"#fbfaff",color:"#171327"}}>
        <section style={{maxWidth:520,textAlign:"center"}}>
          <div style={{fontSize:11,letterSpacing:2,fontWeight:800,color:"#6d3df5"}}>VOXELTOOLS</div>
          <h1 style={{fontSize:38,margin:"14px 0 10px"}}>Something went wrong.</h1>
          <p style={{color:"#756f86",lineHeight:1.7}}>Reload the page to restore the command workspace.</p>
          <button onClick={()=>window.location.reload()} style={{marginTop:12,padding:"11px 16px",borderRadius:10,border:0,background:"#6d3df5",color:"#fff",fontWeight:700,cursor:"pointer"}}>Reload</button>
        </section>
      </main>;
    }
    return this.props.children;
  }
}
