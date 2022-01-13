import {
  Container,
  Graphics,
  Loader,
  Polygon,
  Sprite,
  Text,
  Texture,
} from 'pixi.js';

const resources = Loader.shared.resources;

const build_hexagon = (x: number, y: number, r: number): Polygon => {
  const pi = Math.PI;
  const COS = r * Math.cos(pi / 3);
  const SIN = r * Math.sin(pi / 3);
  const points = [
    { x: x + COS, y: y + SIN },
    { x: x + r, y: y },
    { x: x + COS, y: y - SIN },
    { x: x - COS, y: y - SIN },
    { x: x - r, y: y },
    { x: x - COS, y: y + SIN },
  ];
  return new Polygon(points);
};

export class Block {
  public id: number;
  public x: number;
  public y: number;
  public r: number;
  public owner: number;
  public polygon: Polygon;
  public numProsperityMarkers: number;

  constructor(public type: string) {}

  drawMarkers(container: Container) {
    if (this.numProsperityMarkers > 0) {
      for (let i = 0; i < this.numProsperityMarkers; i++) {
        this.addProsperityMarker(container, i);
      }
    }
  }

  addProsperityMarker(container: Container, i: number) {
    const texture: Texture =
      resources['assets/images/prosperity_marker.png'].texture;
    const sprite: Sprite = new Sprite(texture);
    sprite.x = this.x - 0.4 * this.r + i * 10;
    sprite.y = this.y - 0.85 * this.r + i * 5;
    sprite.width = 32;
    sprite.height = 32;
    container.addChild(sprite);
  }

  drawText(container: Container, textArray: string[]) {
    if (this.numProsperityMarkers > 0) {
      textArray.unshift('🍎 x ' + this.numProsperityMarkers);
    }
    textArray = this.justifyCenter(textArray);
    const text = textArray.join('\n\n');
    if (text != '') {
      const prosperityMarkerText = new Text(text, {
        fontSize: 12,
      });
      prosperityMarkerText.x = this.x - 0.4 * this.r;
      prosperityMarkerText.y = this.y - 0.7 * this.r;
      container.addChild(prosperityMarkerText);
    }
  }

  justifyCenter(textArray: string[]) {
    const lenArray = textArray.map((text) => text.length);
    if (lenArray.length == 0) {
      return textArray;
    }
    const maxLen = lenArray.reduce((a: number, b: number) => Math.max(a, b));
    const out = [];
    for (let text of textArray) {
      const n = text.length;
      const padding = Math.floor((maxLen - n) / 2);
      out.push(' '.repeat(padding) + text);
    }
    return out;
  }
}

export class SeaBlock extends Block {
  public numShips: number;
  constructor() {
    super('sea');
  }

  draw(graphics: Graphics) {
    this.polygon = build_hexagon(this.x, this.y, this.r);
    graphics.lineStyle(5, 0xeeeeff, 0.3);
    graphics.drawPolygon(this.polygon);
    graphics.endFill();
  }

  drawMarkers(container: Container) {
    super.drawMarkers(container);
  }

  drawText(container: Container): void {
    super.drawText(container, []);
  }
}

export class LandBlock extends Block {
  public numSoldiers: number;
  public numForts: number;
  public numPorts: number;
  public numUniversities: number;
  public numTemples: number;

  constructor() {
    super('land');
  }

  draw(graphics: Graphics) {
    this.polygon = build_hexagon(this.x, this.y, this.r);
    graphics.lineStyle(5, 0xeeeeff, 0.3);
    graphics.beginFill(0xc4a484);
    graphics.drawPolygon(this.polygon);
    graphics.endFill();
  }

  drawMarkers(container: Container) {
    super.drawMarkers(container);
  }

  drawText(container: Container): void {
    const text = [];
    super.drawText(container, text);
  }
}
