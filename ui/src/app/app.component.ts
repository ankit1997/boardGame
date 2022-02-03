import { Component, OnInit } from '@angular/core';
import { Application, Graphics, Loader, Sprite, Texture } from 'pixi.js';
import { MessageService } from 'primeng/api';
import { BackendService } from './backend.service';
import { Block, LandBlock, SeaBlock } from './Block';
import { Bid, BoardState, God } from './BoardState';
import { Piece } from './Piece';
import { Properties } from './Properties';
import { Bidding } from './utilities/Bidding';

// Aliases
const loader = Loader;
// const resources = Loader.shared.resources;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService],
})
export class AppComponent implements OnInit {
  public gameInitialized: boolean = false;
  public app: Application;
  public properties: Properties;
  public graphics = new Graphics();
  public blockList: any[] = [];
  public playerState: PlayerState = new PlayerState();
  public cardWidth: number = 80;
  public cardHeight: number = 110;
  public currentBid: Bid = new Bid();
  public GODS = God;
  public doneCounter: number;
  public buyCardCounter: number;
  public blockUI: boolean = false;
  public diceOutput: number = -1;

  public COLORS = ['red', 'yellow', 'green', 'blue', 'black'];
  public COLOR_DOTS = {
    red: '🔴',
    yellow: '🟡',
    green: '🟢',
    blue: '🔵',
    black: '⚫',
  };

  public numPlayers = 0;
  public numProsperityMarkers: number = 0;
  public setupAction: string = 'LAND';
  public setupBtnLabel: string = 'Mark Land';
  public setActionMenu: any[] = [];
  public placingSoldier: boolean = false;
  public placingShip: boolean = false;
  public placingBuilding: string = '';

  public selectedMarker: any;

  constructor(
    public messageService: MessageService,
    public backendService: BackendService
  ) {}

