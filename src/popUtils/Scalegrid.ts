import { Line, Svg, Polyline, Text, SVG, Circle } from '@svgdotjs/svg.js';
import { range, zip } from 'ramda';
interface CustomScale {
  arrDomain: number[];
  arrImage: number[];
  (arg: number): number;
}

const MIN_SHOW_BALL_DISTANCE = 40;

export interface PlotObj {
  name: string;
  domain: number[];
  image: number[];
  polyline: Polyline;
  fnPlot: null | ((x: number) => number);
  trackObj?: {
    ball: Circle;
    text: Text;
  };
  stroke: {
    width: number;
    color: string;
  };
  fill: string;
}

function scaleCreator(arrDomain: number[], arrImage: number[]) {
  const size1 = arrDomain[1] - arrDomain[0];
  const size2 = arrImage[1] - arrImage[0];
  const fnScale = (arg: number) => {
    return (size2 / size1) * (arg - arrDomain[0]) + arrImage[0];
  };
  fnScale.arrDomain = arrDomain;
  fnScale.arrImage = arrImage;
  return fnScale as CustomScale;
}

function inverseScale(fnScale: CustomScale) {
  return scaleCreator(fnScale.arrImage, fnScale.arrDomain);
}

function diffScaleCreator(fnScale: CustomScale) {
  const deltaX = fnScale.arrDomain[1] - fnScale.arrDomain[0];
  const deltaY = fnScale.arrImage[1] - fnScale.arrImage[0];

  return scaleCreator([0, deltaX], [0, deltaY]);
}

function xyScaleCreator(fnBaseScale: CustomScale) {
  const fnScaleX = fnBaseScale;
  const fnScaleY = scaleCreator(fnBaseScale.arrDomain, [
    fnBaseScale.arrImage[1],
    fnBaseScale.arrImage[0],
  ]);
  return (arg: [number, number]) => {
    const x = fnScaleX(arg[0]);
    const y = fnScaleY(arg[1]);
    return [x, y];
  };
}
class ScaleGrid {
  xAxis: Line;
  yAxis: Line;
  size: number[];
  center: number[];
  fnScaleX: CustomScale;
  fnScaleY: CustomScale;
  fnInvScaleX: CustomScale;
  fnInvScaleY: CustomScale;
  mapPlots: Map<string, PlotObj>;
  xData: number[];
  yData: number[];
  scaleX: [number, number];
  scaleY: [number, number];
  nTicks: number;
  arrTicksLines: Line[];
  arrTicksText: Text[];
  constructor(
    public draw: Svg,
    {
      scaleX = [-5, 5] as [number, number],
      scaleY = [-5, 5] as [number, number],
      stroke = { width: 1, color: 'black' },
      xPaddingLeft = 30,
      xPaddingRight = 30,
      yPaddingBottom = 30,
      yPaddingTop = 30,
    }
  ) {
    const size = [draw.cx() * 2, draw.cy() * 2];

    const fnScaleX = scaleCreator(scaleX, [xPaddingLeft, size[0] - xPaddingRight]);
    const fnScaleY = scaleCreator(scaleY, [size[1] - yPaddingBottom, yPaddingTop]);
    const center = [fnScaleX(0), fnScaleY(0)];

    this.xAxis = draw.line(0, center[1], size[0], center[1]).stroke(stroke);
    this.yAxis = draw.line(center[0], 0, center[0], size[1]).stroke(stroke);

    this.center = center;
    this.size = size;
    this.fnScaleX = fnScaleX;
    this.fnScaleY = fnScaleY;
    this.fnInvScaleX = inverseScale(this.fnScaleX);
    this.fnInvScaleY = inverseScale(this.fnScaleY);
    this.mapPlots = new Map();
    this.xData = [];
    this.yData = [];
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.draw = draw;
    this.nTicks = 0;
    this.arrTicksLines = [];
    this.arrTicksText = [];
  }

  plot(
    arrX: number[],
    arrY: number[],
    {
      stroke = {
        width: 2,
        color: '#7777ff',
      },
      name = 'plot1',
      fill = '#00000000',
      fnPlot = null as null | ((x: number) => number),
    } = {}
  ) {
    const plotObj = this.mapPlots.get(name);
    const polyline = plotObj ? plotObj?.polyline : this.draw.polyline().fill(fill);
    const args = this._mapData(arrX, arrY);
    polyline
      .plot(args as any)
      .stroke(stroke)
      .attr('shape-rendering', 'geometricPrecision');
    this.mapPlots.set(name, { polyline, name, fnPlot, domain: arrX, image: arrY, stroke, fill });
    return this;
  }

  plotFn(
    fnPlot: (x: number) => number,
    {
      domain = this.scaleX,
      precision = 300,
      stroke = {
        width: 2,
        color: '#7777ff',
      },
      name = 'plot1',
      fill = '#00000000',
    } = {}
  ) {
    const scale = scaleCreator([0, precision - 1], domain);
    const x = range(0, precision).map(scale);
    const y = x.map(fnPlot);
    return this.plot(x, y, { stroke, name, fill, fnPlot });
  }

  deletePlot(name: string) {
    const objPlot = this.mapPlots.get(name);
    if (!objPlot) {
      return;
    }
    objPlot.polyline.remove();
    this.mapPlots.delete(name);
  }

