import { Container, Loader, Sprite } from 'pixi.js';

const resources = Loader.shared.resources;

export class Piece {
  public path: string;
  public x: number = undefined;
  public y: number = undefined;
  public sprite: Sprite = undefined;

  constructor(public color: string, public type: string) {
    this.path = 'assets/images/' + this.color + '/' + this.type + '.png';
  }

  draw(container: Container) {
    if (this.x == undefined || this.y == undefined) return;
    this.sprite = new Sprite(resources[this.path].texture);
    if (this.type == 'ship') {
      this.sprite.width = 120;
      this.sprite.height = 100;
    } else if (this.type == 'soldier') {
      this.sprite.width = 170;
      this.sprite.height = 160;
    }
    this.sprite.x = this.x - this.sprite.width/2;
    this.sprite.y = this.y - this.sprite.height/2;
    container.addChild(this.sprite);
  }
}

export class Ship extends Piece {
  public x: number = undefined;
  public y: number = undefined;
  constructor(color: string) {
    super(color, 'ship');
  }

  draw(container: Container) {
    super.draw(container);
  }
}

export class Soldier extends Piece {
  public x: number = undefined;
  public y: number = undefined;
  constructor(color: string) {
    super(color, 'soldier');
  }

  draw(container: Container) {
    super.draw(container);
  }
}
