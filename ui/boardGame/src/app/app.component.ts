import { Component, OnInit } from '@angular/core';
import { Application, Graphics, Loader } from 'pixi.js';
import { MessageService } from 'primeng/api';
import { BackendService } from './backend.service';
import { Block, LandBlock, SeaBlock } from './Block';
import { Bid, BoardState, God } from './BoardState';
import { Properties } from './Properties';

// Aliases
const loader = Loader;

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
  private blockList: any[] = [];
  public playerState: PlayerState = new PlayerState();
  public cardWidth: number = 70;
  public cardHeight: number = 90;
  public currentBid: Bid = new Bid();
  public GODS = God;

  public COLORS = ['red', 'yellow', 'green', 'blue', 'black'];
  public COLOR_DOTS = {
    red: '🔴',
    yellow: '🟡',
    green: '🟢',
    blue: '🔵',
    black: '⚫',
  };

  public numProsperityMarkers: number = 0;
  public setupAction: string = 'LAND';
  public setActionMenu: any[] = [
    {
      label: 'Mark Land',
      command: () => {
        this.setupAction = 'LAND';
      },
    },
    {
      label: 'Mark Sea',
      command: () => {
        this.setupAction = 'SEA';
      },
    },
    {
      label: 'Prosperity markers',
      command: () => {
        this.setupAction = 'PROSPERITY';
      },
    },
    {
      label: 'Done',
      command: () => {
        this.finishSetup();
      },
    },
  ];

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
    //
    this.backendService.socket.on('error', (message: string) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
      });
    });
    //
    this.backendService.socket.on('boardState', (board: any) => {
      this.set_properties(board);
    });
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
    this.backendService.initialize(this.properties.playersInfo);
  }

  joinGame() {
    this.backendService.authenticate(
      this.properties.gameId,
      this.playerState.name,
      this.playerState.token
    );
  }

  set_properties(response: any) {
    this.properties = new Properties();
    this.properties.gameId = response.gameId;
    this.properties.creator = response.creator;
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
    boardState.stage = response.boardState.stage;
    boardState.turnOrder = response.boardState.turnOrder;
    boardState.turn = response.boardState.turn;
    boardState.bids = response.boardState.bids;
    boardState.board = response.boardState.board;
    this.properties.boardState = boardState;

    const playerId = Number.parseInt(Object.keys(response.players)[0]);
    this.playerState = response.players[playerId];

    if (!this.gameInitialized) {
      this.start();
    } else if (boardState.stage == 'SETUP') {
      this.setup_board();
    }
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
        'assets/images/red/ship.png',
        'assets/images/blue/ship.png',
        'assets/images/green/ship.png',
        'assets/images/yellow/ship.png',
        'assets/images/black/ship.png',
        'assets/images/prosperity_marker.png',
        'assets/images/dotted_square.png',
      ])
      .load(this.setup_board.bind(this));

    this.app.renderer.view.addEventListener('click', (e) => {
      if (this.properties.boardState.stage == 'SETUP') {
        const block = this.getBlockAtXY(e.x, e.y);
        if (block == undefined) return;

        if (this.setupAction == 'LAND') {
          this.backendService.setup(this.properties.gameId, block.id, 'LAND', {
            numProsperityMarkers: this.numProsperityMarkers,
          });
        } else if (this.setupAction == 'SEA') {
          this.backendService.setup(this.properties.gameId, block.id, 'SEA', {
            numProsperityMarkers: this.numProsperityMarkers,
          });
        } else if (this.setupAction == 'PROSPERITY') {
          this.backendService.setup(
            this.properties.gameId,
            block.id,
            'PROSPERITY',
            {
              numProsperityMarkers: this.numProsperityMarkers,
            }
          );
        }
      } else {
      }
    });
  }

  process_step() {
    for (let player_id in this.properties.playersInfo) {
      let info = this.properties.playersInfo[player_id];
      info['name'] = info['name'] + ' ' + this.COLOR_DOTS[info['color']];
    }
  }

  setup_board() {
    this.app.stage.removeChildren();
    //
    this.graphics.lineStyle(0);
    this.graphics.beginFill(0x05d0eb);
    this.graphics.drawRect(0, 0, this.properties.width, this.properties.height);
    this.graphics.endFill();

    // Draw ellipse for the playing area
    this.graphics.lineStyle(10, 0xeeeeff, 0.3);
    this.graphics.drawEllipse(
      this.properties.boardState.board.ellipse.x,
      this.properties.boardState.board.ellipse.y,
      this.properties.boardState.board.ellipse.width,
      this.properties.boardState.board.ellipse.height
    );
    this.graphics.endFill();

    // draw sea blocks
    for (let block of this.properties.boardState.board.blocks) {
      if (block.type == 'sea') {
        const seaBlock = new SeaBlock();
        seaBlock.id = block.id;
        seaBlock.owner = block.owner;
        seaBlock.x = block.x;
        seaBlock.y = block.y;
        seaBlock.r = block.r;
        seaBlock.numShips = block.numShips;
        seaBlock.numProsperityMarkers = block.numProsperityMarkers;
        seaBlock.draw(this.graphics);
        this.blockList[block.id] = seaBlock;
      } else if (block.type == 'land') {
        const landBlock = new LandBlock();
        landBlock.id = block.id;
        landBlock.owner = block.owner;
        landBlock.x = block.x;
        landBlock.y = block.y;
        landBlock.r = block.r;
        landBlock.numProsperityMarkers = block.numProsperityMarkers;
        landBlock.draw(this.graphics);
        this.blockList[block.id] = landBlock;
      }
    }

    this.app.stage.addChild(this.graphics);

    for (let block of this.blockList) {
      block.drawMarkers(this.app.stage);
      //block.drawText(this.app.stage);
    }
  }

  finishSetup() {
    this.backendService.setup(
      this.properties.gameId,
      undefined,
      undefined,
      undefined,
      true
    );
  }

  getBlockAtXY(x: number, y: number): Block {
    let blocks = this.blockList.filter((block) => block.polygon.contains(x, y));
    if (blocks == undefined || blocks.length == 0) return undefined;
    return blocks[0];
  }

  dice(): number {
    return Math.floor((Math.random() - 0.0000001) * 4);
  }

  placeBid(oldBid: Bid) {
    // bid validations
    if (this.properties.boardState.turn != this.playerState.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot bid, invalid turn',
      });
      return;
    }
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
      this.playerState.prevBidGod != null &&
      this.playerState.prevBidGod != undefined &&
      this.playerState.prevBidGod == this.currentBid.god
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot bid again on ' + this.playerState.prevBidGod,
      });
      return;
    }
    this.backendService.placeBid(
      this.properties.gameId,
      this.currentBid.god,
      this.currentBid.maxBidAmount
    );
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

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
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
  prevBidGod: string;
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
