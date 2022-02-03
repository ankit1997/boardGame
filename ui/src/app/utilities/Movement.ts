import { AppComponent } from '../app.component';
import { LandBlock } from '../Block';
import { Properties } from '../Properties';

export class Movement {
  constructor() {}

  static validateSoldierMovement(
    game: Properties,
    playerId: number,
    sourceBlockId: number,
    targetBlockId: number,
    app: AppComponent
  ): string {
    try {
      const sourceBlock: LandBlock =
        game.boardState.board.blocks[sourceBlockId];
      const targetBlock: LandBlock =
        game.boardState.board.blocks[targetBlockId];

      const sourceGroupId = sourceBlock.groupId;
      const targetGroupId = targetBlock.groupId;

      if (sourceGroupId == targetGroupId) return undefined;

      if (
        sourceBlock.type != 'land' ||
        targetBlock.type != 'land' ||
        sourceBlock.owner !== playerId ||
        sourceBlock.numSoldiers <= 0 ||
        sourceGroupId === undefined ||
        targetGroupId === undefined
      ) {
        return 'NA'; // not a valid move
      }

      if (!Movement._pathExists(game, playerId, sourceGroupId, targetGroupId)) {
        return 'NO_PATH';
      }

      // check if target is occupied by another player
      if (targetBlock.owner != undefined && targetBlock.owner != playerId) {
        // app.fight(targetBlock.id, [playerId, targetBlock.owner]);
        return 'FIGHT';
      }

      return undefined;
    } catch (err) {
      console.log(err);
    }

    return '';
  }

  static _pathExists(
    game: Properties,
    playerId: number,
    sourceGroupId: number,
    targetGroupId: number
  ): boolean {
    const sourceGroupBlocks = game.boardState.board.blocks.filter(
      (block: LandBlock) => block.groupId == sourceGroupId
    );

    const targetGroupBlockIds: number[] = game.boardState.board.blocks
      .filter((block: LandBlock) => block.groupId === targetGroupId)
      .map((block: LandBlock) => block.id);

    for (let sourceBlock of sourceGroupBlocks) {
      const visited = new Set();

      const queue: any[] = [];
      queue.push(sourceBlock);

      // level order traversal
      while (queue.length > 0) {
        let size = queue.length;

        while (size-- > 0) {
          let block = queue.shift();
          visited.add(block.id);

          for (let neighId of block.neighbours) {
            const neigh = game.boardState.board.blocks[neighId];
            if (targetGroupBlockIds.includes(neighId)) return true;
            if (visited.has(neighId)) continue;
            if (
              neigh.type !== 'sea' ||
              neigh.owner !== playerId ||
              neigh.numShips <= 0
            )
              continue;
            queue.push(neigh);
          }
        }
      }
    }
  }
}
