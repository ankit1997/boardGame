import { Container, Loader, SCALE_MODES, Sprite, Texture } from 'pixi.js';

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

    const texture: Texture = resources[this.path].texture;
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;

    this.sprite = new Sprite(texture);

    if (this.type == 'ship') {
      this.sprite.width = 120;
      this.sprite.height = 100;
    } else if (this.type == 'soldier') {
      this.sprite.width = 170;
      this.sprite.height = 160;
    }

    if (this.type == 'ship' || this.type == 'soldier') {
      this.sprite.interactive = false;
      this.sprite
        .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        //.on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);
    }

    this.sprite.anchor.set(0.5);
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    container.addChild(this.sprite);
  }
}

function onDragStart(event) {
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  this.data = event.data;
  // this.alpha = 0.5;
  this.dragging = true;
}

function onDragEnd() {
  // this.alpha = 1;
  this.dragging = false;
  // set the interaction data to null
  this.data = null;
}

function onDragMove() {
  if (this.dragging) {
    const newPosition = this.data.getLocalPosition(this.parent);
    this.x = newPosition.x;
    this.y = newPosition.y;
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
