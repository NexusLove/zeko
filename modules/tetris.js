const blocks = [
    "⏹", //0
    "⬜", //1
    "✅" //2
];
const arrows = [
    "◀",
    "▶",
    "🔼",
    "🔽"
]
module.exports = class Tetris {
    constructor(client,user,channel) {
        console.log("INIT")
        this.client = client;
        this.user = user;
        this.channel = channel;

        this.width = 10;
        this.height = 19;
        //generate game logic
        //note: board is 10w, 20h
        this.board = [];
        for(let h=0;h<this.height;h++) {
            this.board[h] = [];
            for(let w=0;w<this.width;w++) {
                this.board[h][w] = 0; //initalize as 0, > 1 is a color
            }
        }
        this.newBlock();
    }
    get size() {
        return {width:this.width,height:this.height};
    }
    print() {
        const _tmp = [];
        for(let h=0;h<this.height;h++) {
            const _tmpRow = [];
            for(let w=0;w<this.width;w++) {
                _tmpRow[w] = blocks[this.board[h][w]] 
            }
            _tmp[h] = _tmpRow.join(" ");
        }
        return `**Score** 0 --- **High Score** 0\n\n` + _tmp.join("\n");
    }
    newBlock() {
        //random location between 0 and this.width - 1
        const verticalLength = getRandomInt(1,4);
        const centerPos = getRandomInt(0,this.width - 1);
        const color = getRandomInt(1,blocks.length-1);
        for(let h=0;h<verticalLength;h++) { //get X (verticalLength) rows from top
            const size = getRandomInt(1,3);
            console.log(verticalLength,h,centerPos)
            this.board[h][centerPos] = color; //todo: generate random # 
            if(size == 2) {
                if(Math.random > .5) {
                    const leftAmount = centerPos-1;
                    if(leftAmount < 0) return;
                    //left
                    this.board[h][leftAmount] = color;
                }else{
                    const rightAmount = centerPos+1;
                    if(rightAmount > this.width) return;
                    //right
                    this.board[h][rightAmount] = color;
                }
            }else if(size == 3) {
                const leftAmount = centerPos-1;
                const rightAmount = centerPos+1;
                if(leftAmount >= 0) this.board[h][leftAmount] = color;
                if(rightAmount <= this.width) this.board[h][rightAmount] = color;
            }
        }
        /*this.board[0][2] = 1;
        this.board[1][2] = 1;
        this.board[2][2] = 1;
        this.board[3][2] = 1;*/
        this.next();
    }
    moveDown() {
    }
    next() {
        
        const board = this.print();
        this.channel.send(board)
        .then(m => {
            arrows.reduce((p, e, i) => p.then(async () => {
                await m.react(e)
            }), Promise.resolve());

        })
        .then(m => {
            //awaitReactions
            //then call 
        })
    }
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}