import { Component, OnInit } from '@angular/core';
import { Application, Graphics, Loader } from 'pixi.js';
import { MessageService } from 'primeng/api';
import { BackendService } from './backend.service';
import { Block, LandBlock, SeaBlock } from './Block';
import { Bid, BoardState, God } from './BoardState';
import { Properties } from './Properties';

// Aliases
const loader = Loader;
const resources = Loader.shared.resources;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService],
})
export class AppComponent implements OnInit {
  public gameInitialized: boolean = false;
  private app: Application;
  public properties: Properties;
  private graphics = new Graphics();
  private blockList: Block[] = [];
  public playerState: PlayerState = new PlayerState();
  public cardWidth: number = 70;
  public cardHeight: number = 90;
  public currentBid: Bid = new Bid();
  private prevBidGod: God = null;

  public COLORS = ['red', 'yellow', 'green', 'blue', 'black'];
  public COLOR_DOTS = {
    red: '🔴',
    yellow: '🟡',
    green: '🟢',
    blue: '🔵',
    black: '⚫',
  };

  constructor(
    private messageService: MessageService,
    private backendService: BackendService
  ) {}

  ngOnInit(): void {
    if (!this.gameInitialized) {
      this.properties = new Properties();

      this.properties.playersInfo = [];

      const player1 = new PlayerInfo(this.COLORS[0]);
      player1.id = 0;
      player1.name = 'Ankit';
      const player2 = new PlayerInfo(this.COLORS[1]);
      player2.id = 1;
      player2.name = 'Shivam';
      const player3 = new PlayerInfo(this.COLORS[2]);
      player3.id = 2;
      player3.name = 'Nikhil';
      const player4 = new PlayerInfo(this.COLORS[3]);
      player4.id = 3;
      player4.name = 'Priyam';
      this.properties.playersInfo = [player1, player2, player3, player4];

      this.properties.stage = Stages.NOT_STARTED;
    }
  }

