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

type ShapeFn = (ctx: Ctx, x: number, y: number, startX: number, startY: number) => void

const SHAPES:Record<string, ShapeFn> = {
    square: drawingRectangle,
    circle: drawingCircle
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