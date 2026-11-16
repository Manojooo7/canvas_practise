type Ctx = CanvasRenderingContext2D;

export const drawingWithPen=(
    context:Ctx,
    x:number,
    y:number,
    lastX: number,
    lastY: number
):void =>{
    const midX = (lastX + x) / 2;
    const midY = (lastY + y) / 2;

    context.quadraticCurveTo(
    lastX,
    lastY,
    midX,
    midY
    );
    context.stroke();
}

export const drawingLine=(
    context:Ctx,
    x:number,
    y:number,
    lastX: number,
    lastY: number
):void =>{

    context.beginPath()
    context.moveTo(x,y)
    context.lineTo(
        lastX,
        lastY,
    );
    context.stroke()
}

export const drawingRectangle=(
    context:Ctx,
    x:number,
    y:number,
    lastX: number,
    lastY: number
):void =>{
    const width = x - lastX;
    const height = y - lastY;

    context.strokeRect(
        lastX,
        lastY,
        width,
        height
    );
}

export const drawingCircle=(
    ctx:Ctx,
    x:number,
    y:number,
    startX: number,
    startY: number
):void =>{
    const rx = Math.abs(x - startX) / 2;
    const ry = Math.abs(y - startY) / 2;

    if(rx === 0 || ry === 0) return;
    ctx.beginPath();

    ctx.ellipse(
        (startX + x) / 2,
        (startY + y) / 2,
        rx,
        ry,
        0,
        0,
        Math.PI * 2
    );
    ctx.stroke()
}

export const drawingTriangle=(
    ctx:Ctx,
    x:number,
    y:number,
    startX: number,
    startY: number
):void =>{
    ctx.beginPath();
    ctx.moveTo((startX + x) / 2, startY),
    ctx.lineTo(x, y)
    ctx.lineTo(startX, y)
    ctx.closePath()
    ctx.stroke()
}

export const drawingRightangleTriange=(
    ctx:Ctx,
    x:number,
    y:number,
    startX: number,
    startY: number
):void =>{
    
    ctx.beginPath();
    ctx.moveTo(startX, startY),
    ctx.lineTo(x, y)
    ctx.lineTo(startX, y)
    ctx.closePath()
    ctx.stroke()
}


export const drawingDiamond=(
    ctx:Ctx,
    x:number,
    y:number,
    startX: number,
    startY: number
):void =>{
    let midX = (startX + x) / 2
    let midY = (startY + y) / 2
    ctx.beginPath();
    ctx.moveTo(midX, startY),
    ctx.lineTo(x, midY)
    ctx.lineTo(midX, y)
    ctx.lineTo(startX, midY)
    ctx.closePath()
    ctx.stroke()
}

type ShapeFn = (ctx: Ctx, x: number, y: number, startX: number, startY: number) => void

const SHAPES:Record<string, ShapeFn> = {
    line: drawingLine,
    square: drawingRectangle,
    circle: drawingCircle,
    triangle: drawingTriangle,
    rightangletriangle: drawingRightangleTriange,
    diamond: drawingDiamond,
}


export const darwWithTool = (
    tool: string,
    context:Ctx,
    x:number,
    y:number,
    lastX: number,
    lastY: number
) =>{
    if(tool === 'pen') return drawingWithPen(context, x, y, lastX, lastY);
    SHAPES[tool]?.(context, x, y, lastX, lastY)
}