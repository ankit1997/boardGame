import { Graphics, Polygon } from 'pixi.js';

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
  public polygon: Polygon;
  constructor(
    public id: number,
    public owner: number,
    public x: number,
    public y: number,
    public r: number,
    public type: string
  ) {}

  draw(graphics: Graphics) {
    this.polygon = build_hexagon(this.x, this.y, this.r);
    graphics.lineStyle(5, 0xeeeeff, 0.3);
    if (this.type == 'land') {
      graphics.beginFill(0x8bd55b);
    }
    graphics.drawPolygon(this.polygon);
    graphics.endFill();
  }
}

export class SeaBlock extends Block {
  private num_ships: number;
  constructor(id: number, owner: number, x: number, y: number, r: number) {
    super(id, owner, x, y, r, 'sea');
    this.num_ships = 0;
  }
}

export class LandBlock extends Block {
  private num_soldiers: number;
  constructor(id: number, owner: number, x: number, y: number, r: number) {
    super(id, owner, x, y, r, 'land');
    this.num_soldiers = 0;
  }
}
