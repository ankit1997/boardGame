import { Container, Graphics, Loader, Polygon, Sprite, Texture } from 'pixi.js';
import { Piece } from './Piece';

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
  public pieces: Piece[] = [];
  public neighbours: number[];

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
    sprite.width = 30;
    sprite.height = 30;
    container.addChild(sprite);
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
}
