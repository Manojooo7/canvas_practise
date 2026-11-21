type Ctx = CanvasRenderingContext2D;
type Point = {x:number, y:number};

export const BOX_SHAPES = {

    line:(p, a, b)=>{
        p.moveTo(
            a.x,
            a.y,)
        p.lineTo(
            b.x,
            b.y
        )
    },

    square: (p,a,b)=>{
        p.rect(
            a.x,
            a.y,
            b.x - a.x,
            b.y - a.y
        );
    },

    circle:(p,a,b) =>{
        // const rx = Math.abs(b.x - a.x) / 2;
        // const ry = Math.abs(b.y - a.y) / 2;

        // if(rx === 0 || ry === 0) return;
        // ctx.beginPath();

        p.ellipse(
            (a.x + b.x) / 2,
            (a.y + b.y) / 2,
            Math.abs(b.x - a.x) / 2,
            Math.abs(b.y - a.y) / 2,
            0,
            0,
            Math.PI * 2
        );
    },

    triangle:(p,a,b)=>{
        p.moveTo((a.x + b.x) / 2, a.y),
        p.lineTo(b.x, b.y)
        p.lineTo(a.x, b.y)
        p.closePath()
    },

    rightangletriangle:(p,a,b)=>{
        
        p.moveTo(a.x, a.y),
        p.lineTo(b.x, b.y)
        p.lineTo(a.x, b.y)
        p.closePath()
    },


    diamond:(p,a,b)=>{
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        p.moveTo(mx, a.y),
        p.lineTo(b.x, my)
        p.lineTo(mx, b.y)
        p.lineTo(a.x, my)
        p.closePath()
    },
} satisfies Record<string, (p:Path2D, a:Point, b:Point) => void>

export type BoxTool = keyof typeof BOX_SHAPES

export const isBoxTool = (t: string | null): t is BoxTool => {
    if(t === null) return false
    return t in BOX_SHAPES
}

export type Shape = {id: string; filled: boolean; strok: boolean; fillColor: string, strokColor:string} & (
    | {tool: 'pen'; points: Point[]; closed: boolean}
    | {tool: BoxTool; start: Point; end: Point}
);

const buildPath = (s:Shape):Path2D => {
    const p = new Path2D();
    if(s.tool === 'pen'){
        const pts = s.points;
        p.moveTo(pts[0].x, pts[0].y)
        for(let i = 1; i < pts.length - 1; i++){
            const mx = (pts[i].x + pts[i+1].x) / 2;
            const my = (pts[i].y + pts[i+1].y) / 2;

            p.quadraticCurveTo(
                pts[i].x,
                pts[i].y,
                mx,
                my
            );
        }
        const last = pts[pts.length - 1]
        p.lineTo(last.x, last.y);
        if(s.closed) p.closePath();
        return p;
    }
    BOX_SHAPES[s.tool](p, s.start, s.end)
    return p
}

// ponytail: manual invalidation; anything that mutates a shape's geometry must call invalidatePath(s)
const pathCache = new WeakMap<Shape, Path2D>();
export const invalidatePath = (s: Shape) => pathCache.delete(s);
const getPath = (s: Shape) => {
    let p = pathCache.get(s);
    if (!p) pathCache.set(s, (p = buildPath(s)));
    return p;
}


// type ShapeFn = (ctx: Ctx, x: number, y: number, startX: number, startY: number) => void

// const SHAPES:Record<string, ShapeFn> = {
//     line: drawingLine,
//     square: drawingRectangle,
//     circle: drawingCircle,
//     triangle: drawingTriangle,
//     rightangletriangle: drawingRightangleTriange,
//     diamond: drawingDiamond,
// }


export const drawShape = (
    ctx: Ctx,
    s: Shape
) =>{
    const path = getPath(s);
    ctx.fillStyle = ctx.strokeStyle = s.strokColor;
    if(s.filled && (s.tool !== 'pen' || s.closed)) ctx.fill(path);
    if(s.strok) ctx.stroke(path)
}

const hitCtx = document.createElement('canvas').getContext('2d')!;
hitCtx.lineWidth = 20;

export const hitTest = (s:Shape, x:number, y:number) =>{
    const path = getPath(s);
    return (s.filled && s.tool !== 'pen' && hitCtx.isPointInPath(path, x, y)) || hitCtx.isPointInStroke(path, x, y)
}

export const moveShape = (s:Shape, dx:number, dy:number) => {
    
    console.log("GrabShape:", s);
    
    if(s.tool === 'pen') s.points.forEach(p => {p.x += dx; p.y += dy});
    else{s.start.x += dx; s.start.y += dy; s.end.x += dx; s.end.y += dy}
    invalidatePath(s);
}