  _mapData(arrX: number[], arrY: number[]) {
    this.xData = arrX.map((el) => this.fnScaleX(el));
    this.yData = arrY.map((el) => this.fnScaleY(el));
    const args = zip(this.xData, this.yData);
    return args;
  }

  animatePlot(arrX: number[], arrY: number[], { name = 'plot1', duration=500 } = {}) {
    const args2 = this._mapData(arrX, arrY);
    const objPlot = this.mapPlots.get(name);
    if (!objPlot) {
      return this;
    }
    if(objPlot.domain.length===arrX.length && arrY.length===objPlot.image.length){
      objPlot.polyline.animate(duration).plot(args2);
      return this
    }
    return this.plot(arrX, arrY, objPlot);
  }

  animateFn(fnPlot: (x: number) => number, { name = 'plot1' } = {}) {
    const objPlot = this.mapPlots.get(name);
    if (!objPlot) return;
    objPlot.fnPlot = fnPlot;
    this.animatePlot(objPlot.domain, objPlot.domain.map(fnPlot), { name });
  }

  calcAxisTicks<T>(nTicksDensity: number, scaleRange: number[], fnDraw: (n: number) => T) {
    const [minPos, maxPos] = scaleRange.map(Math.floor);
    const nIntervalSize = maxPos - minPos;
    const nRealTicks = nIntervalSize * nTicksDensity + 1;
    const ticksScale = scaleCreator([0, nRealTicks - 1], [minPos, maxPos]);
    const domain = range(0, nRealTicks).map(ticksScale);
    const arrLines = domain.filter((n) => n !== 0).map(fnDraw);
    return arrLines;
  }

  drawTicks({ nTicksDensity = 2, tickSize = 5, stroke = { width: 2, color: 'white' } } = {}) {
    const arrLinesX = this.calcAxisTicks(nTicksDensity, this.scaleX, (n: number) => {
      const centerAxis = this.fnScaleY(0);
      const linePos = this.fnScaleX(n);
      return this.draw
        .line(linePos, centerAxis + tickSize, linePos, centerAxis - tickSize)
        .stroke(stroke);
    });
    const arrLinesY = this.calcAxisTicks(nTicksDensity, this.scaleY, (n: number) => {
      const centerAxis = this.fnScaleX(0);
      const linePos = this.fnScaleY(n);
      return this.draw
        .line(centerAxis - tickSize, linePos, centerAxis + tickSize, linePos)
        .stroke(stroke);
    });

    this.arrTicksLines.push(...arrLinesX);
    this.arrTicksLines.push(...arrLinesY);
    return this;
  }

  drawTicksText(color = '#fff') {
    this.arrTicksText = [];
    const arrTextX = this.calcAxisTicks(2, this.scaleX, (nPosition) => {
      const linePosX = this.fnScaleX(nPosition);
      const [xPos, yPos] = [linePosX, this.center[1] + 15];
      return this.draw.text(String(nPosition)).center(xPos, yPos).attr({ stroke: color });
    });
    const arrTextY = this.calcAxisTicks(2, this.scaleY, (nPosition) => {
      const linePosY = this.fnScaleY(nPosition);
      const [xPos, yPos] = [this.center[0] + 20, linePosY];
      return this.draw.text(String(nPosition)).center(xPos, yPos).attr({ stroke: color });
    });
    return this;
  }

  clearTicks() {
    [...this.arrTicksText, ...this.arrTicksLines].forEach((objSvg) => objSvg.remove());
  }

  addLabel(textX = 'x', textY = 'y', { color = '#fff' } = {}) {
    const xPos = this.fnScaleX(this.scaleX[1] / 2);
    const yPos = this.fnScaleY(0);

    const xPos2 = this.fnScaleX(0);
    const yPos2 = this.fnScaleY(this.scaleY[1] / 2);
    this.draw
      .text(textX)
      .center(xPos, yPos + 40)
      .attr({ stroke: color });
    this.draw
      .text(textY)
      .center(xPos2 - 30, yPos2)
      .attr({ stroke: color })
      .transform({ rotate: -90 });

    return this;
  }

  trackPlot() {
    this.draw.node.addEventListener('mousemove', (event) => {
      const xValue = this.fnInvScaleX(event.offsetX);
      this.mapPlots.forEach((objPlot) => {
        const fx = objPlot.fnPlot?.(xValue);
        if (!fx) return;
        const fxPixels = this.fnScaleY(fx);
        const trackObj = objPlot.trackObj ?? {
          ball: this.draw.circle(10).attr({ stroke: objPlot.stroke }).fill(objPlot.stroke.color),
          text: this.draw.text(fx.toFixed(2)).stroke(objPlot.stroke.color),
        };
        if (Math.abs(fxPixels - event.offsetY) > MIN_SHOW_BALL_DISTANCE) {
          trackObj.ball.attr({ display: 'none' });
          trackObj.text.attr({ display: 'none' });
          return;
        }
        trackObj.ball.center(event.offsetX, fxPixels).attr({ display: 'inline' });
        trackObj.text
          .move(event.offsetX + 7, fxPixels)
          .text(fx.toFixed(2))
          .attr({ display: 'inline' });
        objPlot.trackObj = trackObj;
      });
    });
    return this;
  }
}

export default ScaleGrid;
export { zip, scaleCreator, range, diffScaleCreator, xyScaleCreator, inverseScale };
export type { CustomScale };
