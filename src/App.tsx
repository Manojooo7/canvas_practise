import { useEffect, useRef, useState } from "react"
import {Pen, Circle, Square, Triangle, Save, RemoveFormatting, type LucideIcon} from 'lucide-react'
import {Button} from '../components/ui/button'
import { darwWithTool} from "./shapesDrawer"
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
]

function App() {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const preveiewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('pen')
  const selectedToolRef = useRef(selectedTool);
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

    let isDrawing = false;
    let startX = 0;
    let startY = 0;

    let lastX = 0;
    let lastY = 0;

    const resizeCanvas=()=>{
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      [canvas, previewCanvas].forEach((element) =>{
        element.width = rect.width * dpr;
        element.height = rect.height * dpr;
        
        const ctx = element.getContext('2d')
        ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  
        // pen styling
        if(!ctx) return;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "black"
      })
      
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas)



    
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
      startX = x;
      startY = y;

      lastX = x;
      lastY = y;

      context.beginPath()
      context.moveTo(x,y)
    }

    const draw = (event:MouseEvent) => {
      if(!isDrawing) return;
      const {x, y} = getPosition(event);
      const tool = selectedToolRef.current;

      if (tool === "pen") {
        darwWithTool(
          tool,
          context,
          x,
          y,
          lastX,
          lastY
        );

        lastX = x;
        lastY = y;
        return;
    }
      // Clear previous preview
      previewCanvasContext.clearRect(
        0,
        0,
        previewCanvas.width,
        previewCanvas.height
      );

      darwWithTool(
        tool, 
        previewCanvasContext, 
        x, 
        y, 
        tool === "pen" ? lastX : startX, 
        tool === "pen" ? lastY : startY,
      )
      lastX = x;
      lastY = y;
    }

    // Stop Drawing

    const stopDrawing=(event:PointerEvent)=>{
      isDrawing = false;
      const {x,y} = getPosition(event)
      const tool = selectedToolRef.current;
      if (tool !== "pen") {
        darwWithTool(
          tool,
          context,
          x,
          y,
          startX,
          startY
        );

        previewCanvasContext.clearRect(
          0,
          0,
          previewCanvas.width,
          previewCanvas.height
        );
      }

      context.closePath();
    }

    previewCanvas.addEventListener('pointerdown', startDrawing);
    previewCanvas.addEventListener('pointermove', draw);
    previewCanvas.addEventListener('pointerup', stopDrawing);
    previewCanvas.addEventListener('pointercancel', stopDrawing)
    
    // context.beginPath();
    // context.arc(200, 200, 20, 0, 2 * Math.PI);
    // context.fillStyle = 'red';
    // context.fill();

    return () => {    
      window.removeEventListener('resize', resizeCanvas)
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
    const canvas = canvasRef.current
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