  ngOnInit(): void {
    if (!this.gameInitialized) {
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
      const player5 = new PlayerInfo(this.COLORS[4]);
      player5.id = 4;
      player5.name = 'Vibhor';
      this.properties = new Properties(4);
      this.properties.playersInfo = [];
      this.properties.playersInfo = [
        player1,
        player2,
        player3,
        player4,
        player5,
      ];
      this.numPlayers = this.properties.playersInfo.length;

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
    this.backendService.socket.on('info', (message: string) => {
      this.messageService.add({
        severity: 'info',
        summary: 'Update',
        detail: message,
      });
    });
    //
    this.backendService.socket.on('boardState', (board: any) => {
      this.blockUI = true;
      this.doneCounter = 0;
      this.buyCardCounter = 0;
      // console.log(board);
      this.setProperties(board);
      this.blockUI = false;
    });
  }

  initializeGame() {
    this.validateGame();
    if (this.properties.playersInfo.length < 4) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Minimum 4 players required',
      });
      return;
    }
    this.backendService.initialize(
      this.properties.width,
      this.properties.height,
      this.properties.playersInfo
    );
    this.onInitialization();
  }

  validateGame() {
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
  }

  onInitialization() {
    this.setActionMenu = [
      {
        label: 'Mark Land',
        command: () => {
          this.setupBtnLabel = 'Mark Land';
          this.numProsperityMarkers = 0;
          this.setupAction = 'LAND';
        },
      },
      {
        label: 'Mark Sea',
        command: () => {
          this.setupBtnLabel = 'Mark Sea';
          this.setupAction = 'SEA';
        },
      },
      {
        label: 'Red markers',
        visible: this.numPlayers > 0,
        command: () => {
          this.setupBtnLabel = 'Red markers';
          this.setupAction = 'RED';
        },
      },
      {
        label: 'Yellow markers',
        visible: this.numPlayers > 1,
        command: () => {
          this.setupBtnLabel = 'Yellow markers';
          this.setupAction = 'YELLOW';
        },
      },
      {
        label: 'Green markers',
        visible: this.numPlayers > 2,
        command: () => {
          this.setupBtnLabel = 'Green markers';
          this.setupAction = 'GREEN';
        },
      },
      {
        label: 'Blue markers',
        visible: this.numPlayers > 3,
        command: () => {
          this.setupBtnLabel = 'Blue markers';
          this.setupAction = 'BLUE';
        },
      },
      {
        label: 'Black markers',
        visible: this.numPlayers > 4,
        command: () => {
          this.setupBtnLabel = 'Black markers';
          this.setupAction = 'BLACK';
        },
      },
      {
        label: 'Done',
        command: () => {
          this.setupAction = undefined;
          this.finishSetup();
        },
      },
      {
        label: 'Done & Save',
        command: () => {
          this.setupAction = undefined;
          this.finishSetup(true);
        },
      },
    ];
  }

  joinGame() {
    this.backendService.authenticate(
      this.properties.gameId,
      this.playerState.name,
      this.playerState.token
    );
  }

  setProperties(response: any) {
    this.properties = new Properties(response.numPlayers);
    this.properties.gameId = response.gameId;
    this.properties.creator = response.creator;
    this.properties.width = response.width;
    this.properties.height = response.height;
    this.properties.block_r = response.block_r;
    this.properties.numPlayers = response.numPlayers;
    this.properties.playersInfo = response.playersInfo;
    this.properties.players = response.players;
    this.properties.stage = Stages.NOT_STARTED;
    this.properties.gold = response.gold;
    this.properties.prosperity_markers = response.prosperity_markers;
    this.properties.territory_markers = response.territory_markers;
    this.properties.priests = response.priests;
    this.properties.philosophers = response.philosophers;
    this.properties.soldiers = response.soldiers;
    this.properties.ships = response.ships;
    this.properties.logs = response.logs;

    const boardState = new BoardState();
    boardState.stage = response.boardState.stage;
    boardState.turnOrder = response.boardState.turnOrder;
    boardState.turn = response.boardState.turn;
    boardState.bids = response.boardState.bids;
    boardState.board = response.boardState.board;
    boardState.fight = response.boardState.fight;
    this.properties.boardState = boardState;

    const playerId = Number.parseInt(Object.keys(response.players)[0]);
    this.playerState = response.players[playerId];

    if (!this.gameInitialized) {
      this.onInitialization();
      this.start();
    } else if (boardState.stage == 'SETUP') {
      this.onInitialization();
      this.setup_board();
    } else {
      this.setup_board();
      this.handleInteractions(boardState);
    }
  }

  handleInteractions(boardState) {
    if (!this.gameInitialized) {
      console.log('game not initialized');
      return;
    }
    for (let block of this.blockList) {
      for (let piece of block.pieces) {
        if (piece && piece.sprite) {
          piece.sprite.interactive = false;
        }
      }
    }
    if (
      boardState.stage == 'ACTION' &&
      boardState.turn == this.playerState.id
    ) {
      if (this.playerState.prevBidGod == 'ARES') {
        let piecesArray = this.blockList
          .filter(
            (block) =>
              block &&
              block.type == 'land' &&
              block.owner == this.playerState.id &&
              block.pieces &&
              block.pieces.length > 0
          )
          .map((block) => block.pieces);
        for (let pieces of piecesArray) {
          pieces.forEach((piece) => {
            if (piece.type == 'soldier') {
              piece.sprite.interactive = true;
            }
          });
        }
      } else if (this.playerState.prevBidGod == 'POSEIDON') {
        let piecesArray = this.blockList
          .filter(
            (block) =>
              block &&
              block.type == 'sea' &&
              block.owner == this.playerState.id &&
              block.pieces &&
              block.pieces.length > 0
          )
          .map((block) => block.pieces);
        for (let pieces of piecesArray) {
          pieces.forEach((piece: Piece) => {
            if (piece.type == 'ship') {
              piece.sprite.interactive = true;
            }
          });
        }
      }
    }
  }

  start() {
    this.validateGame();

    this.app = new Application({
      width: this.properties.width,
      height: this.properties.height,
      backgroundAlpha: 1.0,
      backgroundColor: 0x1099bb,
    });
    this.app.stage.interactive = true;
    this.app.stage.hitArea = this.app.renderer.screen;

    document.getElementById('board').appendChild(this.app.view);

    loader.shared
      .add([
        'assets/images/red/ship.png',
        'assets/images/blue/ship.png',
        'assets/images/green/ship.png',
        'assets/images/yellow/ship.png',
        'assets/images/black/ship.png',
        'assets/images/red/soldier.png',
        'assets/images/blue/soldier.png',
        'assets/images/green/soldier.png',
        'assets/images/yellow/soldier.png',
        'assets/images/black/soldier.png',
        'assets/images/prosperity_marker.png',
        'assets/images/dotted_square.png',
        'assets/images/fort.png',
      ])
      .load(this.setup_board.bind(this));

    this.app.renderer.view.addEventListener('click', (e) => {
      // console.log('clicked');
      if (window.scrollY !== 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please scroll to the top before clicking on board',
        });
        return;
      }
      // During setup stage, update the board
      if (this.properties.boardState.stage == 'SETUP') {
        // get block at the clicked location
        const block = this.getBlockAtXY(e.x, e.y);
        if (block == undefined) return;

        if (this.setupAction == 'LAND') {
          // mark block as land
          this.backendService.setup(block.id, 'LAND', undefined);
        } else if (this.setupAction == 'SEA') {
          // mark block as sea
          this.backendService.setup(block.id, 'SEA', {
            numProsperityMarkers: this.numProsperityMarkers,
          });
        } else if (
          this.COLORS.findIndex(
            (col: string) => col.toUpperCase() == this.setupAction
          ) != -1
        ) {
          // add ship or soldier on the block
          let playerInfo = this.properties.getPlayerByColor(this.setupAction);
          if (playerInfo == undefined) return;
          this.addSoldierOrShip(playerInfo.id, block);
        }
      } else if (this.properties.boardState.stage == 'ACTION') {
        const block: Block = this.getBlockAtXY(e.x, e.y);
        if (this.placingSoldier) {
          this.placeSoldier(block);
          this.placingSoldier = false;
        } else if (this.placingShip) {
          this.placeShip(block);
          this.placingShip = false;
        } else if (this.placingBuilding != '') {
          let obj = {};
          switch (this.placingBuilding) {
            case 'FORT': {
              obj['fortBlockId'] = block.id;
              break;
            }
            case 'PORT': {
              obj['portBlockId'] = block.id;
              break;
            }
            case 'TEMPLE': {
              obj['templeBlockId'] = block.id;
              break;
            }
            case 'UNIVERSITY': {
              obj['universityBlockId'] = block.id;
              break;
            }
          }
          if (Object.keys(obj).length != 0) {
            this.backendService.action(obj);
          }
          this.placingBuilding = '';
        }
      }
    });
  }

  addSoldierOrShip(playerId, block) {
    // called during setup stage
    const obj = {
      playerId: playerId,
    };

    if (block.type == 'land') {
      obj['soldiers'] = this.placingSoldier ? 1 : 0;
    } else if (block.type == 'sea') {
      obj['ships'] = this.placingShip ? 1 : 0;
    }

    this.backendService.setup(block.id, 'PLAYER', obj);
  }

  placeSoldier(block: Block) {
    this.backendService.action({
      soldierBlockId: block.id,
    });
  }

  placeShip(block: Block) {
    this.backendService.action({
      shipBlockId: block.id,
    });
  }

  process_step() {
    for (let player_id in this.properties.playersInfo) {
      let info = this.properties.playersInfo[player_id];
      info['name'] = info['name'] + ' ' + this.COLOR_DOTS[info['color']];
    }
  }

  setup_board() {
    this.diceOutput = -1;
    this.placingBuilding = '';
    this.placingShip = false;
    this.placingSoldier = false;

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
        landBlock.numSoldiers = block.numSoldiers;
        landBlock.numForts = block.numForts;
        landBlock.numPorts = block.numPorts;
        landBlock.numUniversities = block.numUniversities;
        landBlock.numTemples = block.numTemples;
        landBlock.numProsperityMarkers = block.numProsperityMarkers;
        landBlock.draw(this.graphics);
        this.blockList[block.id] = landBlock;
      }
    }

    this.app.stage.addChild(this.graphics);

    for (let block of this.blockList) {
      // > draw markers
      block.drawMarkers(this.app.stage);

      // > draw ships
      if (block.type == 'sea' && block.numShips > 0 && block.owner >= 0) {
        for (let i = 0; i < block.numShips; i++) {
          const owner = this.properties.getPlayerById(block.owner);
          const piece = new Piece(owner.color, 'ship');
          piece.x = block.x + i * 10;
          piece.y = block.y + i * 5;
          block.pieces.push(piece);
        }
      }

      // > draw soldiers
      if (block.type == 'land' && block.numSoldiers > 0 && block.owner >= 0) {
        for (let i = 0; i < block.numSoldiers; i++) {
          const owner = this.properties.getPlayerById(block.owner);
          const piece = new Piece(owner.color, 'soldier');
          piece.x = block.x + i * 10;
          piece.y = block.y;
          block.pieces.push(piece);
        }
      }

      for (let piece of block.pieces) {
        piece.draw(this.app.stage, this);
      }
    }

    this.gameInitialized = true;
    this.handleInteractions(this.properties.boardState);
  }

  /*updateBoard() {
    for (let incomingBlock of this.properties.boardState.board.blocks) {
      const existingBlock: any = this.blockList[incomingBlock.id];

      if (existingBlock == undefined) continue;

      // 1> update prosperity markers
      if (
        existingBlock.numProsperityMarkers !=
          incomingBlock.numProsperityMarkers &&
        incomingBlock.numProsperityMarkers > existingBlock.numProsperityMarkers
      ) {
        const diff =
          incomingBlock.numProsperityMarkers -
          existingBlock.numProsperityMarkers;
        for (
          let i = existingBlock.numProsperityMarkers;
          i < existingBlock.numProsperityMarkers + diff;
          i++
        ) {
          existingBlock.addProsperityMarker(this.app.stage, i);
        }
      }

      // 2> update owners
      if (existingBlock.owner != incomingBlock.owner) {
        existingBlock.owner = incomingBlock.owner;
      }

      // 3> update soldiers and ships
      if (
        existingBlock.type == 'sea' &&
        incomingBlock.type == 'sea' &&
        incomingBlock.numShips != undefined &&
        incomingBlock.numShips >= 0 &&
        existingBlock.numShips !== incomingBlock.numShips
      ) {
        if (incomingBlock.numShips > 0) {
        }

        if (existingBlock.owner != undefined) {
        } else if (incomingBlock.numShips == 0 && existingBlock.numShips != 0) {
        }
        // const color = this.properties.players[existingBlock.owner].color;
      }

      // 4> update buildings
      if (existingBlock.type == 'land') {
        const landBlockObj: LandBlock = existingBlock;
        if (landBlockObj.numForts != incomingBlock.numForts) {
        }
      }
    }
  }*/

  finishSetup(saveFlag: boolean = false) {
    this.backendService.setup(undefined, undefined, { save: saveFlag }, true);
  }

  getBlockAtXY(x: number, y: number): Block {
    let blocks = this.blockList.filter((block) => block.polygon.contains(x, y));
    if (blocks == undefined || blocks.length == 0) return undefined;
    return blocks[0];
  }

  diceRoll() {
    let i = 3;
    while (i-- > 0) {
      this.diceOutput = Math.floor((Math.random() - 0.0000001) * 4);
      var now = new Date().getTime();
      while (new Date().getTime() < now + 600) {}
    }
  }

  placeBid(oldBid: Bid) {
    Bidding.placeBid(oldBid, this);
  }

  addPlayer() {
    this.validateGame();
    if (this.properties.playersInfo.length >= 5) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Max 5 players allowed',
      });
      return;
    }
    this.properties.playersInfo.push(
      new PlayerInfo(this.COLORS[this.properties.playersInfo.length])
    );
    this.numPlayers++;
  }

  removePlayer(color: string) {
    let ind = this.properties.playersInfo.findIndex(
      (pi: PlayerInfo) => pi.color == color
    );
    if (ind != -1) {
      this.properties.playersInfo.splice(ind, 1);
      this.numPlayers--;
    }
  }

  completeAction() {
    if (this.doneCounter < 3) {
      this.doneCounter++; // user has to click "done" few number of times to confirm
    } else {
      this.backendService.action({
        endTurn: true,
      });
      this.doneCounter = 0;
    }
  }

  buyCard(cardName: string) {
    if (this.buyCardCounter < 3) {
      this.buyCardCounter++;
    } else {
      this.backendService.action({
        cardName: cardName,
      });
      this.buyCardCounter = 0;
    }
  }

  // fight(blockId: number, players: number[]) {
  //   if (blockId >= 0 && players && players.length == 2)
  //     this.backendService.fight(blockId, players);
  // }

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
  dice: number;
  soldiers: number;
  ships: number;
  soldiersAdded: number;
  shipsAdded: number;
}

export class PlayerInfo {
  public id: number;
  public name: string = '';
  constructor(public color: string) {}
}
