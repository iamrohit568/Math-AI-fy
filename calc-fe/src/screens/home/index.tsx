import React, { useEffect, useRef, useState } from "react";
import { SWATCHES } from "@/constants";
import { ColorSwatch, Group } from "@mantine/core";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Draggable from 'react-draggable';
import { Eraser } from 'lucide-react'
import { toast } from "sonner"
//import { Toggle } from "@/components/ui/toggle"
import { Slider } from "@mantine/core"



interface Response {
  expr: string;
  result: string;
  assign: boolean;
}
interface GeneratedResult {
  expression: string;
  answer: string;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('rgba(255,255,255)');
  const [reset, setReset] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [dictOfVars, setDictOfVars] = useState({});
  const [latexExpression, setLatexExpression] = useState<Array<string>>([]);
  const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
  const [lineWidth, setLineWidth] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    if (reset) {
      resetCanvas();
      setReset(false);
      setLatexExpression([]);
      setResult(null);
      setDictOfVars({});
    }
  }, [reset]);



  useEffect(() => {
    if (result) {
      renderLatexToCanvas(result.expression, result.answer);
    }
  }, [result]);

  useEffect(() => {
    if (latexExpression.length > 0 && window.MathJax) {
      setTimeout(() => {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
      }, 0);
    }
  }, [latexExpression]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.lineCap = 'round';
        ctx.lineWidth = lineWidth;
      }
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/config/TeX-MML-AM_CHTML.js';
    script.async = true;
    document.head.appendChild(script);
    script.onload = () => {
      window.MathJax.Hub.Config({
        tex2jax: { inlineMath: [['$', '$'], ['\\(', '\\)']] }
      });
    }
    const preventDefaultTouch = (e: TouchEvent) => {
      if (canvasRef.current && canvasRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", preventDefaultTouch, { passive: false });

    return () => {
      document.head.removeChild(script);
      document.removeEventListener("touchmove", preventDefaultTouch);
    };
  }, []);

  const sendData = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        const response = await axios({
          method: 'post',
          url: `${import.meta.env.VITE_API_URL}/calculate`,
          data: {
            image: canvas.toDataURL('image/png'),
            dict_of_vars: dictOfVars
          }
        });
        const resp = response.data;
        // const databody = {
        //   image: canvas.toDataURL('image/png'),
        //   dict_of_vars: dictOfVars
        // }
        // const response = await fetch("https://calc-be.vercel.app/calculate", {
        //   "headers": {
        //     "accept": "application/json, text/plain, */*",
        //     "accept-language": "en",
        //     "cache-control": "no-cache",
        //     "content-type": "application/json",
        //     "pragma": "no-cache",
        //     "priority": "u=1, i",
        //     "Referer": "https://calc-fe.vercel.app/",
        //     "Referrer-Policy": "strict-origin-when-cross-origin"
        //   },
        //   "body": JSON.stringify(databody),
        //   "method": "POST"
        // });
        // const resp = await response.json();
        console.log(resp.data);
        const satus = resp.status;
        toast(satus, {
          description: "success",
        })
        resp.data.forEach((data: Response) => {
          if (data.assign === true) {
            setDictOfVars({ ...dictOfVars, [data.expr]: data.result });
          }
        });

        const ctx = canvas.getContext('2d');
        const imagedata = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        let minx = canvas.width;
        let miny = canvas.height;
        let maxx = 0;
        let maxy = 0;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            if (imagedata.data[(y * canvas.width + x) * 4 + 3] > 0) {
              if (x < minx) {
                minx = x;
              }
              if (y < miny) {
                miny = y;
              }
              if (x > maxx) {
                maxx = x;
              }
              if (y > maxy) {
                maxy = y;
              }
            }
          }
        }
        const centerX = (minx + maxx) / 2;
        const centerY = (miny + maxy) / 2;
        setLatexPosition({ x: centerX, y: centerY });
        resp.data.forEach((data: Response) => {
          setTimeout(() => {
            setResult({ expression: data.expr, answer: data.result });
          }, 100);
        });
      } catch (e) {
        console.log(e);
        toast("Error", {
          description: "Something went wrong",
        })
      }
    }
  }

  const renderLatexToCanvas = (expression: string, answer: string) => {
    const latex = `${expression} = ${answer}`;
    setLatexExpression([...latexExpression, latex]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.background = 'black';
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
      }
    }
  }

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.background = 'black';
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.touches[0].clientX, e.touches[0].clientY);
        setIsDrawing(true);
      }
    }
  }
  const stopDrawing = () => {
    setIsDrawing(false);
  }
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      return;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (ctx) {

          ctx.lineWidth = lineWidth; // Set the brush or eraser size

          if (isEraser) {
            ctx.globalCompositeOperation = "destination-out"; // Eraser mode
            ctx.strokeStyle = "rgba(0,0,0,1)"; // Set eraser color (it will remove pixels)
          } else {
            ctx.globalCompositeOperation = "source-over"; // Normal drawing mode
            ctx.strokeStyle = color; // Set drawing color
          }

          ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
          ctx.stroke();
        }
      }
    }
  }
  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      return;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = lineWidth;
        if (isEraser) {
          ctx.globalCompositeOperation = "destination-out"; // Eraser mode
          ctx.strokeStyle = "rgba(0,0,0,1)"; // Set eraser color (it will remove pixels)
        } else {
          ctx.globalCompositeOperation = "source-over"; // Normal drawing mode
          ctx.strokeStyle = color; // Set drawing color
        }
        ctx.lineTo(e.touches[0].clientX, e.touches[0].clientY);
        ctx.stroke();
      }
    }
  }
  return (
    <>

<div className="z-20 flex flex-wrap items-center justify-between gap-3 bg-black p-5 outline-dotted outline-white outline-2">
  <Button
    onClick={() => setReset(true)}
    className="bg-red-600 text-white p-2 z-20"
    variant="default"
    color="black"
  >
    Reset
  </Button>

  <Group className="flex gap-2">
    {SWATCHES.map((swatchcolor: string) => (
      <ColorSwatch
        key={swatchcolor}
        color={swatchcolor}
        className="z-20 w-6 h-6 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
        onClick={() => setColor(swatchcolor)}
      />
    ))}
  </Group>

  <div className="z-20 flex items-center gap-2 bg-gray-700 p-2 rounded-md">
    <Button className="z-20 p-1 text-white bg-gray-600 rounded"
    onClick={() => setIsEraser(!isEraser)}
    >
      <Eraser className="h-4 w-4" />
    </Button>

    <Slider
      className="z-20 flex-1 w-10"
      defaultValue={[5]}
      max={20}
      step={1}
      onValueChange={(value) => setLineWidth(value[0])}
    />

    <label className="text-white">{lineWidth}px</label>
  </div>

  <Button
    onClick={sendData}
    className="z-20 bg-green-600 text-white p-2"
    variant="default"
    color="black"
  >
    Calculate
  </Button>
</div>


      <canvas
        ref={canvasRef}
        id='canvas'
        className='absolute top-0 left-0 w-full h-full bg-black'
        onMouseDown={startDrawing}
        onMouseOut={stopDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawingTouch}
        onTouchEnd={stopDrawing}
        onTouchMove={drawTouch}
        onTouchCancel={stopDrawing}

      />
      {latexExpression && latexExpression.map((latex, index) => (
        <Draggable
          key={index}
          defaultPosition={latexPosition}
          onStop={(_e, data) => setLatexPosition({ x: data.x, y: data.y })}
        >
          <div className="absolute p-2 text-white rounded shadow-md">
            <div className="latex-content">{latex}</div>
          </div>
        </Draggable>
      ))}
    </>
  );

}