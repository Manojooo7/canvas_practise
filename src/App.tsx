import { useEffect, useRef, useState } from "react"
import {Pen, Circle, Square, Triangle, Save, RemoveFormatting, type LucideIcon} from 'lucide-react'
import {Button} from '../components/ui/button'
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [selectedTool, setSelectedTool] = useState<string>('pen')
  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const resizeCanvas=()=>{
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // pen styling
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "black"
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas)



    
    const getPosition=(event:MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      return {x, y}
    }

    // Start Drawing

    const startDrawing = (event:PointerEvent) => {
      isDrawing = true;
      canvas.setPointerCapture(event.pointerId);
      
      const {x, y} = getPosition(event);

      lastX = x;
      lastY = y;

      context.beginPath()
      context.moveTo(x,y)
    }

    const draw = (event:MouseEvent) => {
      if(!isDrawing) return;

      const {x, y} = getPosition(event);
      const midX = (lastX + x) / 2;
      const midY = (lastY + y) / 2;

      context.quadraticCurveTo(
        lastX,
        lastY,
        midX,
        midY
      );
      context.stroke();
      lastX = x;
      lastY = y;
    }

    // Stop Drawing

    const stopDrawing=()=>{
      isDrawing = false;
      context.lineTo(lastX, lastY);
      context.stroke();
      context.closePath();
    }

    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', stopDrawing);
    canvas.addEventListener('pointercancel', stopDrawing)
    
    // context.beginPath();
    // context.arc(200, 200, 20, 0, 2 * Math.PI);
    // context.fillStyle = 'red';
    // context.fill();

    return () => {    
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('pointerdown', startDrawing);
      canvas.removeEventListener('pointermove', draw);
      canvas.removeEventListener('pointerup', stopDrawing);
      canvas.removeEventListener('pointercancel', stopDrawing)
    }

  },[]);

  

  const handleToolSelection=(tool:string)=> setSelectedTool(tool)



  console.log()
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
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-300 shadow-2xl p-4 flex justify-center align-middle rounded-sm">
          <div className="flex justify-between align-middle items-center gap-x-7">
            {TOOLS.map((tool) =>{ 
              const Icon = tool.icon
              return(
              <Button variant={'outline'} size={'icon'} onClick={()=> handleToolSelection(tool.label)} 
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
              <Button variant={'outline'} size={'icon'} onClick={action.action} 
              className={`px-5 py-2 rounded-sm 
                ${selectedTool === action.label
                  ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
                  : "bg-white text-black hover:bg-slate-100 hover:text-black"
                }
              `}>
                <Icon size={24}/>
              </Button>
              )
            })}
          </div>
        </div>
       <canvas ref={canvasRef}
        className="block w-full h-full bg-white"/>
      </div>
    </>
  )
}

export default App
