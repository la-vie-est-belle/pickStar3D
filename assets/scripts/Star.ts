import { _decorator, Component } from 'cc';
import { Game } from './Game';
const { ccclass, property } = _decorator;

@ccclass('Star')
export class Star extends Component {   
    // 缩小速度
    @property
    public scaleSpeed = 0.0008;

    // 暂存Game对象的引用
    public game: Game = null!;

    start () {
    }

    reuse (game: Game) {
        this.game = game;
    }

    update (deltaTime: number) {
        // 不断缩小星星
        let x = this.node.scale.x;
        let y = this.node.scale.y;
        let z = this.node.scale.z;

        if (x > 0) {
            this.node.setScale(x-this.scaleSpeed, y-this.scaleSpeed, z-this.scaleSpeed);
        }
    }
}