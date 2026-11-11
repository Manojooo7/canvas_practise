import { useEffect, useRef } from "react"

function App() {

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
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

  const saveCanvasImage = () =>{
    const canvas = canvasRef.current;
    if(!canvas) return
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a')
    link.href = dataUrl;
    link.download = 'canvas.png';
    link.click()
  }

  const clearCanvas = () =>{
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d')
    if(!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  console.log(canvasRef.current)
  return (
    <>
      <div className="flex w-screen h-screen bg-slate-100 overflow-hidden">
        {/* <div className="flex justify-between align-middle items-center mt-5 gap-7">
          <button onClick={saveCanvasImage} className="bg-blue-500 text-white px-5 py-2 rounded-sm">Download</button>
          <button onClick={clearCanvas} className="bg-blue-500 text-white px-5 py-2 rounded-sm">Clear</button>
        </div> */}
       <canvas ref={canvasRef}
        className="block w-full h-full bg-white"/>
      </div>
    </>
  )
}

export default App
