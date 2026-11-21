import { useEffect, useRef, useState } from "react"
import {Pen, Circle, Square, Triangle, Save, RemoveFormatting, type LucideIcon, Diamond, PenLine, TriangleRightIcon, Move} from 'lucide-react'
import {Button} from '../components/ui/button'
import {drawShape, hitTest, invalidatePath, isBoxTool, moveShape, type Shape} from "./shapesDrawer"
type tool = {
  label: string,
  icon: LucideIcon
}

const TOOLS:tool[] = [
  {
    label: "pen",
    icon: Pen
  },
  {
    label: "line",
    icon: PenLine
  },
  {
    label: "circle",
    icon: Circle
  },
  {
    label: "square",
    icon: Square
  },
  {
    label: "triangle",
    icon: Triangle
  },
  {
    label: "rightangletriangle",
    icon: TriangleRightIcon
  },
  {
    label: "diamond",
    icon: Diamond
  },
  {
    label: "move",
    icon: Move
  },  
]

function App() {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const preveiewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const selectedToolRef = useRef<string | null>(selectedTool);
 
  useEffect(() => {
    selectedToolRef.current = selectedTool
  },[selectedTool])
  
  useEffect(()=>{
    const canvas = canvasRef.current;
    const previewCanvas = preveiewCanvasRef.current
    if(!canvas || !previewCanvas) return;

    const context = canvas.getContext('2d');
    const previewCanvasContext = previewCanvas.getContext('2d')
    if (!context || !previewCanvasContext) return;
    
    let draft: Shape | null = null;
    let grabbed: Shape | null = null;
    let isDrawing:boolean = false;
    let lastX:number = 0;
    let lastY:number = 0;
    const shapes: Shape[] = [];
    const clear = (c:CanvasRenderingContext2D, el:HTMLCanvasElement)=> c.clearRect(0, 0, el.clientWidth, el.clientHeight)
    const render = () => {
      clear(context, canvas)
      shapes.forEach(s => drawShape(context, s))
    }

    const resizeCanvas=()=>{
      const rect = canvas.getBoundingClientRect();
      const previewCanvasReact = previewCanvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      const resize = (element:HTMLCanvasElement, rect:DOMRect) => {
        element.width = rect.width * dpr;
        element.height = rect.height * dpr;
        
        const ctx = element.getContext('2d')
        ctx?.setTransform(dpr, 0, 0, dpr, 0, 0); // Need to learn about setTransform
  
        // pen styling
        if(!ctx) return;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "black"
      }

      resize(canvas, rect)
      resize(previewCanvas, previewCanvasReact)
      render() // Without calling render each time resize event will fire untill i redraw something on the canvas which eventually call the render funciton again will so nothing on the canvas
      
    }
    let raf = 0;

    const onResize=()=>{
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(resizeCanvas)
    }
    
    const getPosition=(event:MouseEvent) => {
      const rect = previewCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      return {x, y}
    }

    // Start Drawing

    const startDrawing = (event:PointerEvent) => {
      isDrawing = true;
      previewCanvas.setPointerCapture(event.pointerId);
      
      const {x, y} = getPosition(event);
      const tool = selectedToolRef.current;
      
      if(tool === 'move'){
        grabbed = [...shapes].reverse().find(s => hitTest(s, x, y)) ?? null;
        lastX = x;
        lastY = y;
        return;
      }

      const base = {
        id: crypto.randomUUID(),
        filled: false,
        strok: true,
        fillColor: '#000',
        strokColor: '#000'
      }


      if(tool === 'pen') draft = {...base, tool, closed: false, points:[{x,y}]}
      else if(isBoxTool(tool)) draft = {...base, tool, start:{x,y}, end:{x,y}}
      
      // startX = x;
      // startY = y;

      // lastX = x;
      // lastY = y;

      // context.beginPath()
      // context.moveTo(x,y)
    }
    console.log(shapes);
    

    const draw = (event:MouseEvent) => {
      if(!isDrawing) return;
      const p = getPosition(event);
      
      if(grabbed){
        moveShape(grabbed, p.x - lastX, p.y - lastY);
        lastX = p.x;
        lastY = p.y;
        render();
        return;
      }

      if(!draft) return;
      if(draft.tool === 'pen') draft.points.push(p);
      else draft.end = p
      invalidatePath(draft)

      console.log("Draft: ", draft);
      console.log("Shapes: ", shapes);
      console.log("Grab: ", grabbed)
      

      clear(previewCanvasContext, previewCanvas)
      drawShape(previewCanvasContext, draft)
    }

    // Stop Drawing

    const stopDrawing=(event:PointerEvent)=>{
      if(!isDrawing) return;
      isDrawing = false;
      grabbed = null;
      if(draft){
        shapes.push(draft);
        draft = null;
        clear(previewCanvasContext, previewCanvas)
        render() 
      }
    }
    
    window.addEventListener('resize', onResize)
    previewCanvas.addEventListener('pointerdown', startDrawing);
    previewCanvas.addEventListener('pointermove', draw);
    previewCanvas.addEventListener('pointerup', stopDrawing);
    previewCanvas.addEventListener('pointercancel', stopDrawing)
    
    // context.beginPath();
    // context.arc(200, 200, 20, 0, 2 * Math.PI);
    // context.fillStyle = 'red';
    // context.fill();

    return () => {    
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
      previewCanvas.removeEventListener('pointerdown', startDrawing);
      previewCanvas.removeEventListener('pointermove', draw);
      previewCanvas.removeEventListener('pointerup', stopDrawing);
      previewCanvas.removeEventListener('pointercancel', stopDrawing)
    }

  },[]);

  

  const handleToolSelection=(tool:string)=> setSelectedTool(tool)



  // console.log(selectedTool)
  const saveCanvasImage = () =>{
    const canvas = canvasRef.current
    if(!canvas) return
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a')
    link.href = dataUrl;
    link.download = 'canvas.png';
    link.click()
  }

  const clearCanvas = () =>{
    const canvas = preveiewCanvasRef.current;
    const context = canvas?.getContext('2d')
    if(!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  

type ACTION = {
  label: string,
  icon: LucideIcon,
  action: () => void,
}

const ACTIONS:ACTION[] = [
  {
    label: "save",
    icon: Save,
    action: saveCanvasImage
  },
  {
    label: "clear",
    icon: RemoveFormatting,
    action: clearCanvas
  }
]
  return (
    <>
      <div className="w-screen h-screen bg-slate-100 overflow-hidden relative">
        <canvas ref={canvasRef}
        className="inset-0 absolute w-full h-full bg-white"/>
       <canvas ref={preveiewCanvasRef}
        className="inset-0 absolute w-full h-full"/>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-300 shadow-2xl p-4 flex justify-center align-middle rounded-sm">
          <div className="flex justify-between align-middle items-center gap-x-7">
            {TOOLS.map((tool) =>{ 
              const Icon = tool.icon
              return(
              <Button key={tool.label} variant={'outline'} size={'icon'} onClick={()=> handleToolSelection(tool.label)} 
              className={`px-5 py-2 rounded-sm 
                ${selectedTool === tool.label
                  ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
                  : "bg-white text-black hover:bg-slate-100 hover:text-black"
                }
              `}>
                <Icon size={24}/>
              </Button>
              )
            })}

            {ACTIONS.map((action) =>{ 
              const Icon = action.icon
              return(
              <Button 
                variant={'outline'} 
                size={'icon'} 
                onClick={action.action} 
                className={`px-5 py-2 rounded-sm 
                  ${selectedTool === action.label
                    ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
                    : "bg-white text-black hover:bg-slate-100 hover:text-black"
                  }
                `}
                key={action.label}
              >
                <Icon size={24}/>
              </Button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
