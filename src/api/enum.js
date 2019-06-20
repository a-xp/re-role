export const STATUS = {
  NEW: 'NEW',
  STARTED: 'STARTED',
  FINISHED: 'FINISHED'
};

export const TEAM = {
  BAD: 'BAD',
  GOOD: 'GOOD',
  RANDOM: 'RANDOM'
};

export const GAME_TYPE = {
  CLASSIC: 'CLASSIC',
  AVALON: 'AVALON'
};

export const OP_STATUS = {
  PREPARE: 'PREPARE',
  VOTE: 'VOTE',
  PROGRESS: 'PROGRESS',
  REJECTED: 'REJECTED',
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
    isTerminal(status) {
      return status === OP_STATUS.REJECTED || status === OP_STATUS.SUCCESS || status === OP_STATUS.FAIL;
    }
};

export const VOTE = {
  YES: 'YES',
  NO: 'NO'
};