  initialize_game() {
    if (
      this.properties.playersInfo.find(
        (playerInfo: PlayerInfo) =>
          playerInfo.name == null ||
          playerInfo.name == undefined ||
          playerInfo.name == ''
      ) != undefined
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Provide name',
      });
      return;
    }
    if (this.properties.playersInfo.length < 4) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Minimum 4 players required',
      });
      return;
    }
    this.properties.gameId = 'id' + new Date().getTime();
    this.backendService
      .initializeGame(this.properties.gameId, this.properties.playersInfo)
      .subscribe(
        (result: any) => {
          if (result.success) {
            console.log('Your token is ' + result.token);
            this.playerState.name = this.properties.playersInfo[0].name;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Game started successfully',
            });
            this.init_properties(result.game);
          } else {
            console.log(result);
          }
        },
        (error: any) => {
          console.log(error);
        }
      );
  }

  joinGame() {
    this.backendService
      .joinGame(
        this.properties.gameId,
        this.playerState.name,
        this.playerState.token
      )
      .subscribe(
        (result: any) => {
          if (result.success) {
            if (!this.playerState.token) {
              this.playerState.token = result.token;
            }
            console.log('Your token is ' + result.token);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Game started successfully',
            });
            this.init_properties(result.game);
          } else {
            console.log(result);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: result.message,
            });
          }
        },
        (error: any) => {
          console.log(error);
        }
      );
  }

  init_properties(response: any) {
    this.properties = new Properties();
    this.properties.width = response.width;
    this.properties.height = response.height;
    this.properties.block_r = response.block_r;
    this.properties.numPlayers = response.numPlayers;
    this.properties.playersInfo = response.playersInfo;
    this.properties.stage = Stages.NOT_STARTED;
    this.properties.gold = response.gold;
    this.properties.prosperity_markers = response.prosperity_markers;
    this.properties.territory_markers = response.territory_markers;
    this.properties.priests = response.priests;
    this.properties.philosophers = response.philosophers;
    this.properties.soldiers = response.soldiers;
    this.properties.ships = response.ships;
    const boardState = new BoardState();
    boardState.turn = 0;
    boardState.bids = [
      {
        god: God.APOLLO,
        maxBidAmount: undefined,
        maxBidPlayerId: undefined,
      },
      {
        god: God.ZEUS,
        maxBidAmount: undefined,
        maxBidPlayerId: undefined,
      },
      {
        god: God.ARES,
        maxBidAmount: undefined,
        maxBidPlayerId: undefined,
      },
      {
        god: God.POSEIDON,
        maxBidAmount: undefined,
        maxBidPlayerId: undefined,
      },
      {
        god: God.ATHENA,
        maxBidAmount: undefined,
        maxBidPlayerId: undefined,
      },
    ];
    this.properties.boardState = boardState;

    const playerId = Number.parseInt(Object.keys(response.players)[0]);
    this.playerState = response.players[playerId];

    this.gameInitialized = true;
    this.start();
  }

  start() {
    if (
      this.properties.playersInfo.find(
        (playerInfo: PlayerInfo) =>
          playerInfo.name == null ||
          playerInfo.name == undefined ||
          playerInfo.name == ''
      ) != undefined
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Provide name',
      });
      return;
    }

    this.gameInitialized = true;

    this.app = new Application({
      width: this.properties.width,
      height: this.properties.height,
      backgroundAlpha: 1.0,
      backgroundColor: 0x1099bb,
    });

    document.getElementById('board').appendChild(this.app.view);

    loader.shared
      .add([
        // 'assets/images/ocean.jpeg',
        // 'assets/images/soldier.png',
        // 'assets/images/land.png',
        // 'assets/images/ares.png',
        // 'assets/images/poseidon.png',
        // 'assets/images/athena.png',
        // 'assets/images/apollo.png',
        // 'assets/images/zeus.png',
        'assets/images/red/ship.png',
        'assets/images/blue/ship.png',
        'assets/images/green/ship.png',
        'assets/images/yellow/ship.png',
        'assets/images/black/ship.png',
      ])
      .load(this.setup_board.bind(this));

    this.app.renderer.view.addEventListener('click', (e) =>
      this.mark_as_land(e.x, e.y)
    );
  }

  process_step() {
    for (let player_id in this.properties.playersInfo) {
      let info = this.properties.playersInfo[player_id];
      info['name'] = info['name'] + ' ' + this.COLOR_DOTS[info['color']];
    }
  }

  setup_board() {
    this.graphics.lineStyle(0);
    this.graphics.beginFill(0x05d0eb);
    this.graphics.drawRect(0, 0, this.properties.width, this.properties.height);
    this.graphics.endFill();

    // Draw ellipse for the playing area
    this.graphics.lineStyle(10, 0xeeeeff, 0.3);
    const h = this.properties.width / 2,
      a = h;
    const k = this.properties.height / 2,
      b = k;
    this.graphics.drawEllipse(h, k, a - 10, b - 10);
    this.graphics.endFill();

    const isInsideGameArea = (x: number, y: number, r: number) => {
      // checks if a point is inside playing area ellipse
      const theta = Math.atan2(y - k, x - h);
      x += r * Math.cos(theta);
      y += r * Math.sin(theta);
      return (
        Math.pow(x - h, 2) / Math.pow(a, 2) +
          Math.pow(y - k, 2) / Math.pow(b, 2) <=
        1
      );
    };

    const r = this.properties.block_r;
    let s = 0;
    let id = 0;
    let vjump = r * Math.cos(Math.PI / 6);
    let hjump = r * Math.sin(Math.PI / 6);
    for (let y = r; y < this.properties.height; y += vjump, s++) {
      for (
        let x = this.properties.width / 2 + (s % 2 == 0 ? 0 : r + hjump);
        x < this.properties.width;
        x += 3 * r
      ) {
        if (!isInsideGameArea(x, y, r)) break;
        const seaBlock = new SeaBlock(id++, undefined, x, y, r);
        seaBlock.draw(this.graphics);
        this.blockList[seaBlock.id] = seaBlock;
      }
      for (
        let x = this.properties.width / 2 - (s % 2 == 0 ? 3 * r : r + hjump);
        x >= 0;
        x -= 3 * r
      ) {
        if (!isInsideGameArea(x, y, r)) break;
        const seaBlock = new SeaBlock(id++, undefined, x, y, r);
        seaBlock.draw(this.graphics);
        this.blockList[seaBlock.id] = seaBlock;
      }
    }

    this.app.stage.addChild(this.graphics);
  }

  mark_as_land(x: number, y: number) {
    if (this.properties.stage !== Stages.NOT_STARTED) {
      console.log('Game already started, cannot mark block as land now');
      return;
    }

    let blocks = this.blockList.filter(
      (block) => block.type == 'sea' && block.polygon.contains(x, y)
    );

    if (blocks == undefined || blocks.length == 0) return;

    const block = blocks[0];

    const landBlock = new LandBlock(
      block.id,
      undefined,
      block.x,
      block.y,
      block.r
    );
    landBlock.draw(this.graphics);
    this.blockList[block.id] = landBlock;
  }

  dice(): number {
    return Math.floor((Math.random() - 0.0000001) * 4);
  }

  placeBid(oldBid: Bid) {
    console.log(oldBid);
    console.log(this.currentBid);
    // bid validations
    if (
      this.currentBid.maxBidAmount == undefined ||
      this.currentBid.maxBidAmount == null ||
      this.currentBid.maxBidAmount <= 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No bid provided',
      });
      return;
    }
    if (
      oldBid.maxBidAmount != undefined &&
      this.currentBid.maxBidAmount <= oldBid.maxBidAmount
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Must bid higher than ' + oldBid.maxBidAmount,
      });
      return;
    }
    if (this.currentBid.maxBidAmount > this.playerState.gold) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Insufficient funds',
      });
      return;
    }
    if (
      this.prevBidGod != null &&
      this.prevBidGod != undefined &&
      this.prevBidGod == this.currentBid.god
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot bid again on ' + this.prevBidGod,
      });
      return;
    }
  }

  addPlayer() {
    if (this.properties.playersInfo.length >= 5) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Max 5 players allowed',
      });
      return;
    }
    console.log(this.properties.playersInfo);
    if (
      this.properties.playersInfo.find(
        (playerInfo: PlayerInfo) =>
          playerInfo.name == null ||
          playerInfo.name == undefined ||
          playerInfo.name == ''
      ) != undefined
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Provide name',
      });
      return;
    }
    this.properties.playersInfo.push(
      new PlayerInfo(this.COLORS[this.properties.playersInfo.length])
    );
    console.log(this.properties.playersInfo);
  }
}

export enum Stages {
  NOT_STARTED,
  STARTED,
}

export class Player {}

export class PlayerState {
  token: string;
  id: number;
  name: string;
  color: string;
  gold: number;
  prosperity_markers: number;
  priests: number;
  philosophers: number;
}

export class PlayerInfo {
  public id: number;
  public name: string = '';
  constructor(public color: string) {}
}
