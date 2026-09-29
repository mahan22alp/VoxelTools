type Props={items:string[];onRemove:(item:string)=>void;onCopy:(item:string)=>Promise<void>|void};

export default function SavedCommands({items,onRemove,onCopy}:Props){
  return <section className="saved-panel" aria-label="Saved commands">
    <div className="saved-header"><b>Saved commands</b><span>{items.length}/20</span></div>
    {items.length?<div className="saved-list">{items.map(item=><div className="saved-item" key={item}><code>{item}</code><button onClick={()=>onCopy(item)}>Copy</button><button onClick={()=>onRemove(item)}>Remove</button></div>)}</div>:<p>No saved commands yet.</p>}
  </section>;
}
