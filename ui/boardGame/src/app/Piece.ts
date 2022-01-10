import { Container, Loader, Sprite } from 'pixi.js';

const resources = Loader.shared.resources;

export class Piece {
  public path: string;
  constructor(public color: string, public type: string) {
    this.path = 'assets/images/' + this.color + '/' + this.type + '.png';
  }

  draw(container: Container) {
    const sprite = new Sprite(resources[this.path].texture);
    if (this.type == 'ship') {
      sprite.width = 120;
      sprite.height = 100;
    }
    container.addChild(sprite);
  }
}

export class Ship extends Piece {
  constructor(color: string) {
    super(color, 'ship');
  }
}

export class Soldier extends Piece {
  constructor(color: string) {
    super(color, 'soldier');
  }
}
