import { Container, Loader, SCALE_MODES, Sprite, Texture } from 'pixi.js';
import { AppComponent } from './app.component';
import { Movement } from './utilities/Movement';

const resources = Loader.shared.resources;

export class Piece {
  public path: string;
  public x: number = undefined;
  public y: number = undefined;
  public sprite: Sprite = undefined;

  constructor(public color: string, public type: string) {
    this.path = 'assets/images/' + this.color + '/' + this.type + '.png';
  }

  draw(container: Container, app: AppComponent) {
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
      this.sprite.buttonMode = true;
      this.sprite
        .on('pointerdown', (event) =>
          onDragStart(this.sprite, event, this.x, this.y)
        )
        .on('pointerup', onDragEnd.bind(this.sprite, app))
        .on('pointerupoutside', onDragEnd.bind(this.sprite, app))
        .on('pointermove', onDragMove);
    }

    this.sprite.anchor.set(0.5);
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    container.addChild(this.sprite);
  }
}

function onDragStart(ref, event, x, y) {
  ref.data = event.data;
  ref.dragging = true;
  ref.startPos = { x: x, y: y };
  console.log('started');
}

function onDragEnd(app: AppComponent) {
  this.dragging = false;
  this.data = null;
  console.log('end');

  // validate if path is correct
  const sourceBlock = app.getBlockAtXY(this.startPos.x, this.startPos.y);
  const targetBlock = app.getBlockAtXY(this.x, this.y);

  // console.log(sourceBlock);
  // console.log(targetBlock);
  const validationResponse = Movement.validateSoldierMovement(
    app.properties,
    app.playerState.id,
    sourceBlock.id,
    targetBlock.id,
    app
  );
  // console.log(validationResponse);
  if (validationResponse == 'NA' || validationResponse == 'NO_PATH') {
    this.x = this.startPos.x;
    this.y = this.startPos.y;
  } else if (validationResponse == undefined) {
  }
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

  draw(container: Container, app: AppComponent) {
    super.draw(container, app);
  }
}

export class Soldier extends Piece {
  public x: number = undefined;
  public y: number = undefined;
  constructor(color: string) {
    super(color, 'soldier');
  }

  draw(container: Container, app: AppComponent) {
    super.draw(container, app);
  }
}
