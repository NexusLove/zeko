const blocks = [
    "⏹", //0
    "⬜", //1
    "✅" //2
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
    }
    get size() {
        return [this.width,this.height];
    }
    print() {
        const _tmp = [];
        for(let h=0;h<this.height;h++) {
            const _tmpRow = [];
            for(let w=0;w<this.width;w++) {
                _tmpRow[w] = (this.board[h][w] == 0) ? "⏹" : "[ ]";
            }
            _tmp[h] = _tmpRow.join(" ");
        }
        return `**Score** 0 --- **High Score** 0\n\n` + _tmp.join("\n");
    }
}